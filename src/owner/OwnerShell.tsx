import { useRouterState } from '@tanstack/react-router'
import { Building2, FileText, LayoutDashboard, Wrench } from 'lucide-react'
import type { ReactNode } from 'react'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { PortalShell } from '@/portals/PortalShell'

const NAV = [
  { label: 'Portfolio', to: '/owner', icon: LayoutDashboard, exact: true },
  { label: 'Financials', to: '/owner/statements', icon: FileText },
  { label: 'Maintenance', to: '/owner/maintenance', icon: Wrench },
  { label: 'Properties', to: '/owner/portfolio', icon: Building2 },
] as const

export function OwnerShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { signOut } = useStorefrontAuth()
  const { owner } = useLandlordAuth()

  return (
    <PortalShell
      portalTitle="Owner Portal"
      userLabel={owner?.full_name ?? null}
      roleBadge="Property Owner"
      navItems={[...NAV]}
      pathname={pathname}
      onSignOut={() => void signOut()}
    >
      {children}
    </PortalShell>
  )
}
