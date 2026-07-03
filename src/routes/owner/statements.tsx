import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { fetchLandlordStatements } from '@/lib/tenancy/tenancyQueries'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
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
      ) : (
        <PortalDataTable
          columns={[
            { key: 'period', label: 'Period' },
            { key: 'gross', label: 'Gross rent' },
            { key: 'fees', label: 'Fees' },
            { key: 'net', label: 'Net payout' },
            { key: 'pdf', label: 'PDF' },
          ]}
          isEmpty={statements.length === 0}
          emptyMessage="No statements generated yet. Your agency will publish monthly reports here."
          minWidth="720px"
        >
          {statements.map((stmt) => (
            <PortalTableRow key={stmt.id}>
              <PortalTableCell className="font-semibold">
                {formatOrdinalShortDate(stmt.period_start)} — {formatOrdinalShortDate(stmt.period_end)}
              </PortalTableCell>
              <PortalTableCell>{formatPrice(Number(stmt.gross_rent))}</PortalTableCell>
              <PortalTableCell>{formatPrice(Number(stmt.fees))}</PortalTableCell>
              <PortalTableCell className="font-medium">{formatPrice(Number(stmt.net_payout))}</PortalTableCell>
              <PortalTableCell>
                {stmt.pdf_url ? (
                  <a href={stmt.pdf_url} target="_blank" rel="noreferrer" className="text-cta-brown underline">
                    Download
                  </a>
                ) : (
                  '—'
                )}
              </PortalTableCell>
            </PortalTableRow>
          ))}
        </PortalDataTable>
      )}
    </div>
  )
}
