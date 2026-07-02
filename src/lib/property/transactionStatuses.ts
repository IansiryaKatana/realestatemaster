export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  inquiry_submitted: 'Inquiry submitted',
  viewing_requested: 'Viewing requested',
  viewing_scheduled: 'Viewing scheduled',
  viewing_completed: 'Viewing completed',
  client_proceeding: 'Client proceeding',
  agent_approved: 'Agent approved',
  contract_requested: 'Contract requested',
  contract_generated: 'Contract generated',
  contract_sent: 'Contract sent',
  signed_contract_uploaded: 'Signed contract uploaded',
  contract_under_review: 'Contract under review',
  contract_approved: 'Contract approved',
  payment_pending: 'Payment pending',
  payment_completed: 'Payment completed',
  handover_pending: 'Handover pending',
  handover_scheduled: 'Handover scheduled',
  handover_completed: 'Handover completed',
  transaction_completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

export const TRANSACTION_STATUS_STEPS = [
  'inquiry_submitted',
  'viewing_requested',
  'viewing_scheduled',
  'viewing_completed',
  'client_proceeding',
  'agent_approved',
  'contract_requested',
  'contract_generated',
  'signed_contract_uploaded',
  'contract_approved',
  'payment_pending',
  'payment_completed',
  'handover_completed',
  'transaction_completed',
] as const

export function transactionStatusLabel(status: string): string {
  return TRANSACTION_STATUS_LABELS[status] ?? status.replaceAll('_', ' ')
}

export function transactionStatusIndex(status: string): number {
  const idx = TRANSACTION_STATUS_STEPS.indexOf(status as (typeof TRANSACTION_STATUS_STEPS)[number])
  return idx >= 0 ? idx : 0
}
