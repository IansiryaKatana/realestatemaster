import { Link } from '@tanstack/react-router'
import type { ClientTransactionSummary } from '@/lib/property/propertyTransactionQueries'
import { transactionStatusLabel } from '@/lib/property/transactionStatuses'
import { useFormatPrice } from '@/lib/currency'
import { Button } from '@/components/ui/button'

export function TransactionListTable({ transactions }: { transactions: ClientTransactionSummary[] }) {
  const formatPrice = useFormatPrice()

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-[#e8e0d4] p-10 text-center">
        <p className="text-muted">No property applications yet.</p>
        <Button asChild className="mt-4">
          <Link to="/">Browse properties</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#e8e0d4]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#f8f4ee] text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Property</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-t border-[#efe7db]">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {tx.property_image_url ? (
                    <img src={tx.property_image_url} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : null}
                  <span className="font-semibold text-text-brown">{tx.property_name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted">{tx.transaction_number}</td>
              <td className="px-4 py-3 capitalize">{tx.listing_type}</td>
              <td className="px-4 py-3">{transactionStatusLabel(tx.status)}</td>
              <td className="px-4 py-3">{formatPrice(tx.property_price)}</td>
              <td className="px-4 py-3 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link to="/account/transactions/$transactionId" params={{ transactionId: tx.id }}>
                    View
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
