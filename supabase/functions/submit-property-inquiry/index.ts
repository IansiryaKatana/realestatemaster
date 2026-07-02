import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { clientIp, corsHeaders, enforceRateLimit } from '../_shared/checkoutGuard.ts'
import { loadEmailBrand, sendBrandedEmail } from '../_shared/emailTemplates.ts'
import { agentAlertTemplateName, resolveNotifyNumber, sendWhatsAppNotification } from '../_shared/whatsapp.ts'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined,
    )
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const body = await req.json()
    const propertyId = String(body.property_id ?? '').trim()
    const fullName = String(body.full_name ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const phone = String(body.phone ?? '').trim() || null
    const message = String(body.message ?? '').trim() || null
    const preferredViewingDate = body.preferred_viewing_date || null
    const preferredViewingTime = body.preferred_viewing_time || null
    const interestType = body.interest_type || null
    const requestViewing = body.request_viewing !== false

    if (!propertyId || !fullName || !email) {
      return new Response(JSON.stringify({ error: 'Property, name, and email are required' }), { status: 400, headers: corsHeaders })
    }

    const rate = await enforceRateLimit(admin, 'submit_property_inquiry', clientIp(req), 10, 3600)
    if (!rate.ok) {
      return new Response(JSON.stringify({ error: rate.error }), { status: 429, headers: corsHeaders })
    }

    const { data, error } = await supabase.rpc('rpc_submit_property_inquiry', {
      p_property_id: propertyId,
      p_full_name: fullName,
      p_email: email,
      p_phone: phone,
      p_message: message,
      p_preferred_viewing_date: preferredViewingDate,
      p_preferred_viewing_time: preferredViewingTime,
      p_interest_type: interestType,
      p_request_viewing: requestViewing,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }

    const result = data as { ok?: boolean; error?: string; transaction_id?: string; transaction_number?: string }
    if (!result?.ok) {
      return new Response(JSON.stringify({ error: result?.error ?? 'Submission failed' }), { status: 400, headers: corsHeaders })
    }

    const { data: property } = await admin
      .from('products')
      .select('name, property_reference, assigned_agent_id')
      .eq('id', propertyId)
      .maybeSingle()

    let agentEmail: string | null = null
    let agentNotifyNumber: string | null = null
    if (property?.assigned_agent_id) {
      const { data: agent } = await admin.from('agents').select('email, name, whatsapp, phone').eq('id', property.assigned_agent_id).maybeSingle()
      agentEmail = agent?.email ?? null
      agentNotifyNumber = agent ? resolveNotifyNumber(agent) : null
    }

    const { data: agency } = await admin.from('agency_settings').select('company_email, agency_name').limit(1).maybeSingle()
    const brand = await loadEmailBrand(admin)

    const viewingLine =
      preferredViewingDate || preferredViewingTime
        ? `<br /><strong>Preferred viewing:</strong> ${escapeHtml(String(preferredViewingDate ?? '—'))} ${escapeHtml(String(preferredViewingTime ?? ''))}`
        : ''

    const detailsHtml = `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3d3428;">
      <strong>Property:</strong> ${escapeHtml(property?.name ?? 'Property')}<br />
      <strong>Reference:</strong> ${escapeHtml(property?.property_reference ?? '—')}<br />
      <strong>Client:</strong> ${escapeHtml(fullName)} (${escapeHtml(email)})<br />
      ${phone ? `<strong>Phone:</strong> ${escapeHtml(phone)}<br />` : ''}
      <strong>Transaction:</strong> ${escapeHtml(result.transaction_number ?? '')}${viewingLine}
    </p>
    ${message ? `<p style="margin:0;font-size:14px;line-height:1.6;color:#3d3428;white-space:pre-wrap;">${escapeHtml(message)}</p>` : ''}`

    const subject = requestViewing
      ? `New viewing request — ${property?.name ?? 'Listing'}`
      : `New property inquiry — ${property?.name ?? 'Listing'}`
    const html = `<h2 style="margin:0 0 16px;font-size:20px;color:#3d3428;">${requestViewing ? 'New viewing request' : 'New property inquiry'}</h2>${detailsHtml}`

    const recipients = [agentEmail, agency?.company_email].filter((v): v is string => Boolean(v?.trim()))
    const uniqueRecipients = [...new Set(recipients)]

    for (const to of uniqueRecipients) {
      await sendBrandedEmail({
        to,
        replyTo: email,
        brand,
        subject,
        html,
      })
    }

    if (agentNotifyNumber && requestViewing) {
      const waBody = `New viewing request: ${fullName} for ${property?.name ?? 'property'} (${property?.property_reference ?? '—'}). Phone: ${phone ?? '—'}. Date: ${preferredViewingDate ?? '—'} ${preferredViewingTime ?? ''}`
      await sendWhatsAppNotification({
        to: agentNotifyNumber,
        text: waBody,
        templateName: agentAlertTemplateName(),
        templateParams: [
          fullName,
          property?.name ?? 'Property',
          phone ?? '—',
        ],
      })
    }

    return new Response(
      JSON.stringify({
        ok: true,
        transaction_id: result.transaction_id,
        transaction_number: result.transaction_number,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
