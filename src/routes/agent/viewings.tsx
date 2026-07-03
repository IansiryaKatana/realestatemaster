import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { notifyViewingStatus } from '@/lib/property/notifyViewingStatus'
import { viewingTimeSlotLabel } from '@/lib/property/viewingTimeSlots'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/agent/viewings')({
  component: AgentViewingsPage,
})

function statusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-900'
    case 'scheduled':
      return 'bg-emerald-100 text-emerald-900'
    case 'cancelled':
      return 'bg-red-100 text-red-900'
    default:
      return 'bg-[#efe7db] text-text-brown'
  }
}

function formatPreferredTime(time: string | null) {
  if (!time) return ''
  return viewingTimeSlotLabel(time) ?? time
}

function AgentViewingsPage() {
  const { agent } = useAgentAuth()
  const queryClient = useQueryClient()
  const { data: viewings = [], isLoading } = useQuery({
    queryKey: ['agent-viewings', agent?.id],
    enabled: Boolean(agent?.id),
    queryFn: async () => {
      const { data, error } = await tryGetSupabase()
        .from('viewing_requests')
        .select('*, products(name, property_reference)')
        .eq('assigned_agent_id', agent!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  async function updateViewing(
    viewing: (typeof viewings)[number],
    action: 'approve' | 'decline',
  ) {
    if (action === 'decline') {
      const property = viewing.products as { name?: string } | null
      const confirmed = window.confirm(
        `Decline viewing request for ${property?.name ?? 'this property'}? The client will be notified.`,
      )
      if (!confirmed) return
    }

    const result = await notifyViewingStatus({
      viewingId: viewing.id,
      action,
      scheduledDate: viewing.preferred_date ?? undefined,
      scheduledTime: viewing.preferred_time ?? undefined,
    })
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(action === 'approve' ? 'Viewing approved and client notified.' : 'Viewing declined and client notified.')
    void queryClient.invalidateQueries({ queryKey: ['agent-viewings', agent?.id] })
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold text-text-brown">Viewings</h1>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <PortalDataTable
          columns={[
            { key: 'property', label: 'Property' },
            { key: 'client', label: 'Client' },
            { key: 'preferred', label: 'Preferred time' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', className: 'text-right' },
          ]}
          isEmpty={viewings.length === 0}
          emptyMessage="No viewing requests yet."
          minWidth="880px"
        >
          {viewings.map((viewing) => {
            const property = viewing.products as { name?: string; property_reference?: string } | null
            return (
              <PortalTableRow key={viewing.id}>
                <PortalTableCell>
                  <p className="font-semibold text-text-brown">{property?.name ?? '—'}</p>
                  {property?.property_reference ? (
                    <p className="text-xs text-muted">Ref: {property.property_reference}</p>
                  ) : null}
                </PortalTableCell>
                <PortalTableCell>
                  {viewing.client_full_name ? (
                    <>
                      <p>{viewing.client_full_name}</p>
                      <p className="text-sm text-muted">
                        {viewing.client_email ?? ''}
                        {viewing.client_phone ? ` · ${viewing.client_phone}` : ''}
                      </p>
                    </>
                  ) : (
                    '—'
                  )}
                </PortalTableCell>
                <PortalTableCell className="text-muted">
                  {viewing.preferred_date ? (
                    <>
                      {viewing.preferred_date}
                      {viewing.preferred_time ? ` · ${formatPreferredTime(viewing.preferred_time)}` : ''}
                    </>
                  ) : (
                    '—'
                  )}
                </PortalTableCell>
                <PortalTableCell>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', statusClass(viewing.status))}>
                    {viewing.status.replaceAll('_', ' ')}
                  </span>
                </PortalTableCell>
                <PortalTableCell className="text-right">
                  {viewing.status === 'pending' ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" onClick={() => void updateViewing(viewing, 'approve')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void updateViewing(viewing, 'decline')}>
                        Decline
                      </Button>
                    </div>
                  ) : null}
                </PortalTableCell>
              </PortalTableRow>
            )
          })}
        </PortalDataTable>
      )}
    </div>
  )
}
