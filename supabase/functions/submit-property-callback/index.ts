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
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const body = await req.json()
    const propertyId = String(body.property_id ?? '').trim()
    const fullName = String(body.full_name ?? '').trim()
    const phone = String(body.phone ?? '').trim()

    if (!propertyId || !fullName || !phone) {
      return new Response(JSON.stringify({ error: 'Property, name, and phone are required' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const rate = await enforceRateLimit(admin, 'submit_property_callback', clientIp(req), 8, 3600)
    if (!rate.ok) {
      return new Response(JSON.stringify({ error: rate.error }), { status: 429, headers: corsHeaders })
    }

    const { data, error } = await admin.rpc('rpc_submit_property_callback', {
      p_property_id: propertyId,
      p_full_name: fullName,
      p_phone: phone,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }

    const result = data as { ok?: boolean; error?: string }
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
      const { data: agent } = await admin
        .from('agents')
        .select('email, whatsapp, phone, name')
        .eq('id', property.assigned_agent_id)
        .maybeSingle()
      agentEmail = agent?.email ?? null
      agentNotifyNumber = agent ? resolveNotifyNumber(agent) : null
    }

    const { data: agency } = await admin.from('agency_settings').select('company_email, agency_name').limit(1).maybeSingle()
    const brand = await loadEmailBrand(admin)

    const ref = property?.property_reference ?? '—'
    const propertyLabel = property?.name ?? 'Property'
    const whatsappBody = `${fullName} is requesting a callback for ${propertyLabel} (${ref}). Phone: ${phone}`

    const html = `<h2 style="margin:0 0 16px;font-size:20px;color:#3d3428;">Callback request</h2>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3d3428;">
        <strong>Property:</strong> ${escapeHtml(propertyLabel)}<br />
        <strong>Reference:</strong> ${escapeHtml(ref)}<br />
        <strong>Client:</strong> ${escapeHtml(fullName)}<br />
        <strong>Phone:</strong> ${escapeHtml(phone)}
      </p>`

    const recipients = [...new Set([agentEmail, agency?.company_email].filter((v): v is string => Boolean(v?.trim())))]
    for (const to of recipients) {
      await sendBrandedEmail({
        to,
        brand,
        subject: `Callback request — ${propertyLabel}`,
        html,
      })
    }

    if (agentNotifyNumber) {
      await sendWhatsAppNotification({
        to: agentNotifyNumber,
        text: whatsappBody,
        templateName: agentAlertTemplateName(),
        templateParams: [fullName, propertyLabel, phone],
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
