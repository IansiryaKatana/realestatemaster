import { Link } from '@tanstack/react-router'
import { ChevronDown, Menu, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCms } from '@/contexts/CmsContext'
import { CmsLink } from '@/components/layout/CmsLink'
import { MobileMenuDrawer } from '@/components/layout/MobileMenuDrawer'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { getVisibleHeaderNavLinks } from '@/lib/cms/loadCmsSnapshot'
import { usePropertyLookups } from '@/lib/property/propertyLookups'
import { useHasStorefrontBundles } from '@/lib/storefront/storefrontQueries'
import { useDesktopScrollHeader } from '@/hooks/useDesktopScrollHeader'
import { cn } from '@/lib/utils'

const navLinkClass =
  'inline-flex h-6 shrink-0 items-center gap-1 text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-white/90 transition hover:text-white'

const PROPERTY_NAV = [
  { label: 'Holiday Rentals', href: '/collection/rentals' },
  { label: 'For Sale', href: '/collection/sales' },
  { label: 'All Properties', href: '/collection/all' },
] as const

export function SiteHeader() {
  const { snapshot } = useCms()
  const { data: hasBundles = false } = useHasStorefrontBundles()
  const { data: lookups } = usePropertyLookups()
  const headerLinks = getVisibleHeaderNavLinks(snapshot, hasBundles).filter(
    (link) => !['/collection/all', '/bundles'].includes(link.href),
  )
  const areaEntries = lookups
    ? Object.entries(lookups.areas).sort((a, b) => a[1].name.localeCompare(b[1].name))
    : []
  const [mobileOpen, setMobileOpen] = useState(false)
  const [areasOpen, setAreasOpen] = useState(false)
  const { atTop, revealed } = useDesktopScrollHeader()
  const showSolidBar = !atTop && revealed

  useEffect(() => {
    if (!revealed) setAreasOpen(false)
  }, [revealed])

  const header = (
    <header
      className={cn(
        'site-header pointer-events-auto fixed inset-x-0 top-0 isolate z-50 bg-transparent px-6 text-cream-text shadow-none transition-[transform,background-color,box-shadow,padding] duration-300 ease-out motion-reduce:transition-none md:px-14',
        atTop ? 'py-4 md:py-5' : 'py-3',
        showSolidBar && 'bg-hero-brown shadow-md border-b border-white/10',
        !atTop && !revealed && '-translate-y-full pointer-events-none',
      )}
    >
        <div className="flex h-10 items-center justify-between gap-4 md:h-auto">
          <SiteLogo variant="dark" className="text-white" imageClassName="h-9 max-w-[200px] md:h-10 md:max-w-[240px]" />

          <nav className="hidden items-center gap-6 lg:flex">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            {PROPERTY_NAV.map((item) => (
              <CmsLink key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </CmsLink>
            ))}
            {areaEntries.length > 0 ? (
              <div
                className="relative flex items-center"
                onMouseEnter={() => setAreasOpen(true)}
                onMouseLeave={() => setAreasOpen(false)}
              >
                <span className={cn(navLinkClass, 'cursor-default')}>
                  Areas
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                </span>
                {areasOpen ? (
                  <div className="absolute left-0 top-full z-50 min-w-[220px] pt-2">
                    <div className="overflow-hidden rounded-lg border border-white/10 bg-white shadow-lg">
                      <p className="border-b border-[#e8e0d4] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-text-brown">
                        Browse by area
                      </p>
                      {areaEntries.map(([, area], i) => (
                        <CmsLink
                          key={area.name}
                          href={`/search?q=${encodeURIComponent(area.name)}`}
                          className={cn(
                            'block px-4 py-2.5 text-sm text-text-brown transition hover:bg-[#f8f7f3]',
                            i < areaEntries.length - 1 && 'border-b border-[#f0ebe3]',
                          )}
                        >
                          {area.name}
                        </CmsLink>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {headerLinks.map((link) => (
              <CmsLink key={link.id} href={link.href} className={navLinkClass}>
                {link.label}
              </CmsLink>
            ))}
          </nav>

          <div className="flex h-10 items-center gap-2 text-white md:gap-3">
            <Link to="/search" aria-label="Search" className="rounded-full p-2 transition hover:bg-white/10">
              <Search className="h-4 w-4" />
            </Link>
            <Link to="/account" aria-label="Account" className="rounded-full p-2 transition hover:bg-white/10">
              <User className="h-4 w-4" />
            </Link>
            <NotificationBell />
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="rounded-full p-2 transition hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
  )

  return (
    <>
      {typeof document !== 'undefined' ? createPortal(header, document.body) : header}

      <MobileMenuDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
