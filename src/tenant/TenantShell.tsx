import { useRouterState } from '@tanstack/react-router'
import {
  Bell,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Wallet,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { PortalShell } from '@/portals/PortalShell'
import { PortalNotificationBell } from '@/portals/components/PortalNotificationBell'

const NAV = [
  { label: 'Home', to: '/tenant', icon: LayoutDashboard, exact: true },
  { label: 'Rent & payments', to: '/tenant/rent', icon: Wallet },
  { label: 'Complaints', to: '/tenant/complaints', icon: MessageSquare },
  { label: 'Maintenance', to: '/tenant/maintenance', icon: Wrench },
  { label: 'Move-in', to: '/tenant/move-in', icon: ClipboardList },
  { label: 'Documents', to: '/tenant/documents', icon: FileText },
  { label: 'Notifications', to: '/tenant/notifications', icon: Bell },
] as const

export function TenantShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { signOut, user } = useStorefrontAuth()
  const { lease } = useTenantAuth()

  return (
    <PortalShell
      portalTitle="Tenant Portal"
      userLabel={lease?.products?.name ?? user?.email ?? null}
      roleBadge="Tenant"
      navItems={[...NAV]}
      pathname={pathname}
      onSignOut={() => void signOut()}
      headerExtra={<PortalNotificationBell role="tenant" notificationsPath="/tenant/notifications" />}
    >
      {children}
    </PortalShell>
  )
}
