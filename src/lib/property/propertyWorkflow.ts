import { tryGetSupabase } from '@/integrations/supabase/client'

type RpcOk<T> = { ok: true } & T
type RpcErr = { ok: false; error?: string }

function parseRpc<T>(data: unknown): RpcOk<T> | RpcErr {
  const result = data as RpcOk<T> | RpcErr
  if (!result?.ok) return { ok: false, error: result?.error ?? 'Request failed' }
  return result
}

export async function rpcSubmitPropertyInquiry(input: {
  propertyId: string
  fullName: string
  email: string
  phone?: string
  message?: string
  preferredViewingDate?: string
  preferredViewingTime?: string
  interestType?: string
  requestViewing?: boolean
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_submit_property_inquiry', {
    p_property_id: input.propertyId,
    p_full_name: input.fullName,
    p_email: input.email,
    p_phone: input.phone ?? null,
    p_message: input.message ?? null,
    p_preferred_viewing_date: input.preferredViewingDate || null,
    p_preferred_viewing_time: input.preferredViewingTime || null,
    p_interest_type: input.interestType ?? null,
    p_request_viewing: input.requestViewing ?? true,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{
    transaction_id: string
    transaction_number: string
    inquiry_id: string
    viewing_request_id: string | null
  }>(data)
}

export async function rpcSubmitClientDeclaration(input: {
  transactionId: string
  viewingRequestId?: string
  decision: 'proceed' | 'not_proceed' | 'need_more_info'
  notes?: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_submit_client_declaration', {
    p_transaction_id: input.transactionId,
    p_viewing_request_id: input.viewingRequestId ?? null,
    p_decision: input.decision,
    p_notes: input.notes ?? null,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ status: string }>(data)
}

export async function rpcClientRequestContract(transactionId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_client_request_contract', {
    p_transaction_id: transactionId,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ status: string }>(data)
}

export async function rpcAgentApproveTransaction(input: {
  transactionId: string
  decision: 'approved' | 'rejected' | 'need_more_info'
  internalNotes?: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_agent_approve_transaction', {
    p_transaction_id: input.transactionId,
    p_decision: input.decision,
    p_internal_notes: input.internalNotes ?? null,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ status: string }>(data)
}

export async function rpcAgentUpdateViewing(input: {
  viewingId: string
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  scheduledDate?: string
  scheduledTime?: string
  agentNotes?: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_agent_update_viewing', {
    p_viewing_id: input.viewingId,
    p_status: input.status,
    p_scheduled_date: input.scheduledDate ?? null,
    p_scheduled_time: input.scheduledTime ?? null,
    p_agent_notes: input.agentNotes ?? null,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ status: string }>(data)
}

export async function rpcAgentGenerateContract(input: {
  transactionId: string
  contractData?: Record<string, unknown>
  fileUrl?: string
  fileName?: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_agent_generate_contract', {
    p_transaction_id: input.transactionId,
    p_contract_data: input.contractData ?? {},
    p_file_url: input.fileUrl ?? null,
    p_file_name: input.fileName ?? null,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ contract_id: string; status: string }>(data)
}

export async function rpcAgentReviewContract(input: {
  uploadId: string
  decision: 'approved' | 'rejected' | 'reupload_requested'
  reviewNotes?: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_agent_review_contract', {
    p_upload_id: input.uploadId,
    p_decision: input.decision,
    p_review_notes: input.reviewNotes ?? null,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ status: string }>(data)
}

export async function rpcBuildPaymentBreakdown(transactionId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_build_payment_breakdown', {
    p_transaction_id: transactionId,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ total: number }>(data)
}

export async function rpcCreatePropertyInvoice(transactionId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_create_property_invoice', {
    p_transaction_id: transactionId,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ invoice_id: string; invoice_number: string; total: number }>(data)
}

export async function rpcRecordPropertyPayment(transactionId: string, invoiceId?: string) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_record_property_payment', {
    p_transaction_id: transactionId,
    p_invoice_id: invoiceId ?? null,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ status: string }>(data)
}

export async function startPropertyStripeCheckout(transactionId: string, invoiceId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.access_token) {
    return { ok: false as const, error: 'Sign in to pay online' }
  }

  const baseUrl = window.location.origin
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-property-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.session.access_token}`,
    },
    body: JSON.stringify({
      transaction_id: transactionId,
      invoice_id: invoiceId,
      success_url: `${baseUrl}/account/transactions/${transactionId}`,
      cancel_url: `${baseUrl}/account/transactions/${transactionId}`,
    }),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.url) {
    return { ok: false as const, error: (body as { error?: string }).error ?? 'Could not start payment' }
  }

  return { ok: true as const, url: body.url as string }
}

export async function rpcScheduleHandover(input: {
  transactionId: string
  handoverDate: string
  handoverTime?: string
  meetingLocation?: string
  agentNotes?: string
  requiredDocuments?: string
  keyCollectionDetails?: string
  possessionInstructions?: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_schedule_handover', {
    p_transaction_id: input.transactionId,
    p_handover_date: input.handoverDate,
    p_handover_time: input.handoverTime ?? null,
    p_meeting_location: input.meetingLocation ?? null,
    p_agent_notes: input.agentNotes ?? null,
    p_required_documents: input.requiredDocuments ?? null,
    p_key_collection_details: input.keyCollectionDetails ?? null,
    p_possession_instructions: input.possessionInstructions ?? null,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ handover_id: string; status: string }>(data)
}

export async function rpcCompleteHandover(transactionId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.rpc('rpc_complete_handover', {
    p_transaction_id: transactionId,
  })

  if (error) return { ok: false as const, error: error.message }
  return parseRpc<{ status: string }>(data)
}
