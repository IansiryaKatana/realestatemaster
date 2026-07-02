import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { tryGetSupabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/database.types'
import { AdminLoadingState, AdminInfoBanner } from '@/admin/components/AdminPageHeading'
import { AdminSheet } from '@/admin/components/AdminSheet'
import { AdminClickableTableRow } from '@/admin/components/AdminClickableTableRow'
import { adminLabel } from '@/admin/adminClassNames'
import { formatCurrency, useFormatPrice } from '@/lib/currency'
import {
  TRANSACTION_STATUS_STEPS,
  transactionStatusIndex,
  transactionStatusLabel,
} from '@/lib/property/transactionStatuses'
import { cn } from '@/lib/utils'

type TransactionRow = Database['public']['Tables']['property_transactions']['Row']
type ViewingRow = Database['public']['Tables']['viewing_requests']['Row']
type HandoverRow = Database['public']['Tables']['handover_records']['Row']
type InvoiceRow = Database['public']['Tables']['invoices']['Row']
type GeneratedContractRow = Database['public']['Tables']['generated_contracts']['Row']
type UploadedContractRow = Database['public']['Tables']['uploaded_contracts']['Row']
type PaymentBreakdownRow = Database['public']['Tables']['payment_breakdowns']['Row']

type TransactionDetail = {
  propertyName: string | null
  agentName: string | null
  viewings: ViewingRow[]
  handover: HandoverRow | null
  invoices: InvoiceRow[]
  generatedContracts: GeneratedContractRow[]
  uploadedContracts: UploadedContractRow[]
  paymentBreakdowns: PaymentBreakdownRow[]
}

function TransactionWorkflowTimeline({ status }: { status: string }) {
  const currentIdx = transactionStatusIndex(status)
  const isTerminal = status === 'cancelled' || status === 'rejected'

  return (
    <ol className="space-y-2">
      {TRANSACTION_STATUS_STEPS.map((step, idx) => {
        const done = !isTerminal && idx < currentIdx
        const current = !isTerminal && step === status
        return (
          <li
            key={step}
            className={cn(
              'flex items-center gap-2 rounded-[var(--admin-radius)] px-3 py-2 text-sm',
              current && 'bg-[var(--admin-primary-muted)] font-medium text-[var(--admin-text)]',
              done && 'text-[var(--admin-muted)]',
              !done && !current && 'text-[var(--admin-muted)]/60',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                done && 'bg-emerald-100 text-emerald-800',
                current && 'bg-[var(--admin-primary)] text-white',
                !done && !current && 'bg-[var(--admin-surface)] text-[var(--admin-muted)]',
              )}
            >
              {done ? '✓' : idx + 1}
            </span>
            {transactionStatusLabel(step)}
          </li>
        )
      })}
      {isTerminal ? (
        <li className="rounded-[var(--admin-radius)] bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {transactionStatusLabel(status)}
        </li>
      ) : null}
    </ol>
  )
}

function StageSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <p className={adminLabel}>{title}</p>
      <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-3 text-sm">{children}</div>
    </section>
  )
}

export function AdminPropertyTransactions() {
  const formatPrice = useFormatPrice()
  const [rows, setRows] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<TransactionRow | null>(null)
  const [detailData, setDetailData] = useState<TransactionDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await tryGetSupabase()
      .from('property_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) toast.error(error.message)
    setRows(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function openDetail(row: TransactionRow) {
    setDetail(row)
    setDetailLoading(true)
    setDetailData(null)

    const sb = tryGetSupabase()
    const [
      propertyRes,
      agentRes,
      viewingsRes,
      handoverRes,
      invoicesRes,
      generatedRes,
      uploadedRes,
      breakdownRes,
    ] = await Promise.all([
      sb.from('products').select('name').eq('id', row.property_id).maybeSingle(),
      row.assigned_agent_id
        ? sb.from('agents').select('name').eq('id', row.assigned_agent_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      sb.from('viewing_requests').select('*').eq('transaction_id', row.id).order('created_at', { ascending: false }),
      sb.from('handover_records').select('*').eq('transaction_id', row.id).maybeSingle(),
      sb.from('invoices').select('*').eq('transaction_id', row.id).order('issued_at', { ascending: false }),
      sb.from('generated_contracts').select('*').eq('transaction_id', row.id).order('created_at', { ascending: false }),
      sb.from('uploaded_contracts').select('*').eq('transaction_id', row.id).order('created_at', { ascending: false }),
      sb.from('payment_breakdowns').select('*').eq('transaction_id', row.id).order('sort_order'),
    ])

    if (propertyRes.error || agentRes.error) toast.error('Failed to load transaction details')

    setDetailData({
      propertyName: propertyRes.data?.name ?? null,
      agentName: agentRes.data?.name ?? null,
      viewings: viewingsRes.data ?? [],
      handover: handoverRes.data ?? null,
      invoices: invoicesRes.data ?? [],
      generatedContracts: generatedRes.data ?? [],
      uploadedContracts: uploadedRes.data ?? [],
      paymentBreakdowns: breakdownRes.data ?? [],
    })
    setDetailLoading(false)
  }

  if (loading) return <AdminLoadingState />

  return (
    <div className="space-y-4">
      <AdminInfoBanner>
        Track viewing, contract, payment, and handover status here. Completed Stripe or quote payments appear under{' '}
        <Link to="/admin/commerce" search={{ tab: 'orders' }} className="font-medium underline underline-offset-2">
          Payments & Clients → Payment records
        </Link>
        . Invoices are listed under{' '}
        <Link to="/admin/real-estate" search={{ tab: 'invoices' }} className="font-medium underline underline-offset-2">
          Real Estate → Invoices
        </Link>
        .
      </AdminInfoBanner>

      <div className="admin-table-frame">
        <div className="admin-table-wrap">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--admin-surface)] text-[var(--admin-muted)]">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--admin-muted)]">
                    No property transactions yet. Transactions begin when a client inquires, books a viewing, or starts a rent/buy application.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <AdminClickableTableRow key={row.id} onOpen={() => void openDetail(row)}>
                    <td className="px-4 py-3 font-medium">{row.transaction_number}</td>
                    <td className="px-4 py-3">{row.client_email}</td>
                    <td className="px-4 py-3 capitalize">{row.listing_type === 'rent' ? 'Rental' : 'Sale'}</td>
                    <td className="px-4 py-3">{transactionStatusLabel(row.status)}</td>
                    <td className="px-4 py-3 text-[var(--admin-muted)]">{new Date(row.created_at).toLocaleDateString()}</td>
                  </AdminClickableTableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminSheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) {
            setDetail(null)
            setDetailData(null)
          }
        }}
        title={detail?.transaction_number ?? 'Transaction'}
        subtitle={detail ? `${detail.client_email} · ${transactionStatusLabel(detail.status)}` : undefined}
        size="xl"
      >
        {detailLoading ? (
          <p className="text-sm text-[var(--admin-muted)]">Loading transaction details…</p>
        ) : detail && detailData ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <StageSection title="Overview">
                <dl className="space-y-2">
                  <div><span className="text-[var(--admin-muted)]">Property:</span> {detailData.propertyName ?? '—'}</div>
                  <div><span className="text-[var(--admin-muted)]">Listing:</span> {detail.listing_type === 'rent' ? 'Rental' : 'Sale'}</div>
                  <div><span className="text-[var(--admin-muted)]">Agent:</span> {detailData.agentName ?? 'Unassigned'}</div>
                  <div><span className="text-[var(--admin-muted)]">Started:</span> {new Date(detail.created_at).toLocaleString()}</div>
                  {detail.order_id ? (
                    <div>
                      <span className="text-[var(--admin-muted)]">Payment record:</span>{' '}
                      <Link to="/admin/commerce" search={{ tab: 'orders' }} className="underline underline-offset-2">
                        View in Payments & Clients
                      </Link>
                    </div>
                  ) : null}
                </dl>
              </StageSection>

              <StageSection title="Workflow progress">
                <TransactionWorkflowTimeline status={detail.status} />
              </StageSection>
            </div>

            <div className="space-y-4">
              <StageSection title="Viewings">
                {detailData.viewings.length === 0 ? (
                  <p className="text-[var(--admin-muted)]">No viewing requests yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {detailData.viewings.map((v) => (
                      <li key={v.id} className="rounded border border-[var(--admin-border)] p-2">
                        <p className="font-medium capitalize">{v.status.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-[var(--admin-muted)]">
                          Preferred: {v.preferred_date ?? '—'} {v.preferred_time ?? ''}
                          {v.scheduled_date ? ` · Scheduled: ${v.scheduled_date} ${v.scheduled_time ?? ''}` : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </StageSection>

              <StageSection title="Contracts">
                {detailData.generatedContracts.length === 0 && detailData.uploadedContracts.length === 0 ? (
                  <p className="text-[var(--admin-muted)]">No contracts generated or uploaded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {detailData.generatedContracts.map((c) => (
                      <li key={c.id} className="rounded border border-[var(--admin-border)] p-2">
                        <p className="font-medium">Generated {c.file_name ?? 'contract'}</p>
                        <p className="text-xs text-[var(--admin-muted)]">{new Date(c.created_at).toLocaleString()}</p>
                        {c.file_url ? (
                          <a href={c.file_url} target="_blank" rel="noreferrer" className="text-xs underline">
                            Download
                          </a>
                        ) : null}
                      </li>
                    ))}
                    {detailData.uploadedContracts.map((c) => (
                      <li key={c.id} className="rounded border border-[var(--admin-border)] p-2">
                        <p className="font-medium capitalize">Signed upload · {c.review_status.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-[var(--admin-muted)]">{new Date(c.created_at).toLocaleString()}</p>
                        {c.review_notes ? <p className="mt-1 text-xs">{c.review_notes}</p> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </StageSection>

              <StageSection title="Payment breakdown">
                {detailData.paymentBreakdowns.length === 0 ? (
                  <p className="text-[var(--admin-muted)]">No payment breakdown lines yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {detailData.paymentBreakdowns.map((line) => (
                      <li key={line.id} className="flex justify-between gap-2">
                        <span>{line.label}</span>
                        <span>{formatPrice(line.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </StageSection>

              <StageSection title="Invoices">
                {detailData.invoices.length === 0 ? (
                  <p className="text-[var(--admin-muted)]">No invoices issued yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {detailData.invoices.map((inv) => (
                      <li key={inv.id} className="flex justify-between gap-2 rounded border border-[var(--admin-border)] p-2">
                        <div>
                          <p className="font-medium">{inv.invoice_number}</p>
                          <p className="text-xs capitalize text-[var(--admin-muted)]">{inv.payment_status.replace(/_/g, ' ')}</p>
                        </div>
                        <span>{formatCurrency(Number(inv.total_amount), { code: inv.currency })}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </StageSection>

              <StageSection title="Handover">
                {!detailData.handover ? (
                  <p className="text-[var(--admin-muted)]">Handover not scheduled yet.</p>
                ) : (
                  <dl className="space-y-2">
                    <div><span className="text-[var(--admin-muted)]">Status:</span> <span className="capitalize">{detailData.handover.status}</span></div>
                    {detailData.handover.handover_date ? (
                      <div>
                        <span className="text-[var(--admin-muted)]">Date:</span> {detailData.handover.handover_date}
                        {detailData.handover.handover_time ? ` at ${detailData.handover.handover_time}` : ''}
                      </div>
                    ) : null}
                    {detailData.handover.meeting_location ? (
                      <div><span className="text-[var(--admin-muted)]">Location:</span> {detailData.handover.meeting_location}</div>
                    ) : null}
                    {detailData.handover.agent_notes ? (
                      <div><span className="text-[var(--admin-muted)]">Notes:</span> {detailData.handover.agent_notes}</div>
                    ) : null}
                  </dl>
                )}
              </StageSection>
            </div>
          </div>
        ) : null}
      </AdminSheet>
    </div>
  )
}
