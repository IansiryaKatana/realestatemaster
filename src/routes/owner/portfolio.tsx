import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { fetchLandlordPortfolio, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'

export const Route = createFileRoute('/owner/portfolio')({
  component: OwnerPortfolioPage,
})

function OwnerPortfolioPage() {
  const { owner } = useLandlordAuth()

  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: owner?.id ? tenancyKeys.landlordPortfolio() : ['skip'],
    queryFn: () => fetchLandlordPortfolio(owner!.id),
    enabled: Boolean(owner?.id),
  })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Your properties</h1>
      {isLoading ? (
        <p className="text-muted">Loading portfolio…</p>
      ) : (
        <PortalDataTable
          columns={[
            { key: 'property', label: 'Property' },
            { key: 'reference', label: 'Reference' },
            { key: 'ownership', label: 'Ownership' },
          ]}
          isEmpty={portfolio.length === 0}
          emptyMessage="No properties assigned to your owner profile yet."
        >
          {portfolio.map((row: Record<string, unknown>) => {
            const product = row.products as { name?: string; property_reference?: string; image_url?: string } | null
            return (
              <PortalTableRow key={String(row.id)}>
                <PortalTableCell>
                  <div className="flex items-center gap-3">
                    {product?.image_url ? (
                      <img src={product.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : null}
                    <span className="font-semibold">{product?.name ?? 'Property'}</span>
                  </div>
                </PortalTableCell>
                <PortalTableCell className="text-muted">{product?.property_reference ?? '—'}</PortalTableCell>
                <PortalTableCell>{String(row.ownership_share)}%</PortalTableCell>
              </PortalTableRow>
            )
          })}
        </PortalDataTable>
      )}
    </div>
  )
}
