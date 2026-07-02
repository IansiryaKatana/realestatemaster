import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { fetchLandlordPortfolio, tenancyKeys } from '@/lib/tenancy/tenancyQueries'

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
      ) : portfolio.length === 0 ? (
        <p className="text-sm text-muted">No properties assigned to your owner profile yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {portfolio.map((row: Record<string, unknown>) => {
            const product = row.products as { name?: string; property_reference?: string; image_url?: string } | null
            return (
              <div key={String(row.id)} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
                {product?.image_url ? (
                  <img src={product.image_url} alt="" className="mb-3 h-32 w-full rounded-lg object-cover" />
                ) : null}
                <p className="font-semibold">{product?.name ?? 'Property'}</p>
                <p className="text-sm text-muted">Ref: {product?.property_reference ?? '—'}</p>
                <p className="mt-2 text-sm">Ownership: {String(row.ownership_share)}%</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
