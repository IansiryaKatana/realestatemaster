import { tryGetSupabase } from '@/integrations/supabase/client'

type RpcOk<T> = { ok: true } & T
type RpcErr = { ok: false; error: string }

function parseRpc<T>(data: unknown): T {
  const result = data as RpcOk<T> | RpcErr
  if (!result?.ok) throw new Error((result as RpcErr).error ?? 'Request failed')
  return result as RpcOk<T>
}

export async function fetchTenancyDashboard() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase.rpc('rpc_get_tenancy_dashboard')
  if (error) throw new Error(error.message)
  const result = parseRpc<{ counts: Record<string, number> }>(data)
  return {
    activeLeases: Number(result.counts.active_leases ?? 0),
    overdueRent: Number(result.counts.overdue_rent ?? 0),
    pendingVerification: Number(result.counts.pending_verification ?? 0),
    openComplaints: Number(result.counts.open_complaints ?? 0),
    openMaintenance: Number(result.counts.open_maintenance ?? 0),
    landlords: Number(result.counts.landlords ?? 0),
  }
}

export async function activateLeaseFromTransaction(transactionId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase.rpc('rpc_activate_lease_from_transaction', {
    p_transaction_id: transactionId,
  })
  if (error) throw new Error(error.message)
  return parseRpc<{ lease_id: string }>(data)
}

export async function verifyRentPayment(paymentId: string, approve: boolean, notes?: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase.rpc('rpc_verify_rent_payment', {
    p_payment_id: paymentId,
    p_approve: approve,
    p_notes: notes ?? null,
  })
  if (error) throw new Error(error.message)
  return parseRpc<Record<string, never>>(data)
}

export async function submitRentPaymentProof(
  installmentId: string,
  amount: number,
  method: string,
  proofUrl?: string,
) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase.rpc('rpc_submit_rent_payment_proof', {
    p_installment_id: installmentId,
    p_amount: amount,
    p_method: method,
    p_proof_url: proofUrl ?? null,
  })
  if (error) throw new Error(error.message)
  return parseRpc<{ payment_id: string }>(data)
}

export async function createServiceRequest(
  leaseId: string,
  type: 'complaint' | 'maintenance',
  category: string,
  priority: string,
  title: string,
  description: string,
) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase.rpc('rpc_create_service_request', {
    p_lease_id: leaseId,
    p_type: type,
    p_category: category,
    p_priority: priority,
    p_title: title,
    p_description: description,
  })
  if (error) throw new Error(error.message)
  return parseRpc<{ request_id: string }>(data)
}

export async function updateServiceRequestStatus(
  requestId: string,
  status: string,
  assignedAgentId?: string | null,
) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase.rpc('rpc_update_service_request_status', {
    p_request_id: requestId,
    p_status: status,
    p_assigned_agent_id: assignedAgentId ?? null,
  })
  if (error) throw new Error(error.message)
  return parseRpc<Record<string, never>>(data)
}

export async function generateOwnerStatement(
  ownerId: string,
  periodStart: string,
  periodEnd: string,
) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase.rpc('rpc_generate_owner_statement', {
    p_owner_id: ownerId,
    p_period_start: periodStart,
    p_period_end: periodEnd,
  })
  if (error) throw new Error(error.message)
  return parseRpc<{ statement_id: string; net_payout: number }>(data)
}
