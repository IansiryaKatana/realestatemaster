export type LeaseStatus = 'pending' | 'active' | 'notice' | 'ended'
export type InstallmentStatus = 'scheduled' | 'due' | 'pending_verification' | 'paid' | 'overdue' | 'waived'
export type PaymentStatus = 'pending_verification' | 'approved' | 'rejected'
export type ServiceRequestType = 'complaint' | 'maintenance'
export type ServiceRequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export type LeaseRow = {
  id: string
  property_transaction_id: string | null
  product_id: string
  tenant_user_id: string
  landlord_owner_id: string | null
  assigned_agent_id: string | null
  start_date: string
  end_date: string | null
  rent_amount: number
  payment_frequency: 'monthly' | 'cheque'
  cheque_count: number | null
  security_deposit: number | null
  status: LeaseStatus
  created_at: string
  updated_at: string
}

export type RentInstallmentRow = {
  id: string
  lease_id: string
  due_date: string
  amount: number
  installment_type: 'rent' | 'deposit' | 'fee'
  status: InstallmentStatus
  created_at: string
  updated_at: string
}

export type RentPaymentRow = {
  id: string
  installment_id: string
  amount: number
  payment_method: string
  proof_url: string | null
  stripe_payment_id: string | null
  submitted_by: string | null
  verified_by: string | null
  verified_at: string | null
  status: PaymentStatus
  admin_notes: string | null
  created_at: string
}

export type ServiceRequestRow = {
  id: string
  lease_id: string | null
  product_id: string | null
  tenant_user_id: string
  request_type: ServiceRequestType
  category: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  title: string
  description: string
  status: ServiceRequestStatus
  assigned_agent_id: string | null
  resolved_at: string | null
  sla_due_at: string | null
  created_at: string
  updated_at: string
}

export type PropertyOwnerRow = {
  id: string
  auth_user_id: string | null
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  tax_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MoveInChecklistRow = {
  id: string
  lease_id: string
  handover_record_id: string | null
  items: { id: string; label: string; done: boolean }[]
  tenant_signed_at: string | null
  agent_signed_at: string | null
  created_at: string
  updated_at: string
}

export type OwnerStatementRow = {
  id: string
  property_owner_id: string
  period_start: string
  period_end: string
  gross_rent: number
  fees: number
  net_payout: number
  pdf_url: string | null
  created_at: string
}

export type TenantDocumentRow = {
  id: string
  lease_id: string
  doc_type: 'ejari' | 'dewa' | 'lease' | 'id' | 'other'
  file_url: string
  verified_by: string | null
  verified_at: string | null
  created_at: string
}
