import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchRoleNotifications, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { tryGetSupabase } from '@/integrations/supabase/client'
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
      ) : notifications.length === 0 ? (
        <p className="text-sm text-muted">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border border-[#e8e0d4] bg-white p-4 ${n.is_read ? 'opacity-70' : ''}`}
              onClick={() => void markRead(n.id)}
              onKeyDown={() => {}}
              role="button"
              tabIndex={0}
            >
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
              <p className="mt-2 text-xs text-muted">{formatOrdinalShortDate(n.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
