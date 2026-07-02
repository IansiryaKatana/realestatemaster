import { useRouterState } from '@tanstack/react-router'
import {
  Building2,
  Calendar,
  FileText,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Users,
  Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { PortalShell } from '@/portals/PortalShell'

const NAV = [
  { label: 'Dashboard', to: '/agent', icon: LayoutDashboard, exact: true },
  { label: 'Inquiries', to: '/agent/inquiries', icon: FileText },
  { label: 'Viewings', to: '/agent/viewings', icon: Calendar },
  { label: 'Transactions', to: '/agent/transactions', icon: Building2 },
  { label: 'Tenants', to: '/agent/tenants', icon: Users },
  { label: 'Maintenance', to: '/agent/maintenance', icon: Wrench },
] as const

export function AgentShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { signOut } = useStorefrontAuth()
  const { agent } = useAgentAuth()

  return (
    <PortalShell
      portalTitle="Agent Portal"
      userLabel={agent?.name ?? null}
      roleBadge="Agent"
      navItems={[...NAV]}
      pathname={pathname}
      onSignOut={() => void signOut()}
    >
      {children}
    </PortalShell>
  )
}
