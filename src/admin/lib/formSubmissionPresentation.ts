import type { ReactNode } from 'react'
import type { Json } from '@/integrations/supabase/database.types'
import type { DetailField } from '@/admin/components/EntityDetailSheet'

type SubmissionPayload = Record<string, string | null | undefined>

export function parseSubmissionPayload(payload: Json): SubmissionPayload {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {}
  const result: SubmissionPayload = {}
  for (const [key, value] of Object.entries(payload)) {
    if (value == null) result[key] = undefined
    else if (typeof value === 'string') result[key] = value
    else result[key] = String(value)
  }
  return result
}

export function submissionTypeLabel(formType: string): string {
  switch (formType) {
    case 'callback_request':
      return 'Callback request'
    case 'contact':
      return 'Contact form'
    default:
      return formType.replaceAll('_', ' ')
  }
}

export function submissionSummary(formType: string, payload: SubmissionPayload): string {
  if (formType === 'callback_request') {
    const parts = [payload.full_name, payload.property_reference, payload.property_name].filter(Boolean)
    return parts.length ? parts.join(' · ') : '—'
  }
  if (formType === 'contact') {
    return payload.name ?? '—'
  }
  return payload.full_name ?? payload.name ?? '—'
}

export function submissionContact(formType: string, payload: SubmissionPayload): string {
  if (formType === 'callback_request') return payload.phone ?? '—'
  if (formType === 'contact') return payload.email ?? '—'
  return payload.phone ?? payload.email ?? '—'
}

export function submissionStatusLabel(status: string): string {
  switch (status) {
    case 'new':
      return 'New'
    case 'in_progress':
      return 'In progress'
    case 'resolved':
      return 'Resolved'
    default:
      return status.replaceAll('_', ' ')
  }
}

export function submissionDetailFields(
  formType: string,
  payload: SubmissionPayload,
  renderPropertyLink?: (slug: string, label: string) => ReactNode,
): DetailField[] {
  if (formType === 'callback_request') {
    const propertyLabel = [payload.property_reference, payload.property_name].filter(Boolean).join(' — ')
    const fields: DetailField[] = [
      { label: 'Full name', value: payload.full_name ?? '—' },
      { label: 'Phone', value: payload.phone ?? '—' },
      { label: 'Property', value: propertyLabel || '—' },
    ]
    if (payload.property_slug && renderPropertyLink) {
      fields.push({
        label: 'Listing',
        value: renderPropertyLink(payload.property_slug, 'View property'),
      })
    }
    return fields
  }

  if (formType === 'contact') {
    return [
      { label: 'Name', value: payload.name ?? '—' },
      { label: 'Email', value: payload.email ?? '—' },
      { label: 'Message', value: payload.message ?? '—' },
    ]
  }

  return [{ label: 'Payload', value: JSON.stringify(payload, null, 2) }]
}
