import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { fetchLandlordStatements } from '@/lib/tenancy/tenancyQueries'
import { useFormatPrice } from '@/lib/currency'
import { formatOrdinalShortDate } from '@/lib/utils'

export const Route = createFileRoute('/owner/statements')({
  component: OwnerStatementsPage,
})

function OwnerStatementsPage() {
  const formatPrice = useFormatPrice()
  const { owner } = useLandlordAuth()

  const { data: statements = [], isLoading } = useQuery({
    queryKey: owner?.id ? ['tenancy', 'statements', owner.id] : ['skip'],
    queryFn: () => fetchLandlordStatements(owner!.id),
    enabled: Boolean(owner?.id),
  })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Financial statements</h1>
      {isLoading ? (
        <p className="text-muted">Loading statements…</p>
      ) : statements.length === 0 ? (
        <p className="text-sm text-muted">No statements generated yet. Your agency will publish monthly reports here.</p>
      ) : (
        <div className="space-y-3">
          {statements.map((stmt) => (
            <div key={stmt.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
              <p className="font-semibold">
                {formatOrdinalShortDate(stmt.period_start)} — {formatOrdinalShortDate(stmt.period_end)}
              </p>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <p>Gross rent: {formatPrice(Number(stmt.gross_rent))}</p>
                <p>Fees: {formatPrice(Number(stmt.fees))}</p>
                <p className="font-medium">Net payout: {formatPrice(Number(stmt.net_payout))}</p>
              </div>
              {stmt.pdf_url ? (
                <a href={stmt.pdf_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-cta-brown underline">
                  Download PDF
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
