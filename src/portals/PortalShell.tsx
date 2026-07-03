import { Link } from '@tanstack/react-router'
import { LogOut, Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { PORTAL_THEME } from '@/portals/portalTheme'

export type PortalNavItem = {
  label: string
  to: string
  icon: LucideIcon
  exact?: boolean
}

type PortalShellProps = {
  portalTitle: string
  userLabel?: string | null
  roleBadge?: string | null
  logoSrc?: string
  logoAlt?: string
  navItems: PortalNavItem[]
  pathname: string
  onSignOut: () => void
  children: ReactNode
  headerExtra?: ReactNode
}

function isPathActive(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function PortalShell({
  portalTitle,
  userLabel,
  roleBadge,
  logoSrc = '/images/greenwood-logo.png',
  logoAlt = 'Greenwood Vacation Homes',
  navItems,
  pathname,
  onSignOut,
  children,
  headerExtra,
}: PortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = (onNavigate?: () => void) => (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = isPathActive(pathname, item.to, item.exact)
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              active ? 'bg-white/15 font-medium' : 'hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  const brand = (onClick?: () => void) => (
    <div className="shrink-0 border-b border-white/10 px-4 py-5">
      <Link to={navItems[0]?.to ?? '/'} onClick={onClick} className="inline-flex flex-col gap-1">
        <img src={logoSrc} alt={logoAlt} className="h-9 w-auto max-w-[200px] object-contain object-left" />
      </Link>
    </div>
  )

  const footer = (
    <div className="shrink-0 border-t border-white/10 p-3">
      <div className="mb-3 flex flex-col gap-1 px-3">
        <p className="text-sm font-semibold">{portalTitle}</p>
        {userLabel ? <p className="text-xs text-white/75">{userLabel}</p> : null}
        {roleBadge ? (
          <span className="mt-1 inline-flex w-fit rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">
            {roleBadge}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-start gap-2 rounded-lg bg-[#b42318] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9a1f15]"
        onClick={onSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen" style={{ background: PORTAL_THEME.surface }}>
      <aside
        className="hidden w-64 shrink-0 flex-col lg:flex"
        style={{ background: PORTAL_THEME.sidebar, color: PORTAL_THEME.sidebarText }}
      >
        {brand()}
        {nav()}
        {footer}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative flex h-full w-72 max-w-[85vw] flex-col"
            style={{ background: PORTAL_THEME.sidebar, color: PORTAL_THEME.sidebarText }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <span className="text-sm font-semibold">{portalTitle}</span>
              <button type="button" className="rounded p-2 hover:bg-white/10" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav(() => setMobileOpen(false))}
            {footer}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between border-b px-4 py-3 lg:hidden"
          style={{ borderColor: PORTAL_THEME.border, background: PORTAL_THEME.surfaceElevated }}
        >
          <button type="button" className="rounded-lg p-2 hover:bg-[#efe8dd]" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold">{portalTitle}</p>
          <div className="w-9">{headerExtra}</div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
