import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { fetchServiceRequests } from '@/lib/tenancy/tenancyQueries'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'

export const Route = createFileRoute('/owner/maintenance')({
  component: OwnerMaintenancePage,
})

function OwnerMaintenancePage() {
  const { owner } = useLandlordAuth()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['tenancy', 'owner-maintenance', owner?.id],
    queryFn: () => fetchServiceRequests('maintenance'),
    enabled: Boolean(owner?.id),
  })

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Maintenance on your units</h1>
      <p className="text-sm text-muted">Read-only view of maintenance work orders on properties you own.</p>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <PortalDataTable
          columns={[
            { key: 'title', label: 'Issue' },
            { key: 'property', label: 'Property' },
            { key: 'description', label: 'Details' },
            { key: 'status', label: 'Status' },
          ]}
          isEmpty={requests.length === 0}
          emptyMessage="No maintenance requests on your properties."
          minWidth="720px"
        >
          {requests.map((req) => (
            <PortalTableRow key={req.id}>
              <PortalTableCell className="font-medium">{req.title}</PortalTableCell>
              <PortalTableCell>{req.products?.name ?? 'Property'}</PortalTableCell>
              <PortalTableCell className="max-w-md text-muted">{req.description}</PortalTableCell>
              <PortalTableCell>
                <PortalStatusBadge status={req.status} />
              </PortalTableCell>
            </PortalTableRow>
          ))}
        </PortalDataTable>
      )}
    </div>
  )
}
