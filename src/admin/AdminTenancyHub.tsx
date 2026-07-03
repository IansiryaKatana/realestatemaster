import { useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ExternalLink, Play, X } from 'lucide-react'
import { toast } from 'sonner'
import { AdminTabHub } from '@/admin/components/AdminTabHub'
import { AdminLoadingState } from '@/admin/components/AdminPageHeading'
import { AdminEditGate } from '@/admin/components/AdminReadOnlyBanner'
import { AdminClickableTableRow, AdminTableStopCell } from '@/admin/components/AdminClickableTableRow'
import { AdminRowActions, adminTableActionsCellClass, adminTableActionsHeadClass } from '@/admin/components/AdminRowActions'
import { EntityDetailSheet } from '@/admin/components/EntityDetailSheet'
import { adminBtnPrimary, adminBtnSecondary, adminInput, adminLabel } from '@/admin/adminClassNames'
import { BrandedSelect } from '@/components/ui/BrandedSelect'
import { tryGetSupabase } from '@/integrations/supabase/client'
import {
  fetchLeases,
  fetchMoveInChecklists,
  fetchPendingRentPayments,
  fetchPropertyOwners,
  fetchRentInstallments,
  fetchServiceRequests,
  tenancyKeys,
} from '@/lib/tenancy/tenancyQueries'
import {
  activateLeaseFromTransaction,
  generateOwnerStatement,
  updateServiceRequestStatus,
  verifyRentPayment,
} from '@/lib/tenancy/tenancyRpc'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { useCurrency, useFormatPrice } from '@/lib/currency'
import { cn, formatOrdinalShortDate } from '@/lib/utils'
import { PhoneInputField } from '@/components/ui/phone-input-field'
import type { LeaseRow, PropertyOwnerRow, RentPaymentRow, ServiceRequestRow } from '@/lib/tenancy/types'

const TABS = [
  { id: 'leases', label: 'Leases' },
  { id: 'rent', label: 'Rent schedule' },
  { id: 'verification', label: 'Payment verification' },
  { id: 'complaints', label: 'Complaints' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'movein', label: 'Move-in' },
  { id: 'landlords', label: 'Landlords' },
] as const

type TabId = (typeof TABS)[number]['id']

export const TENANCY_TABS = TABS.map((t) => t.id) as unknown as readonly [TabId, ...TabId[]]
export const TENANCY_DEFAULT_TAB: TabId = 'leases'

type LeaseWithProduct = LeaseRow & {
  products: { name: string; slug: string; property_reference: string | null } | null
}

type InstallmentWithLease = {
  id: string
  due_date: string
  amount: number
  installment_type: string
  status: string
  leases: { products: { name: string; property_reference: string | null } | null } | null
}

type PaymentWithContext = RentPaymentRow & {
  rent_installments: {
    due_date: string
    amount: number
    leases: { products: { name: string; property_reference: string | null } | null } | null
  } | null
}

type MoveInRow = {
  id: string
  lease_id: string
  items: { id: string; label: string; done: boolean }[]
  leases: { products: { name: string; property_reference: string | null } | null } | null
}

type TableColumn = { key: string; label: string; className?: string }

function AdminStandardTable({
  columns,
  emptyMessage,
  hasRows,
  children,
}: {
  columns: TableColumn[]
  emptyMessage: string
  hasRows: boolean
  children: ReactNode
}) {
  return (
    <div className="admin-table-frame">
      <div className="admin-table-wrap">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 font-medium', col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!hasRows ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[var(--admin-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PropertyCell({
  name,
  reference,
  secondary,
}: {
  name: string
  reference?: string | null
  secondary?: string | null
}) {
  return (
    <td className="px-4 py-3">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-[var(--admin-muted)]">{reference ?? secondary ?? '—'}</p>
      </div>
    </td>
  )
}

export function AdminTenancyHub({ tab }: { tab: TabId }) {
  return (
    <AdminTabHub
      title="Tenant Management"
      subtitle="Leases, rent collection, complaints, maintenance, and landlord records."
      hubPath="/admin/tenancy"
      tabs={[
        { id: 'leases', label: 'Leases', content: <AdminLeasesTab /> },
        { id: 'rent', label: 'Rent schedule', content: <AdminRentScheduleTab /> },
        { id: 'verification', label: 'Payment verification', content: <AdminPaymentVerificationTab /> },
        { id: 'complaints', label: 'Complaints', content: <AdminServiceRequestsTab type="complaint" /> },
        { id: 'maintenance', label: 'Maintenance', content: <AdminServiceRequestsTab type="maintenance" /> },
        { id: 'movein', label: 'Move-in', content: <AdminMoveInTab /> },
        { id: 'landlords', label: 'Landlords', content: <AdminLandlordsTab /> },
      ]}
      activeTab={tab}
    />
  )
}

function AdminLeasesTab() {
  const formatPrice = useFormatPrice()
  const currency = useCurrency()
  const { data: leases = [], isLoading, refetch } = useQuery({
    queryKey: tenancyKeys.leases(),
    queryFn: fetchLeases,
  })
  const [txId, setTxId] = useState('')
  const [activating, setActivating] = useState(false)
  const [detail, setDetail] = useState<LeaseWithProduct | null>(null)

  async function handleActivate() {
    if (!txId.trim()) return
    setActivating(true)
    try {
      await activateLeaseFromTransaction(txId.trim())
      toast.success('Lease activated')
      setTxId('')
      void refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Activation failed')
    } finally {
      setActivating(false)
    }
  }

  if (isLoading) return <AdminLoadingState />

  return (
    <div className="space-y-6">
      <AdminEditGate>
        <div className="admin-card p-4">
          <h3 className="font-semibold">Activate lease from transaction</h3>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            After handover, enter a completed rental transaction ID to create the lease and rent schedule.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input className={adminInput} placeholder="Transaction UUID" value={txId} onChange={(e) => setTxId(e.target.value)} />
            <button type="button" className={adminBtnPrimary} disabled={activating} onClick={() => void handleActivate()}>
              {activating ? 'Activating…' : 'Activate lease'}
            </button>
          </div>
        </div>
      </AdminEditGate>

      <AdminStandardTable
        columns={[
          { key: 'property', label: 'Property' },
          { key: 'status', label: 'Status' },
          { key: 'rent', label: `Rent (${currency.code})` },
          { key: 'start', label: 'Start' },
          { key: 'frequency', label: 'Frequency' },
          { key: 'actions', label: 'Actions', className: adminTableActionsHeadClass },
        ]}
        emptyMessage="No leases yet."
        hasRows={leases.length > 0}
      >
        {(leases as LeaseWithProduct[]).map((lease) => (
          <AdminClickableTableRow key={lease.id} onOpen={() => setDetail(lease)}>
            <PropertyCell
              name={lease.products?.name ?? lease.product_id}
              reference={lease.products?.property_reference}
              secondary={lease.products?.slug}
            />
            <td className="px-4 py-3">
              <PortalStatusBadge status={lease.status} />
            </td>
            <td className="px-4 py-3">{formatPrice(Number(lease.rent_amount))}</td>
            <td className="px-4 py-3 text-[var(--admin-muted)]">{formatOrdinalShortDate(lease.start_date)}</td>
            <td className="px-4 py-3 capitalize">{lease.payment_frequency}</td>
            <AdminTableStopCell className={adminTableActionsCellClass}>
              <AdminRowActions
                label={`Actions for ${lease.products?.name ?? 'lease'}`}
                actions={[{ label: 'View details', onClick: () => setDetail(lease) }]}
              />
            </AdminTableStopCell>
          </AdminClickableTableRow>
        ))}
      </AdminStandardTable>

      <EntityDetailSheet
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.products?.name ?? 'Lease'}
        subtitle={detail?.products?.property_reference ?? undefined}
        fields={detail ? [
          { label: 'Status', value: <span className="capitalize">{detail.status}</span> },
          { label: 'Rent', value: formatPrice(Number(detail.rent_amount)) },
          { label: 'Payment frequency', value: <span className="capitalize">{detail.payment_frequency}</span> },
          { label: 'Start date', value: formatOrdinalShortDate(detail.start_date) },
          { label: 'End date', value: detail.end_date ? formatOrdinalShortDate(detail.end_date) : '—' },
          { label: 'Security deposit', value: detail.security_deposit != null ? formatPrice(Number(detail.security_deposit)) : '—' },
          { label: 'Cheque count', value: detail.cheque_count ?? '—' },
        ] : []}
      />
    </div>
  )
}

function AdminRentScheduleTab() {
  const formatPrice = useFormatPrice()
  const currency = useCurrency()
  const { data: installments = [], isLoading } = useQuery({
    queryKey: [...tenancyKeys.leases(), 'with-installments'],
    queryFn: () => fetchRentInstallments(),
  })

  if (isLoading) return <AdminLoadingState />

  const rows = installments as InstallmentWithLease[]

  return (
    <AdminStandardTable
      columns={[
        { key: 'property', label: 'Property' },
        { key: 'due', label: 'Due date' },
        { key: 'amount', label: `Amount (${currency.code})` },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
      ]}
      emptyMessage="No installments scheduled."
      hasRows={rows.length > 0}
    >
      {rows.map((row) => (
        <tr key={row.id} className="border-t border-[var(--admin-border)]">
          <PropertyCell
            name={row.leases?.products?.name ?? '—'}
            reference={row.leases?.products?.property_reference}
          />
          <td className="px-4 py-3 text-[var(--admin-muted)]">{formatOrdinalShortDate(row.due_date)}</td>
          <td className="px-4 py-3">{formatPrice(Number(row.amount))}</td>
          <td className="px-4 py-3 capitalize">{row.installment_type}</td>
          <td className="px-4 py-3">
            <PortalStatusBadge status={row.status} />
          </td>
        </tr>
      ))}
    </AdminStandardTable>
  )
}

function AdminPaymentVerificationTab() {
  const queryClient = useQueryClient()
  const formatPrice = useFormatPrice()
  const currency = useCurrency()
  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: tenancyKeys.payments(),
    queryFn: fetchPendingRentPayments,
  })
  const [detail, setDetail] = useState<PaymentWithContext | null>(null)

  async function handleVerify(id: string, approve: boolean) {
    try {
      await verifyRentPayment(id, approve)
      toast.success(approve ? 'Payment approved' : 'Payment rejected')
      setDetail(null)
      void refetch()
      void queryClient.invalidateQueries({ queryKey: tenancyKeys.all })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Verification failed')
    }
  }

  if (isLoading) return <AdminLoadingState />

  const rows = payments as PaymentWithContext[]

  return (
    <>
      <AdminStandardTable
        columns={[
          { key: 'property', label: 'Property' },
          { key: 'amount', label: `Amount (${currency.code})` },
          { key: 'method', label: 'Method' },
          { key: 'proof', label: 'Proof' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions', className: adminTableActionsHeadClass },
        ]}
        emptyMessage="No payments awaiting verification."
        hasRows={rows.length > 0}
      >
        {rows.map((payment) => (
          <AdminClickableTableRow key={payment.id} onOpen={() => setDetail(payment)}>
            <PropertyCell
              name={payment.rent_installments?.leases?.products?.name ?? '—'}
              reference={payment.rent_installments?.leases?.products?.property_reference}
            />
            <td className="px-4 py-3 font-medium">
              {formatPrice(Number(payment.amount))}
            </td>
            <td className="px-4 py-3 capitalize text-[var(--admin-muted)]">{payment.payment_method.replace(/_/g, ' ')}</td>
            <td className="px-4 py-3">
              {payment.proof_url ? (
                <a
                  href={payment.proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--admin-primary)] underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-[var(--admin-muted)]">—</span>
              )}
            </td>
            <td className="px-4 py-3">
              <PortalStatusBadge status={payment.status} />
            </td>
            <AdminTableStopCell className={adminTableActionsCellClass}>
              <AdminEditGate>
                <AdminRowActions
                  label="Payment verification actions"
                  actions={[
                    { label: 'Approve', icon: <Check className="h-4 w-4" />, onClick: () => void handleVerify(payment.id, true) },
                    { label: 'Reject', icon: <X className="h-4 w-4" />, onClick: () => void handleVerify(payment.id, false), variant: 'danger' },
                  ]}
                />
              </AdminEditGate>
            </AdminTableStopCell>
          </AdminClickableTableRow>
        ))}
      </AdminStandardTable>

      <EntityDetailSheet
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.rent_installments?.leases?.products?.name ?? 'Payment'}
        subtitle={detail ? formatPrice(Number(detail.amount)) : undefined}
        fields={detail ? [
          { label: 'Amount', value: formatPrice(Number(detail.amount)) },
          { label: 'Method', value: <span className="capitalize">{detail.payment_method.replace(/_/g, ' ')}</span> },
          { label: 'Due date', value: detail.rent_installments?.due_date ? formatOrdinalShortDate(detail.rent_installments.due_date) : '—' },
          { label: 'Status', value: <PortalStatusBadge status={detail.status} /> },
          { label: 'Proof', value: detail.proof_url ? <a href={detail.proof_url} target="_blank" rel="noreferrer" className="underline">Open proof</a> : '—' },
          { label: 'Admin notes', value: detail.admin_notes ?? '—' },
        ] : []}
        footer={detail ? (
          <AdminEditGate>
            <div className="flex gap-2">
              <button type="button" className={adminBtnPrimary} onClick={() => void handleVerify(detail.id, true)}>Approve</button>
              <button type="button" className={adminBtnSecondary} onClick={() => void handleVerify(detail.id, false)}>Reject</button>
            </div>
          </AdminEditGate>
        ) : undefined}
      />
    </>
  )
}

function AdminServiceRequestsTab({ type }: { type: 'complaint' | 'maintenance' }) {
  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: tenancyKeys.serviceRequests(type),
    queryFn: () => fetchServiceRequests(type),
  })
  const [detail, setDetail] = useState<(ServiceRequestRow & { products: { name: string } | null }) | null>(null)

  async function setStatus(id: string, status: string) {
    try {
      await updateServiceRequestStatus(id, status)
      toast.success('Status updated')
      void refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  if (isLoading) return <AdminLoadingState />

  const rows = requests as (ServiceRequestRow & { products: { name: string } | null })[]

  return (
    <>
      <AdminStandardTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'property', label: 'Property' },
          { key: 'priority', label: 'Priority' },
          { key: 'status', label: 'Status' },
          { key: 'created', label: 'Created' },
          { key: 'actions', label: 'Actions', className: adminTableActionsHeadClass },
        ]}
        emptyMessage={`No ${type} requests.`}
        hasRows={rows.length > 0}
      >
        {rows.map((req) => (
          <AdminClickableTableRow key={req.id} onOpen={() => setDetail(req)}>
            <td className="px-4 py-3">
              <p className="font-medium">{req.title}</p>
              <p className="line-clamp-1 text-xs text-[var(--admin-muted)]">{req.description}</p>
            </td>
            <td className="px-4 py-3 text-[var(--admin-muted)]">{req.products?.name ?? '—'}</td>
            <td className="px-4 py-3 capitalize">{req.priority}</td>
            <td className="px-4 py-3">
              <PortalStatusBadge status={req.status} />
            </td>
            <td className="px-4 py-3 text-[var(--admin-muted)]">{formatOrdinalShortDate(req.created_at.slice(0, 10))}</td>
            <AdminTableStopCell className={adminTableActionsCellClass}>
              <AdminEditGate>
                <AdminRowActions
                  label={`${type} actions`}
                  actions={[
                    { label: 'View details', onClick: () => setDetail(req) },
                    ...(req.status === 'open'
                      ? [{ label: 'Start', icon: <Play className="h-4 w-4" />, onClick: () => void setStatus(req.id, 'in_progress') }]
                      : []),
                    ...(req.status === 'in_progress'
                      ? [{ label: 'Resolve', icon: <Check className="h-4 w-4" />, onClick: () => void setStatus(req.id, 'resolved') }]
                      : []),
                  ]}
                />
              </AdminEditGate>
            </AdminTableStopCell>
          </AdminClickableTableRow>
        ))}
      </AdminStandardTable>

      <EntityDetailSheet
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.title ?? type}
        subtitle={detail?.products?.name ?? undefined}
        fields={detail ? [
          { label: 'Property', value: detail.products?.name ?? '—' },
          { label: 'Category', value: detail.category ?? '—' },
          { label: 'Priority', value: <span className="capitalize">{detail.priority}</span> },
          { label: 'Status', value: <PortalStatusBadge status={detail.status} /> },
          { label: 'Description', value: detail.description },
          { label: 'SLA due', value: detail.sla_due_at ? formatOrdinalShortDate(detail.sla_due_at.slice(0, 10)) : '—' },
        ] : []}
        footer={detail ? (
          <AdminEditGate>
            <div className="flex flex-wrap gap-2">
              {detail.status === 'open' ? (
                <button type="button" className={adminBtnSecondary} onClick={() => void setStatus(detail.id, 'in_progress')}>Start</button>
              ) : null}
              {detail.status === 'in_progress' ? (
                <button type="button" className={adminBtnPrimary} onClick={() => void setStatus(detail.id, 'resolved')}>Resolve</button>
              ) : null}
            </div>
          </AdminEditGate>
        ) : undefined}
      />
    </>
  )
}

function AdminMoveInTab() {
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: [...tenancyKeys.all, 'move-in'],
    queryFn: fetchMoveInChecklists,
  })
  const [detail, setDetail] = useState<MoveInRow | null>(null)

  if (isLoading) return <AdminLoadingState />

  const rows = checklists as MoveInRow[]

  return (
    <>
      <AdminStandardTable
        columns={[
          { key: 'property', label: 'Property' },
          { key: 'progress', label: 'Progress' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions', className: adminTableActionsHeadClass },
        ]}
        emptyMessage="No move-in checklists. Activate a lease from a handover transaction."
        hasRows={rows.length > 0}
      >
        {rows.map((row) => {
          const items = row.items ?? []
          const done = items.filter((i) => i.done).length
          const complete = items.length > 0 && done === items.length
          return (
            <AdminClickableTableRow key={row.id} onOpen={() => setDetail(row)}>
              <PropertyCell
                name={row.leases?.products?.name ?? 'Lease'}
                reference={row.leases?.products?.property_reference}
              />
              <td className="px-4 py-3">
                <span className="font-medium">{done}</span>
                <span className="text-[var(--admin-muted)]"> / {items.length} items</span>
              </td>
              <td className="px-4 py-3">
                <PortalStatusBadge status={complete ? 'completed' : 'in_progress'} />
              </td>
              <AdminTableStopCell className={adminTableActionsCellClass}>
                <AdminRowActions
                  label="Move-in checklist actions"
                  actions={[{ label: 'View checklist', onClick: () => setDetail(row) }]}
                />
              </AdminTableStopCell>
            </AdminClickableTableRow>
          )
        })}
      </AdminStandardTable>

      <EntityDetailSheet
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.leases?.products?.name ?? 'Move-in checklist'}
        subtitle={detail?.leases?.products?.property_reference ?? undefined}
        fields={detail ? [
          {
            label: 'Checklist items',
            value: (
              <ul className="space-y-1 text-sm">
                {(detail.items ?? []).map((item) => (
                  <li key={item.id} className={item.done ? 'text-green-700' : 'text-[var(--admin-text)]'}>
                    {item.done ? '✓' : '○'} {item.label}
                  </li>
                ))}
              </ul>
            ),
          },
        ] : []}
      />
    </>
  )
}

function AdminLandlordsTab() {
  const { data: owners = [], isLoading, refetch } = useQuery({
    queryKey: tenancyKeys.owners(),
    queryFn: fetchPropertyOwners,
  })
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company_name: '' })
  const [saving, setSaving] = useState(false)
  const [statementOwnerId, setStatementOwnerId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [detail, setDetail] = useState<PropertyOwnerRow | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const supabase = tryGetSupabase()
      if (!supabase) throw new Error('Database is not configured')
      const { error } = await supabase.from('property_owners').insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        company_name: form.company_name || null,
      })
      if (error) throw error
      toast.success('Landlord created')
      setForm({ full_name: '', email: '', phone: '', company_name: '' })
      void refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create landlord')
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerateStatement() {
    if (!statementOwnerId || !periodStart || !periodEnd) return
    try {
      const result = await generateOwnerStatement(statementOwnerId, periodStart, periodEnd)
      toast.success(`Statement generated — net payout ${result.net_payout}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Statement generation failed')
    }
  }

  if (isLoading) return <AdminLoadingState />

  return (
    <div className="space-y-6">
      <AdminEditGate>
        <form onSubmit={(e) => void handleCreate(e)} className="admin-card grid gap-4 p-4 sm:grid-cols-2">
          <h3 className="sm:col-span-2 font-semibold">Add landlord</h3>
          <div>
            <label className={adminLabel}>Full name</label>
            <input className={adminInput} required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className={adminLabel}>Email</label>
            <input className={adminInput} type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className={adminLabel}>Phone</label>
            <PhoneInputField
              value={form.phone || undefined}
              onChange={(value) => setForm((f) => ({ ...f, phone: value ?? '' }))}
              variant="admin"
            />
          </div>
          <div>
            <label className={adminLabel}>Company</label>
            <input className={adminInput} value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className={adminBtnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Create landlord'}</button>
          </div>
        </form>

        <div className="admin-card space-y-3 p-4">
          <h3 className="font-semibold">Generate owner statement</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <BrandedSelect
              allowEmpty
              emptyLabel="Select landlord"
              value={statementOwnerId}
              onValueChange={setStatementOwnerId}
              options={owners.map((o) => ({ value: o.id, label: o.full_name }))}
            />
            <input className={adminInput} type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            <input className={adminInput} type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <button type="button" className={adminBtnSecondary} onClick={() => void handleGenerateStatement()}>Generate statement</button>
        </div>
      </AdminEditGate>

      <AdminStandardTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'company', label: 'Company' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions', className: adminTableActionsHeadClass },
        ]}
        emptyMessage="No landlords yet."
        hasRows={owners.length > 0}
      >
        {owners.map((owner) => (
          <AdminClickableTableRow key={owner.id} onOpen={() => setDetail(owner)}>
            <td className="px-4 py-3 font-medium">{owner.full_name}</td>
            <td className="px-4 py-3 text-[var(--admin-muted)]">{owner.email}</td>
            <td className="px-4 py-3">{owner.company_name ?? '—'}</td>
            <td className="px-4 py-3">{owner.is_active ? 'Active' : 'Inactive'}</td>
            <AdminTableStopCell className={adminTableActionsCellClass}>
              <AdminRowActions
                label={`Actions for ${owner.full_name}`}
                actions={[{ label: 'View details', onClick: () => setDetail(owner) }]}
              />
            </AdminTableStopCell>
          </AdminClickableTableRow>
        ))}
      </AdminStandardTable>

      <EntityDetailSheet
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.full_name ?? 'Landlord'}
        subtitle={detail?.email}
        fields={detail ? [
          { label: 'Phone', value: detail.phone ?? '—' },
          { label: 'Company', value: detail.company_name ?? '—' },
          { label: 'Tax ID', value: detail.tax_id ?? '—' },
          { label: 'Status', value: detail.is_active ? 'Active' : 'Inactive' },
        ] : []}
      />
    </div>
  )
}
