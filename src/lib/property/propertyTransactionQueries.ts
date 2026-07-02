import { useQuery } from '@tanstack/react-query'
import type { Database } from '@/integrations/supabase/database.types'
import { tryGetSupabase } from '@/integrations/supabase/client'

export type ClientTransactionSummary = {
  id: string
  transaction_number: string
  status: string
  listing_type: string
  created_at: string
  updated_at: string
  property_name: string
  property_slug: string
  property_image_url: string | null
  property_price: number
}

export type PropertyTransactionDetail = Database['public']['Tables']['property_transactions']['Row'] & {
  property: Pick<
    Database['public']['Tables']['products']['Row'],
    'id' | 'name' | 'slug' | 'image_url' | 'price' | 'listing_type' | 'property_reference'
  >
  viewings: Database['public']['Tables']['viewing_requests']['Row'][]
  declarations: Database['public']['Tables']['client_declarations']['Row'][]
  approvals: Database['public']['Tables']['agent_approvals']['Row'][]
  generated_contracts: Database['public']['Tables']['generated_contracts']['Row'][]
  uploaded_contracts: Database['public']['Tables']['uploaded_contracts']['Row'][]
  payment_breakdowns: Database['public']['Tables']['payment_breakdowns']['Row'][]
  invoices: Database['public']['Tables']['invoices']['Row'][]
  handover_records: Database['public']['Tables']['handover_records']['Row'][]
  notifications: Database['public']['Tables']['notifications']['Row'][]
}

export const propertyTransactionKeys = {
  all: ['property-transactions'] as const,
  list: () => [...propertyTransactionKeys.all, 'list'] as const,
  detail: (id: string) => [...propertyTransactionKeys.all, 'detail', id] as const,
  viewings: () => [...propertyTransactionKeys.all, 'viewings'] as const,
  notifications: () => [...propertyTransactionKeys.all, 'notifications'] as const,
}

export async function fetchClientTransactions(): Promise<ClientTransactionSummary[]> {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')

  const { data, error } = await supabase.rpc('rpc_list_client_transactions')
  if (error) throw new Error(error.message)

  const result = data as { ok: boolean; items?: ClientTransactionSummary[]; error?: string }
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load transactions')
  return (result.items ?? []).map((item) => ({
    ...item,
    property_price: Number(item.property_price),
  }))
}

export async function fetchClientTransactionDetail(id: string): Promise<PropertyTransactionDetail | null> {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')

  const { data: tx, error: txError } = await supabase
    .from('property_transactions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (txError) throw new Error(txError.message)
  if (!tx) return null

  const [
    propertyRes,
    viewingsRes,
    declarationsRes,
    approvalsRes,
    generatedRes,
    uploadedRes,
    breakdownRes,
    invoicesRes,
    handoverRes,
    notificationsRes,
  ] = await Promise.all([
    supabase.from('products').select('id, name, slug, image_url, price, listing_type, property_reference').eq('id', tx.property_id).single(),
    supabase.from('viewing_requests').select('*').eq('transaction_id', id).order('created_at', { ascending: false }),
    supabase.from('client_declarations').select('*').eq('transaction_id', id).order('created_at', { ascending: false }),
    supabase.from('agent_approvals').select('*').eq('transaction_id', id).order('created_at', { ascending: false }),
    supabase.from('generated_contracts').select('*').eq('transaction_id', id).order('created_at', { ascending: false }),
    supabase.from('uploaded_contracts').select('*').eq('transaction_id', id).order('created_at', { ascending: false }),
    supabase.from('payment_breakdowns').select('*').eq('transaction_id', id).order('sort_order', { ascending: true }),
    supabase.from('invoices').select('*').eq('transaction_id', id).order('issued_at', { ascending: false }),
    supabase.from('handover_records').select('*').eq('transaction_id', id).order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').eq('transaction_id', id).order('created_at', { ascending: false }).limit(20),
  ])

  const firstError =
    propertyRes.error ??
    viewingsRes.error ??
    declarationsRes.error ??
    approvalsRes.error ??
    generatedRes.error ??
    uploadedRes.error ??
    breakdownRes.error ??
    invoicesRes.error ??
    handoverRes.error ??
    notificationsRes.error

  if (firstError) throw new Error(firstError.message)

  return {
    ...tx,
    property: propertyRes.data!,
    viewings: viewingsRes.data ?? [],
    declarations: declarationsRes.data ?? [],
    approvals: approvalsRes.data ?? [],
    generated_contracts: generatedRes.data ?? [],
    uploaded_contracts: uploadedRes.data ?? [],
    payment_breakdowns: breakdownRes.data ?? [],
    invoices: invoicesRes.data ?? [],
    handover_records: handoverRes.data ?? [],
    notifications: notificationsRes.data ?? [],
  }
}

export async function markNotificationRead(notificationId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  if (error) throw new Error(error.message)
}

export async function fetchClientProfile() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return null
  const { data, error } = await supabase.from('client_profiles').select('*').eq('user_id', auth.user.id).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function upsertClientProfile(input: {
  full_name?: string
  phone?: string
  address?: string
  emirates_id?: string
  passport_number?: string
  nationality?: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Sign in required')

  const { error } = await supabase.from('client_profiles').upsert({
    user_id: auth.user.id,
    ...input,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

export async function fetchClientViewings() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')

  const { data, error } = await supabase
    .from('viewing_requests')
    .select('*, products(name, slug, image_url)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchClientNotifications() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_role', 'client')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export function useClientTransactions(enabled: boolean) {
  return useQuery({
    queryKey: propertyTransactionKeys.list(),
    queryFn: fetchClientTransactions,
    enabled,
    staleTime: 30_000,
  })
}

export function useClientTransactionDetail(id: string, enabled: boolean) {
  return useQuery({
    queryKey: propertyTransactionKeys.detail(id),
    queryFn: () => fetchClientTransactionDetail(id),
    enabled: enabled && Boolean(id),
    staleTime: 15_000,
  })
}

export function useClientViewings(enabled: boolean) {
  return useQuery({
    queryKey: propertyTransactionKeys.viewings(),
    queryFn: fetchClientViewings,
    enabled,
    staleTime: 30_000,
  })
}

export function useClientNotifications(enabled: boolean) {
  return useQuery({
    queryKey: propertyTransactionKeys.notifications(),
    queryFn: fetchClientNotifications,
    enabled,
    staleTime: 30_000,
  })
}
