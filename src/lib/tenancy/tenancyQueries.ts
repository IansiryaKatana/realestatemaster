import { callRpcItems, callRpcOptionalItem } from '@/lib/rpc/callRpc'
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
  return callRpcItems<LeaseRow & { products: { name: string; slug: string; property_reference: string | null } | null }>('rpc_list_leases')
}

export async function fetchRentInstallments(leaseId?: string) {
  return callRpcItems<RentInstallmentRow>('rpc_list_rent_installments', {
    p_lease_id: leaseId ?? null,
  })
}

export async function fetchPendingRentPayments() {
  return callRpcItems<RentPaymentRow>('rpc_list_pending_rent_payments')
}

export async function fetchServiceRequests(type?: 'complaint' | 'maintenance') {
  return callRpcItems<ServiceRequestRow & { products: { name: string } | null }>('rpc_list_service_requests', {
    p_type: type ?? null,
  })
}

export async function fetchPropertyOwners() {
  return callRpcItems<PropertyOwnerRow>('rpc_list_property_owners')
}

export async function fetchTenantActiveLease() {
  const result = await callRpcOptionalItem<
    LeaseRow & { products: { name: string; slug: string; image_url: string | null; property_reference: string | null } }
  >('rpc_get_tenant_active_lease', {}, 'lease')
  return result
}

export async function fetchTenantInstallments(leaseId: string) {
  return callRpcItems<RentInstallmentRow>('rpc_list_tenant_installments', { p_lease_id: leaseId })
}

export async function fetchMoveInChecklist(leaseId: string) {
  const result = await callRpcOptionalItem<MoveInChecklistRow>('rpc_get_move_in_checklist', { p_lease_id: leaseId }, 'checklist')
  return result
}

export async function fetchMoveInChecklists() {
  return callRpcItems('rpc_list_move_in_checklists')
}

export async function fetchTenantDocuments(leaseId: string) {
  return callRpcItems<TenantDocumentRow>('rpc_list_tenant_documents', { p_lease_id: leaseId })
}

export async function fetchLandlordPortfolio(ownerId: string) {
  return callRpcItems('rpc_list_landlord_portfolio', { p_owner_id: ownerId })
}

export async function fetchLandlordStatements(ownerId: string) {
  return callRpcItems<OwnerStatementRow>('rpc_list_landlord_statements', { p_owner_id: ownerId })
}

export async function fetchRoleNotifications(role: 'client' | 'tenant' | 'landlord' | 'agent') {
  return callRpcItems('rpc_list_role_notifications', { p_role: role })
}

export async function fetchAgentLeases(agentId: string) {
  return callRpcItems<LeaseRow & { products: { name: string; property_reference: string | null } | null }>(
    'rpc_list_agent_leases',
    { p_agent_id: agentId },
  )
}
