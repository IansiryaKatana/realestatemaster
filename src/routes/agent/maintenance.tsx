import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { fetchServiceRequests, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { updateServiceRequestStatus } from '@/lib/tenancy/tenancyRpc'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
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
      ) : (
        <PortalDataTable
          columns={[
            { key: 'title', label: 'Issue' },
            { key: 'property', label: 'Property' },
            { key: 'description', label: 'Details' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', className: 'text-right' },
          ]}
          isEmpty={requests.length === 0}
          emptyMessage="No maintenance requests assigned to you."
          minWidth="800px"
        >
          {requests.map((req) => (
            <PortalTableRow key={req.id}>
              <PortalTableCell className="font-semibold">{req.title}</PortalTableCell>
              <PortalTableCell>{req.products?.name ?? 'Property'}</PortalTableCell>
              <PortalTableCell className="max-w-xs text-muted">{req.description}</PortalTableCell>
              <PortalTableCell>
                <PortalStatusBadge status={req.status} />
              </PortalTableCell>
              <PortalTableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  {req.status === 'open' ? (
                    <Button size="sm" variant="outline" onClick={() => void setStatus(req.id, 'in_progress')}>
                      Start work
                    </Button>
                  ) : null}
                  {req.status === 'in_progress' ? (
                    <Button size="sm" onClick={() => void setStatus(req.id, 'resolved')}>
                      Mark resolved
                    </Button>
                  ) : null}
                </div>
              </PortalTableCell>
            </PortalTableRow>
          ))}
        </PortalDataTable>
      )}
    </div>
  )
}
