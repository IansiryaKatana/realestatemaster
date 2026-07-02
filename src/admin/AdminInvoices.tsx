import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { tryGetSupabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/database.types'
import { AdminLoadingState, AdminInfoBanner } from '@/admin/components/AdminPageHeading'
import { useAdminTabActions } from '@/admin/components/AdminTabActionsContext'
import { EntityDetailSheet } from '@/admin/components/EntityDetailSheet'
import { AdminClickableTableRow } from '@/admin/components/AdminClickableTableRow'
import { adminBtnSecondary, adminInput } from '@/admin/adminClassNames'
import { formatCurrency, useFormatPrice } from '@/lib/currency'
import { transactionStatusLabel } from '@/lib/property/transactionStatuses'

type InvoiceRow = Database['public']['Tables']['invoices']['Row']
type TransactionRow = Database['public']['Tables']['property_transactions']['Row']

type InvoiceWithMeta = InvoiceRow & {
  transaction_number?: string | null
  transaction_status?: string | null
}

export function AdminInvoices() {
  const formatPrice = useFormatPrice()
  const [rows, setRows] = useState<InvoiceWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<InvoiceWithMeta | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const sb = tryGetSupabase()
    const { data: invoices, error } = await sb
      .from('invoices')
      .select('*')
      .order('issued_at', { ascending: false })
      .limit(100)

    if (error) {
      toast.error(error.message)
      setRows([])
      setLoading(false)
      return
    }

    const txIds = [...new Set((invoices ?? []).map((inv) => inv.transaction_id))]
    let txMap = new Map<string, TransactionRow>()
    if (txIds.length > 0) {
      const { data: transactions } = await sb.from('property_transactions').select('*').in('id', txIds)
      txMap = new Map((transactions ?? []).map((tx) => [tx.id, tx]))
    }

    setRows(
      (invoices ?? []).map((invoice) => {
        const tx = txMap.get(invoice.transaction_id)
        return {
          ...invoice,
          transaction_number: tx?.transaction_number ?? null,
          transaction_status: tx?.status ?? null,
        }
      }),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useAdminTabActions(
    <button type="button" className={adminBtnSecondary} onClick={() => void refresh()}>
      <RefreshCw className="h-4 w-4" />
      Refresh
    </button>,
    [refresh],
  )

  const filtered = rows.filter((row) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      row.invoice_number.toLowerCase().includes(q) ||
      row.client_email.toLowerCase().includes(q) ||
      (row.transaction_number?.toLowerCase().includes(q) ?? false)
    )
  })

  if (loading) return <AdminLoadingState />

  return (
    <div className="space-y-4">
      <AdminInfoBanner>
        Invoices are generated after payment or when a payment request is created. Open the linked transaction under{' '}
        <Link to="/admin/real-estate" search={{ tab: 'transactions' }} className="font-medium underline underline-offset-2">
          Real Estate → Transactions
        </Link>{' '}
        for the full viewing, contract, and handover workflow.
      </AdminInfoBanner>

      <div className="admin-search-row max-w-md">
        <input
          className={adminInput}
          placeholder="Search invoice #, client, or transaction…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-frame">
        <div className="admin-table-wrap">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--admin-surface)] text-[var(--admin-muted)]">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Issued</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--admin-muted)]">
                    No invoices yet. Invoices appear when clients complete payment on an approved property transaction.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <AdminClickableTableRow key={row.id} onOpen={() => setDetail(row)}>
                    <td className="px-4 py-3 font-medium">{row.invoice_number}</td>
                    <td className="px-4 py-3">{row.client_email}</td>
                    <td className="px-4 py-3">{row.transaction_number ?? '—'}</td>
                    <td className="px-4 py-3">{formatPrice(Number(row.total_amount))}</td>
                    <td className="px-4 py-3 capitalize">{row.payment_status.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-[var(--admin-muted)]">{new Date(row.issued_at).toLocaleDateString()}</td>
                  </AdminClickableTableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EntityDetailSheet
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.invoice_number ?? ''}
        subtitle={detail?.client_email}
        fields={
          detail
            ? [
                { label: 'Amount', value: formatCurrency(Number(detail.total_amount), { code: detail.currency }) },
                { label: 'Payment status', value: detail.payment_status.replace(/_/g, ' ') },
                { label: 'Transaction', value: detail.transaction_number ?? '—' },
                {
                  label: 'Transaction status',
                  value: detail.transaction_status ? transactionStatusLabel(detail.transaction_status) : '—',
                },
                { label: 'Issued', value: new Date(detail.issued_at).toLocaleString() },
                {
                  label: 'Download',
                  value: detail.file_url ? (
                    <a href={detail.file_url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                      Open invoice PDF
                    </a>
                  ) : (
                    '—'
                  ),
                },
              ]
            : []
        }
        footer={
          detail?.transaction_id ? (
            <Link
              to="/admin/real-estate"
              search={{ tab: 'transactions' }}
              className={`${adminBtnSecondary} block w-full text-center`}
            >
              View property transaction
            </Link>
          ) : null
        }
      />
    </div>
  )
}
