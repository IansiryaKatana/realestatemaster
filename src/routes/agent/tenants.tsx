import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { fetchAgentLeases, fetchServiceRequests, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { useFormatPrice } from '@/lib/currency'

export const Route = createFileRoute('/agent/tenants')({
  component: AgentTenantsPage,
})

function AgentTenantsPage() {
  const formatPrice = useFormatPrice()
  const { agent } = useAgentAuth()

  const { data: leases = [], isLoading } = useQuery({
    queryKey: agent?.id ? [...tenancyKeys.leases(), 'agent', agent.id] : ['skip'],
    queryFn: () => fetchAgentLeases(agent!.id),
    enabled: Boolean(agent?.id),
  })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Assigned tenants</h1>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : leases.length === 0 ? (
        <p className="text-sm text-muted">No active tenancies on your assigned properties.</p>
      ) : (
        <div className="space-y-3">
          {leases.map((lease) => (
            <div key={lease.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{lease.products?.name ?? 'Property'}</p>
                  <p className="text-sm text-muted">Ref: {lease.products?.property_reference ?? '—'}</p>
                </div>
                <div className="text-right">
                  <PortalStatusBadge status={lease.status} />
                  <p className="mt-1 text-sm">{formatPrice(Number(lease.rent_amount))}/period</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
