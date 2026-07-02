/**
 * WhatsApp Cloud API — one agency sender, many recipient numbers.
 *
 * - WHATSAPP_PHONE_NUMBER_ID = your company's registered WhatsApp Business line (sender).
 * - agents.whatsapp / agents.phone = each agent's mobile (recipient for alerts).
 * - Client numbers = recipient for confirmations (requires approved templates in production).
 */

export type WhatsAppSendResult = {
  ok: boolean
  skipped?: boolean
  error?: string
  mode?: 'template' | 'text'
}

export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  let digits = raw.replace(/\D/g, '')
  if (!digits) return null
  // UAE local mobiles often stored as 05xxxxxxxx
  if (digits.startsWith('0') && digits.length >= 9) {
    digits = `971${digits.slice(1)}`
  }
  return digits
}

/** Prefer dedicated WhatsApp field, fall back to voice phone. */
export function resolveNotifyNumber(input: {
  whatsapp?: string | null
  phone?: string | null
}): string | null {
  return normalizeWhatsAppNumber(input.whatsapp) ?? normalizeWhatsAppNumber(input.phone)
}

function whatsAppConfigured(): boolean {
  return Boolean(Deno.env.get('WHATSAPP_ACCESS_TOKEN') && Deno.env.get('WHATSAPP_PHONE_NUMBER_ID'))
}

async function postWhatsAppMessage(body: Record<string, unknown>): Promise<WhatsAppSendResult> {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  if (!token || !phoneId) {
    return { ok: false, skipped: true }
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[whatsapp]', errText)
      return { ok: false, error: errText }
    }

    return { ok: true }
  } catch (e) {
    console.error('[whatsapp]', e)
    return { ok: false, error: String(e) }
  }
}

export async function sendWhatsAppText(toNumber: string, body: string): Promise<WhatsAppSendResult> {
  const normalized = normalizeWhatsAppNumber(toNumber)
  if (!normalized) return { ok: false, skipped: true }
  if (!whatsAppConfigured()) return { ok: false, skipped: true }

  const result = await postWhatsAppMessage({
    messaging_product: 'whatsapp',
    to: normalized,
    type: 'text',
    text: { body },
  })
  return { ...result, mode: 'text' }
}

export async function sendWhatsAppTemplate(
  toNumber: string,
  templateName: string,
  params: string[],
  languageCode = Deno.env.get('WHATSAPP_TEMPLATE_LANGUAGE') ?? 'en',
): Promise<WhatsAppSendResult> {
  const normalized = normalizeWhatsAppNumber(toNumber)
  if (!normalized || !templateName.trim()) return { ok: false, skipped: true }
  if (!whatsAppConfigured()) return { ok: false, skipped: true }

  const result = await postWhatsAppMessage({
    messaging_product: 'whatsapp',
    to: normalized,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: params.length
        ? [
            {
              type: 'body',
              parameters: params.map((text) => ({ type: 'text', text })),
            },
          ]
        : undefined,
    },
  })
  return { ...result, mode: 'template' }
}

/**
 * Sends a WhatsApp notification. Uses an approved template when provided (required for
 * most business-initiated client messages). Falls back to plain text for sandbox/testing.
 */
export async function sendWhatsAppNotification(input: {
  to: string
  text: string
  templateName?: string | null
  templateParams?: string[]
}): Promise<WhatsAppSendResult> {
  const template = input.templateName?.trim()
  if (template) {
    const templateResult = await sendWhatsAppTemplate(
      input.to,
      template,
      input.templateParams ?? [],
    )
    if (templateResult.ok || !templateResult.skipped) return templateResult
  }

  return sendWhatsAppText(input.to, input.text)
}

export function agentAlertTemplateName(): string | null {
  return Deno.env.get('WHATSAPP_TEMPLATE_AGENT_ALERT')?.trim() || null
}

export function viewingConfirmedTemplateName(): string | null {
  return Deno.env.get('WHATSAPP_TEMPLATE_VIEWING_CONFIRMED')?.trim() || null
}

export function viewingDeclinedTemplateName(): string | null {
  return Deno.env.get('WHATSAPP_TEMPLATE_VIEWING_DECLINED')?.trim() || null
}
