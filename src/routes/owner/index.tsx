import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { fetchLandlordPortfolio, fetchLandlordStatements, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { PortalStatCard } from '@/portals/components/PortalStatCard'
import { useFormatPrice } from '@/lib/currency'

export const Route = createFileRoute('/owner/')({
  component: OwnerDashboardPage,
})

function OwnerDashboardPage() {
  const formatPrice = useFormatPrice()
  const { owner } = useLandlordAuth()

  const { data: portfolio = [] } = useQuery({
    queryKey: owner?.id ? tenancyKeys.landlordPortfolio() : ['skip'],
    queryFn: () => fetchLandlordPortfolio(owner!.id),
    enabled: Boolean(owner?.id),
  })

  const { data: statements = [] } = useQuery({
    queryKey: owner?.id ? [...tenancyKeys.all, 'statements', owner.id] : ['skip'],
    queryFn: () => fetchLandlordStatements(owner!.id),
    enabled: Boolean(owner?.id),
  })

  const latestStatement = statements[0]
  const totalUnits = portfolio.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-text-brown">Portfolio overview</h1>
        <p className="mt-1 text-sm text-muted">Welcome, {owner?.full_name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStatCard label="Managed units" value={String(totalUnits)} />
        <PortalStatCard
          label="Latest net payout"
          value={latestStatement ? formatPrice(Number(latestStatement.net_payout)) : '—'}
        />
        <PortalStatCard label="Statements" value={String(statements.length)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/owner/portfolio" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="font-semibold text-text-brown">View properties</p>
          <p className="mt-1 text-sm text-muted">Occupancy and unit details</p>
        </Link>
        <Link to="/owner/statements" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="font-semibold text-text-brown">Financial statements</p>
          <p className="mt-1 text-sm text-muted">Rent collected and management fees</p>
        </Link>
      </div>
    </div>
  )
}
