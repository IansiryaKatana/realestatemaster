import { Link } from '@tanstack/react-router'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { useTenantAuth } from '@/contexts/TenantAuthContext'

export function PortalRoleSwitcher() {
  const { isAgent } = useAgentAuth()
  const { isTenant } = useTenantAuth()
  const { isLandlord } = useLandlordAuth()

  const links = [
    isTenant ? { label: 'Tenant portal', to: '/tenant' } : null,
    isAgent ? { label: 'Agent portal', to: '/agent' } : null,
    isLandlord ? { label: 'Owner portal', to: '/owner' } : null,
  ].filter(Boolean) as { label: string; to: string }[]

  if (links.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="rounded-full border border-[#e8e0d4] bg-white px-3 py-1 text-xs font-medium text-text-brown hover:border-cta-brown/40"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
