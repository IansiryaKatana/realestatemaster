import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { fetchTenantInstallments, fetchServiceRequests, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { PortalStatCard } from '@/portals/components/PortalStatCard'
import { useFormatPrice } from '@/lib/currency'
import { formatOrdinalShortDate } from '@/lib/utils'

export const Route = createFileRoute('/tenant/')({
  component: TenantDashboardPage,
})

function TenantDashboardPage() {
  const formatPrice = useFormatPrice()
  const { lease } = useTenantAuth()
  const leaseId = lease?.id

  const { data: installments = [] } = useQuery({
    queryKey: leaseId ? tenancyKeys.installments(leaseId) : ['skip'],
    queryFn: () => fetchTenantInstallments(leaseId!),
    enabled: Boolean(leaseId),
  })

  const { data: complaints = [] } = useQuery({
    queryKey: tenancyKeys.serviceRequests('complaint'),
    queryFn: () => fetchServiceRequests('complaint'),
  })

  const nextDue = installments.find((i) => ['due', 'overdue', 'scheduled'].includes(i.status))
  const openRequests = complaints.filter((c) => ['open', 'in_progress'].includes(c.status)).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-text-brown">Your tenancy</h1>
        <p className="mt-1 text-sm text-muted">{lease?.products?.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStatCard label="Monthly rent" value={formatPrice(Number(lease?.rent_amount ?? 0))} />
        <PortalStatCard
          label="Next payment"
          value={nextDue ? formatOrdinalShortDate(nextDue.due_date) : '—'}
          hint={nextDue ? formatPrice(Number(nextDue.amount)) : undefined}
        />
        <PortalStatCard label="Open requests" value={String(openRequests)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/tenant/rent" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="font-semibold text-text-brown">Rent & payments</p>
          <p className="mt-1 text-sm text-muted">View schedule, pay online, or upload proof</p>
        </Link>
        <Link to="/tenant/move-in" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="font-semibold text-text-brown">Move-in checklist</p>
          <p className="mt-1 text-sm text-muted">Keys, Ejari, DEWA, and inspection items</p>
        </Link>
      </div>
    </div>
  )
}
