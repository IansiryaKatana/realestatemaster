import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { transactionStatusLabel } from '@/lib/property/transactionStatuses'

type ActiveTransaction = {
  id: string
  transaction_number: string
  client_email: string
  status: string
}

export function AdminActiveTransactionsPanel() {
  const [items, setItems] = useState<ActiveTransaction[]>([])

  useEffect(() => {
    void tryGetSupabase()
      .from('property_transactions')
      .select('id, transaction_number, client_email, status')
      .not('status', 'in', '(transaction_completed,cancelled,rejected)')
      .order('updated_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setItems(data ?? []))
  }, [])

  if (items.length === 0) return null

  return (
    <section className="admin-section mt-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--admin-text)]">Active property transactions</h2>
        <Link to="/admin/real-estate" search={{ tab: 'transactions' }} className="text-sm font-medium underline underline-offset-2">
          View all
        </Link>
      </div>
      <div className="admin-table-wrap admin-table-wrap--rows">
        <table className="w-full min-w-0 text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-border)] text-[var(--admin-muted)]">
              <th className="pb-2 pr-4 font-medium">Reference</th>
              <th className="hidden pb-2 pr-4 font-medium sm:table-cell">Client</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-[var(--admin-border)] last:border-0">
                <td className="py-3 pr-4 font-medium">{row.transaction_number}</td>
                <td className="hidden py-3 pr-4 text-[var(--admin-muted)] sm:table-cell">{row.client_email}</td>
                <td className="py-3 text-[var(--admin-muted)]">{transactionStatusLabel(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
