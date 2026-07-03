import { Link } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { fetchRoleNotifications, tenancyKeys } from '@/lib/tenancy/tenancyQueries'

type PortalRole = 'client' | 'tenant' | 'landlord' | 'agent'

export function PortalNotificationBell({
  role,
  notificationsPath,
}: {
  role: PortalRole
  notificationsPath: string
}) {
  const { user } = useStorefrontAuth()
  const { data: notifications = [] } = useQuery({
    queryKey: tenancyKeys.notifications(role),
    queryFn: () => fetchRoleNotifications(role),
    enabled: Boolean(user),
    staleTime: 30_000,
  })

  if (!user) return null

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <Link
      to={notificationsPath}
      aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
      className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[#efe8dd]"
    >
      <Bell className="h-4 w-4" aria-hidden />
      {unread > 0 ? (
        <span className="pointer-events-none absolute right-0 top-0 flex h-4 min-w-4 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-hero-brown px-1 text-[9px] font-bold leading-none text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  )
}
