import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno'
import { clientIp, corsHeaders, enforceRateLimit, resolveUserIdFromRequest } from '../_shared/checkoutGuard.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const body = await req.json()
    const invoiceId = typeof body.invoice_id === 'string' ? body.invoice_id : ''
    const transactionId = typeof body.transaction_id === 'string' ? body.transaction_id : ''
    const successUrl = typeof body.success_url === 'string' ? body.success_url : ''
    const cancelUrl = typeof body.cancel_url === 'string' ? body.cancel_url : ''

    if (!invoiceId || !transactionId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'invoice_id, transaction_id, success_url, and cancel_url are required' }),
        { status: 400, headers: corsHeaders },
      )
    }

    const rate = await enforceRateLimit(supabase, 'create_property_checkout', clientIp(req), 8, 3600)
    if (!rate.ok) {
      return new Response(JSON.stringify({ error: rate.error }), { status: 429, headers: corsHeaders })
    }

    const userId = await resolveUserIdFromRequest(req)
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: corsHeaders })
    }

    const { data: enabled } = await supabase.from('site_settings').select('value').eq('key', 'stripe_enabled').maybeSingle()
    if (enabled?.value !== 'true') {
      return new Response(JSON.stringify({ error: 'Stripe checkout is not enabled' }), { status: 400, headers: corsHeaders })
    }

    const { data: secretRow } = await supabase.from('private_settings').select('value').eq('key', 'stripe_secret_key').maybeSingle()
    if (!secretRow?.value) {
      return new Response(JSON.stringify({ error: 'Stripe secret key not configured in admin' }), { status: 400, headers: corsHeaders })
    }

    const { data: tx } = await supabase
      .from('property_transactions')
      .select('id, client_user_id, client_email, status, transaction_number')
      .eq('id', transactionId)
      .maybeSingle()

    if (!tx) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404, headers: corsHeaders })
    }

    const { data: admin } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('auth_user_id', userId)
      .maybeSingle()
    const { data: agent } = await supabase.from('agents').select('id').eq('auth_user_id', userId).maybeSingle()
    const isStaff = (admin?.is_active && ['owner', 'admin'].includes(admin.role)) || agent != null

    if (tx.client_user_id !== userId && !isStaff) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403, headers: corsHeaders })
    }

    if (!['payment_pending', 'contract_approved'].includes(tx.status)) {
      return new Response(JSON.stringify({ error: 'Payment cannot be made at this stage' }), { status: 400, headers: corsHeaders })
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, invoice_number, client_email, total_amount, currency, payment_status, stripe_session_id')
      .eq('id', invoiceId)
      .eq('transaction_id', transactionId)
      .maybeSingle()

    if (!invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404, headers: corsHeaders })
    }

    if (invoice.payment_status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Invoice is already paid' }), { status: 400, headers: corsHeaders })
    }

    const stripe = new Stripe(secretRow.value, { apiVersion: '2024-11-20.acacia' })

    if (invoice.stripe_session_id) {
      try {
        const existing = await stripe.checkout.sessions.retrieve(invoice.stripe_session_id)
        if (existing.status === 'open' && existing.url) {
          return new Response(JSON.stringify({ url: existing.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      } catch {
        // Create a fresh session below.
      }
    }

    const { data: breakdowns } = await supabase
      .from('payment_breakdowns')
      .select('label, amount')
      .eq('transaction_id', transactionId)
      .order('sort_order', { ascending: true })

    if (!breakdowns?.length) {
      return new Response(JSON.stringify({ error: 'Payment breakdown not found' }), { status: 400, headers: corsHeaders })
    }

    const currency = String(invoice.currency ?? 'AED').toLowerCase()
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = breakdowns.map((row) => ({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: Math.max(0, Math.round(Number(row.amount) * 100)),
        product_data: { name: row.label },
      },
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: invoice.client_email ?? tx.client_email,
      success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      line_items: lineItems,
      metadata: {
        type: 'property_invoice',
        invoice_id: invoiceId,
        transaction_id: transactionId,
        invoice_number: invoice.invoice_number,
        transaction_number: tx.transaction_number ?? '',
      },
    })

    await supabase.from('invoices').update({ stripe_session_id: session.id }).eq('id', invoiceId)

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders })
  }
})
