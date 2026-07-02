import { Link, useRouterState } from '@tanstack/react-router'
import {
  Building2,
  FileText,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { adminNavLink, adminNavLinkActive, adminSidebarSignOut } from '@/admin/adminClassNames'
import { AdminReadOnlyBanner } from '@/admin/components/AdminReadOnlyBanner'
import {
  adminRoleLabel,
  canAccessAdminNav,
  type AdminNavKey,
} from '@/lib/admin/permissions'

const NAV_ITEMS: { key: AdminNavKey; label: string; to: string; icon: LucideIcon; exact?: boolean }[] = [
  { key: 'dashboard', label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { key: 'catalog', label: 'Listings', to: '/admin/catalog', icon: Package },
  { key: 'realEstate', label: 'Real Estate', to: '/admin/real-estate', icon: Building2 },
  { key: 'tenancy', label: 'Tenant Management', to: '/admin/tenancy', icon: KeyRound },
  { key: 'homepage', label: 'Homepage', to: '/admin/homepage', icon: LayoutTemplate },
  { key: 'content', label: 'Site Content', to: '/admin/content', icon: FileText },
  { key: 'commerce', label: 'Clients & Billing', to: '/admin/commerce', icon: ShoppingBag },
  { key: 'communications', label: 'Communications', to: '/admin/communications', icon: MessageSquare },
  { key: 'settings', label: 'Settings', to: '/admin/settings', icon: Settings },
]

function isPathActive(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

function SidebarNav({ items, onNavigate }: { items: typeof NAV_ITEMS; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="admin-sidebar-nav flex flex-1 flex-col gap-0.5 p-3">
      {items.map((item) => {
        const Icon = item.icon
        const active = isPathActive(pathname, item.to, item.exact)
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={active ? adminNavLinkActive : adminNavLink}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarFooter({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="shrink-0 border-t border-white/10 p-3">
      <button type="button" className={adminSidebarSignOut} onClick={onSignOut}>
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  )
}

const ADMIN_LOGO_SRC = '/images/greenwood-logo.png'

function AdminBrandLogo({ className }: { className?: string }) {
  return (
    <img
      src={ADMIN_LOGO_SRC}
      alt="Greenwood Vacation Homes"
      className={className}
    />
  )
}

function SidebarBrand({ roleLabel }: { roleLabel: string | null }) {
  return (
    <div className="shrink-0 border-b border-white/10 px-4 py-5">
      <Link to="/admin" className="inline-flex flex-col gap-1">
        <AdminBrandLogo className="h-10 w-auto max-w-[200px] object-contain object-left" />
        {roleLabel ? (
          <span className="mt-1 inline-flex w-fit rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/80">
            {roleLabel}
          </span>
        ) : null}
      </Link>
    </div>
  )
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { signOut, role } = useAdminAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleNav = useMemo(
    () => NAV_ITEMS.filter((item) => canAccessAdminNav(role, item.key)),
    [role],
  )

  function handleSignOut() {
    void signOut()
  }

  return (
    <div className="admin-root flex h-screen overflow-hidden">
      <aside className="admin-sidebar hidden w-64 shrink-0 flex-col bg-[var(--admin-sidebar)] text-[var(--admin-sidebar-text)] lg:flex">
        <SidebarBrand roleLabel={adminRoleLabel(role)} />
        <SidebarNav items={visibleNav} />
        <SidebarFooter onSignOut={handleSignOut} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[var(--admin-sidebar)] text-[var(--admin-sidebar-text)]">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4">
              <Link to="/admin" onClick={() => setMobileOpen(false)}>
                <AdminBrandLogo className="h-9 w-auto max-w-[180px] object-contain object-left" />
              </Link>
              <button type="button" className="rounded p-2 hover:bg-white/10" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav items={visibleNav} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter onSignOut={handleSignOut} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-64">
        <header className="flex shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-[var(--admin-radius)] p-2 hover:bg-[var(--admin-primary-muted)]"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/admin">
            <AdminBrandLogo className="h-8 w-auto max-w-[160px] object-contain object-left" />
          </Link>
          <div className="w-9" />
        </header>
        <main className="admin-main flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AdminReadOnlyBanner />
          {children}
        </main>
      </div>
    </div>
  )
}
