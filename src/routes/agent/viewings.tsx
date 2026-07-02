import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { notifyViewingStatus } from '@/lib/property/notifyViewingStatus'
import { viewingTimeSlotLabel } from '@/lib/property/viewingTimeSlots'
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
      {isLoading ? <p className="text-muted">Loading…</p> : viewings.length === 0 ? (
        <p className="text-sm text-muted">No viewing requests yet.</p>
      ) : (
        <div className="space-y-3">
          {viewings.map((viewing) => {
            const property = viewing.products as { name?: string; property_reference?: string } | null
            return (
              <article key={viewing.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-brown">{property?.name}</p>
                    {property?.property_reference ? (
                      <p className="text-xs text-muted">Ref: {property.property_reference}</p>
                    ) : null}
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', statusClass(viewing.status))}>
                    {viewing.status.replaceAll('_', ' ')}
                  </span>
                </div>
                {viewing.client_full_name ? (
                  <p className="mt-2 text-sm text-text-brown">
                    {viewing.client_full_name}
                    {viewing.client_email ? ` · ${viewing.client_email}` : ''}
                    {viewing.client_phone ? ` · ${viewing.client_phone}` : ''}
                  </p>
                ) : null}
                {viewing.preferred_date ? (
                  <p className="mt-1 text-sm text-muted">
                    Preferred: {viewing.preferred_date}
                    {viewing.preferred_time ? ` · ${formatPreferredTime(viewing.preferred_time)}` : ''}
                  </p>
                ) : null}
                {viewing.status === 'pending' ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => void updateViewing(viewing, 'approve')}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => void updateViewing(viewing, 'decline')}>Decline</Button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
