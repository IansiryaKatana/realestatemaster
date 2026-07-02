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
      aria-label="Notifications"
      className="relative rounded-full p-2 transition hover:bg-[#efe8dd]"
    >
      <Bell className="h-4 w-4" />
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hero-brown px-1 text-[9px] font-bold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  )
}
