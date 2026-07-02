import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { fetchServiceRequests, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { updateServiceRequestStatus } from '@/lib/tenancy/tenancyRpc'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/agent/maintenance')({
  component: AgentMaintenancePage,
})

function AgentMaintenancePage() {
  const { agent } = useAgentAuth()

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: [...tenancyKeys.serviceRequests('maintenance'), 'agent', agent?.id],
    queryFn: async () => {
      const all = await fetchServiceRequests('maintenance')
      return all.filter((r) => r.assigned_agent_id === agent?.id)
    },
    enabled: Boolean(agent?.id),
  })

  async function setStatus(id: string, status: string) {
    try {
      await updateServiceRequestStatus(id, status, agent?.id)
      toast.success('Status updated')
      void refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Maintenance</h1>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-muted">No maintenance requests assigned to you.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{req.title}</p>
                  <p className="text-sm text-muted">{req.products?.name ?? 'Property'}</p>
                  <p className="mt-2 text-sm">{req.description}</p>
                </div>
                <PortalStatusBadge status={req.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {req.status === 'open' ? (
                  <Button size="sm" variant="outline" onClick={() => void setStatus(req.id, 'in_progress')}>Start work</Button>
                ) : null}
                {req.status === 'in_progress' ? (
                  <Button size="sm" onClick={() => void setStatus(req.id, 'resolved')}>Mark resolved</Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
