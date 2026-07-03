import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { fetchAgentLeases, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
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
      ) : (
        <PortalDataTable
          columns={[
            { key: 'property', label: 'Property' },
            { key: 'reference', label: 'Reference' },
            { key: 'rent', label: 'Rent' },
            { key: 'status', label: 'Status' },
          ]}
          isEmpty={leases.length === 0}
          emptyMessage="No active tenancies on your assigned properties."
        >
          {leases.map((lease) => (
            <PortalTableRow key={lease.id}>
              <PortalTableCell className="font-semibold">{lease.products?.name ?? 'Property'}</PortalTableCell>
              <PortalTableCell className="text-muted">{lease.products?.property_reference ?? '—'}</PortalTableCell>
              <PortalTableCell>{formatPrice(Number(lease.rent_amount))}/period</PortalTableCell>
              <PortalTableCell>
                <PortalStatusBadge status={lease.status} />
              </PortalTableCell>
            </PortalTableRow>
          ))}
        </PortalDataTable>
      )}
    </div>
  )
}
