import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRoleNotifications, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
import { formatOrdinalShortDate } from '@/lib/utils'

export const Route = createFileRoute('/tenant/notifications')({
  component: TenantNotificationsPage,
})

function TenantNotificationsPage() {
  const queryClient = useQueryClient()
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: tenancyKeys.notifications('tenant'),
    queryFn: () => fetchRoleNotifications('tenant'),
  })

  async function markRead(id: string) {
    const supabase = tryGetSupabase()
    if (!supabase) return
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    void queryClient.invalidateQueries({ queryKey: tenancyKeys.notifications('tenant') })
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Notifications</h1>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <PortalDataTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'body', label: 'Message' },
            { key: 'date', label: 'Date' },
          ]}
          isEmpty={notifications.length === 0}
          emptyMessage="No notifications yet."
        >
          {notifications.map((n) => (
            <PortalTableRow
              key={n.id}
              className={n.is_read ? 'opacity-70' : undefined}
              onClick={() => void markRead(n.id)}
            >
              <PortalTableCell className="font-medium">{n.title}</PortalTableCell>
              <PortalTableCell className="max-w-md text-muted">{n.body}</PortalTableCell>
              <PortalTableCell className="text-muted">{formatOrdinalShortDate(n.created_at)}</PortalTableCell>
            </PortalTableRow>
          ))}
        </PortalDataTable>
      )}
    </div>
  )
}
