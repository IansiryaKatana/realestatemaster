import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/checkoutGuard.ts'
import { loadEmailBrand, sendBrandedEmail } from '../_shared/emailTemplates.ts'
import {
  sendWhatsAppNotification,
  viewingConfirmedTemplateName,
  viewingDeclinedTemplateName,
} from '../_shared/whatsapp.ts'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatTimeLabel(time: string | null): string {
  if (!time) return '—'
  const [h] = time.split(':')
  const hour = Number(h)
  if (hour < 12) return 'Morning (9am – 12pm)'
  if (hour < 16) return 'Afternoon (12pm – 4pm)'
  return 'Evening (4pm – 7pm)'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const body = await req.json()
    const viewingId = String(body.viewing_id ?? '').trim()
    const action = String(body.action ?? 'approve').trim()

    if (!viewingId) {
      return new Response(JSON.stringify({ error: 'Viewing id is required' }), { status: 400, headers: corsHeaders })
    }

    const scheduledDate = body.scheduled_date ? String(body.scheduled_date) : null
    const scheduledTime = body.scheduled_time ? String(body.scheduled_time) : null
    const isApprove = action === 'approve'
    const isDecline = action === 'decline' || action === 'cancel'
    const status = isApprove ? 'scheduled' : isDecline ? 'cancelled' : 'cancelled'

    const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_agent_update_viewing', {
      p_viewing_id: viewingId,
      p_status: status,
      p_scheduled_date: scheduledDate,
      p_scheduled_time: scheduledTime,
      p_agent_notes: body.agent_notes ? String(body.agent_notes) : null,
    })

    if (rpcError) {
      return new Response(JSON.stringify({ error: rpcError.message }), { status: 400, headers: corsHeaders })
    }

    const rpcResult = rpcData as { ok?: boolean; error?: string }
    if (!rpcResult?.ok) {
      return new Response(JSON.stringify({ error: rpcResult?.error ?? 'Update failed' }), { status: 400, headers: corsHeaders })
    }

    const { data: viewing } = await admin
      .from('viewing_requests')
      .select('*, products(name, property_reference)')
      .eq('id', viewingId)
      .maybeSingle()

    if (!viewing || (!isApprove && !isDecline)) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const property = viewing.products as { name?: string; property_reference?: string } | null
    const clientEmail = viewing.client_email
    const clientPhone = viewing.client_phone
    const clientName = viewing.client_full_name ?? 'Client'
    const dateLabel = viewing.scheduled_date ?? viewing.preferred_date ?? scheduledDate
    const timeLabel = formatTimeLabel(viewing.scheduled_time ?? viewing.preferred_time ?? scheduledTime)

    const brand = await loadEmailBrand(admin)
    const propertyLabel = property?.name ?? 'Property'
    const ref = property?.property_reference ?? '—'

    if (isApprove) {
      const clientHtml = `<h2 style="margin:0 0 16px;font-size:20px;color:#3d3428;">Your viewing is confirmed</h2>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3d3428;">
          Hi ${escapeHtml(clientName)},<br /><br />
          Your viewing for <strong>${escapeHtml(propertyLabel)}</strong> (${escapeHtml(ref)}) has been confirmed.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#3d3428;">
          <strong>Date:</strong> ${escapeHtml(dateLabel ?? 'TBC')}<br />
          <strong>Time:</strong> ${escapeHtml(timeLabel)}
        </p>`

      if (clientEmail) {
        await sendBrandedEmail({
          to: clientEmail,
          brand,
          subject: `Viewing confirmed — ${propertyLabel}`,
          html: clientHtml,
        })
      }

      if (clientPhone) {
        await sendWhatsAppNotification({
          to: clientPhone,
          text: `Hi ${clientName}, your viewing for ${propertyLabel} (${ref}) is confirmed on ${dateLabel ?? 'TBC'} (${timeLabel}). — ${brand.siteName}`,
          templateName: viewingConfirmedTemplateName(),
          templateParams: [clientName, propertyLabel, ref, dateLabel ?? 'TBC', timeLabel],
        })
      }
    } else if (isDecline) {
      const clientHtml = `<h2 style="margin:0 0 16px;font-size:20px;color:#3d3428;">Viewing request update</h2>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3d3428;">
          Hi ${escapeHtml(clientName)},<br /><br />
          Unfortunately we are unable to confirm your viewing for <strong>${escapeHtml(propertyLabel)}</strong> (${escapeHtml(ref)}) at the requested time.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#3d3428;">
          Please reply to this email or contact us to arrange another date.
        </p>`

      if (clientEmail) {
        await sendBrandedEmail({
          to: clientEmail,
          brand,
          subject: `Viewing request update — ${propertyLabel}`,
          html: clientHtml,
        })
      }

      if (clientPhone) {
        await sendWhatsAppNotification({
          to: clientPhone,
          text: `Hi ${clientName}, we could not confirm your viewing for ${propertyLabel} (${ref}). Please contact us to reschedule. — ${brand.siteName}`,
          templateName: viewingDeclinedTemplateName(),
          templateParams: [clientName, propertyLabel, ref],
        })
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
