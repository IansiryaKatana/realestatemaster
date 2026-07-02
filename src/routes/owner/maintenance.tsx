import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { fetchServiceRequests } from '@/lib/tenancy/tenancyQueries'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'

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
      ) : requests.length === 0 ? (
        <p className="text-sm text-muted">No maintenance requests on your properties.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{req.title}</p>
                  <p className="text-sm text-muted">{req.products?.name ?? 'Property'}</p>
                  <p className="mt-2 text-sm">{req.description}</p>
                </div>
                <PortalStatusBadge status={req.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
