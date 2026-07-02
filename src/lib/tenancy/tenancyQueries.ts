import { tryGetSupabase } from '@/integrations/supabase/client'
import type {
  LeaseRow,
  MoveInChecklistRow,
  OwnerStatementRow,
  PropertyOwnerRow,
  RentInstallmentRow,
  RentPaymentRow,
  ServiceRequestRow,
  TenantDocumentRow,
} from '@/lib/tenancy/types'

export const tenancyKeys = {
  all: ['tenancy'] as const,
  leases: () => [...tenancyKeys.all, 'leases'] as const,
  lease: (id: string) => [...tenancyKeys.leases(), id] as const,
  installments: (leaseId: string) => [...tenancyKeys.all, 'installments', leaseId] as const,
  payments: () => [...tenancyKeys.all, 'payments'] as const,
  serviceRequests: (type?: string) => [...tenancyKeys.all, 'service-requests', type] as const,
  owners: () => [...tenancyKeys.all, 'owners'] as const,
  tenantLease: () => [...tenancyKeys.all, 'tenant-lease'] as const,
  landlordPortfolio: () => [...tenancyKeys.all, 'landlord-portfolio'] as const,
  notifications: (role: string) => [...tenancyKeys.all, 'notifications', role] as const,
}

export async function fetchLeases() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('leases')
    .select('*, products(name, slug, property_reference)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as (LeaseRow & { products: { name: string; slug: string; property_reference: string | null } | null })[]
}

export async function fetchRentInstallments(leaseId?: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  let q = supabase.from('rent_installments').select('*, leases(product_id, tenant_user_id, products(name))').order('due_date')
  if (leaseId) q = q.eq('lease_id', leaseId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as RentInstallmentRow[]
}

export async function fetchPendingRentPayments() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('rent_payments')
    .select('*, rent_installments(due_date, amount, lease_id, leases(products(name)))')
    .eq('status', 'pending_verification')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as RentPaymentRow[]
}

export async function fetchServiceRequests(type?: 'complaint' | 'maintenance') {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  let q = supabase
    .from('service_requests')
    .select('*, products(name)')
    .order('created_at', { ascending: false })
  if (type) q = q.eq('request_type', type)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as (ServiceRequestRow & { products: { name: string } | null })[]
}

export async function fetchPropertyOwners() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase.from('property_owners').select('*').order('full_name')
  if (error) throw new Error(error.message)
  return (data ?? []) as PropertyOwnerRow[]
}

export async function fetchTenantActiveLease() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('leases')
    .select('*, products(name, slug, image_url, property_reference)')
    .in('status', ['pending', 'active', 'notice'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as (LeaseRow & { products: { name: string; slug: string; image_url: string | null; property_reference: string | null } }) | null
}

export async function fetchTenantInstallments(leaseId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('rent_installments')
    .select('*')
    .eq('lease_id', leaseId)
    .order('due_date')
  if (error) throw new Error(error.message)
  return (data ?? []) as RentInstallmentRow[]
}

export async function fetchMoveInChecklist(leaseId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('move_in_checklists')
    .select('*')
    .eq('lease_id', leaseId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as MoveInChecklistRow | null
}

export async function fetchMoveInChecklists() {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('move_in_checklists')
    .select('*, leases(products(name, property_reference))')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchTenantDocuments(leaseId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('tenant_documents')
    .select('*')
    .eq('lease_id', leaseId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as TenantDocumentRow[]
}

export async function fetchLandlordPortfolio(ownerId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('property_owner_assignments')
    .select('*, products(id, name, slug, image_url, property_reference, property_status_id)')
    .eq('property_owner_id', ownerId)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchLandlordStatements(ownerId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('owner_statements')
    .select('*')
    .eq('property_owner_id', ownerId)
    .order('period_end', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as OwnerStatementRow[]
}

export async function fetchRoleNotifications(role: 'client' | 'tenant' | 'landlord' | 'agent') {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_role', role)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchAgentLeases(agentId: string) {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Database is not configured')
  const { data, error } = await supabase
    .from('leases')
    .select('*, products(name, property_reference)')
    .eq('assigned_agent_id', agentId)
    .in('status', ['active', 'notice'])
    .order('start_date', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as (LeaseRow & { products: { name: string; property_reference: string | null } | null })[]
}
