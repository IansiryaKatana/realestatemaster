import { Link } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { fetchClientNotifications, propertyTransactionKeys } from '@/lib/property/propertyTransactionQueries'

export function NotificationBell() {
  const { user } = useStorefrontAuth()
  const { data: notifications = [] } = useQuery({
    queryKey: propertyTransactionKeys.notifications(),
    queryFn: fetchClientNotifications,
    enabled: Boolean(user),
    staleTime: 30_000,
  })

  if (!user) return null

  const unread = notifications.filter((n) => !n.is_read).length

  return (
    <Link to="/account/notifications" aria-label="Notifications" className="relative rounded-full p-2 transition hover:bg-white/10">
      <Bell className="h-4 w-4" />
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-text-brown">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  )
}
