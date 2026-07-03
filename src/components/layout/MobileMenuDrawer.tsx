import { Link } from '@tanstack/react-router'
import { ChevronDown, Search, ShoppingBag, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCms } from '@/contexts/CmsContext'
import { CmsLink } from '@/components/layout/CmsLink'
import { SiteLogo } from '@/components/layout/SiteLogo'
import { getVisibleHeaderNavLinks } from '@/lib/cms/loadCmsSnapshot'
import { usePropertyLookups } from '@/lib/property/propertyLookups'
import { useHasStorefrontBundles } from '@/lib/storefront/storefrontQueries'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MobileMenuDrawerProps = {
  open: boolean
  onClose: () => void
}

const PROPERTY_NAV = [
  { label: 'Holiday Rentals', href: '/collection/rentals' },
  { label: 'For Sale', href: '/collection/sales' },
  { label: 'All Properties', href: '/collection/all' },
] as const

export function MobileMenuDrawer({ open, onClose }: MobileMenuDrawerProps) {
  const { snapshot } = useCms()
  const { data: hasBundles = false } = useHasStorefrontBundles()
  const { data: lookups } = usePropertyLookups()
  const headerLinks = getVisibleHeaderNavLinks(snapshot, hasBundles).filter(
    (link) => !['/collection/all', '/bundles'].includes(link.href),
  )
  const areaEntries = lookups
    ? Object.entries(lookups.areas).sort((a, b) => a[1].name.localeCompare(b[1].name))
    : []
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) setExpandedId(null)
  }, [open])

  if (!open) return null

  function handleOpenCart() {
    onClose()
    openCart()
  }

  return (
    <div
      className="mobile-menu-drawer fixed inset-0 z-[70] flex flex-col bg-content-bg lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div className="flex shrink-0 items-center justify-between bg-hero-brown px-6 py-5 text-cream-text md:px-8">
        <SiteLogo variant="dark" className="text-white" imageClassName="h-10 max-w-[240px]" onNavigate={onClose} />
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="rounded-full p-2.5 text-cream-text transition hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-6 py-6 md:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Link
          to="/"
          onClick={onClose}
          className="border-b border-[#e8e0d4] py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-brown transition hover:text-cta-brown"
        >
          Home
        </Link>

        {PROPERTY_NAV.map((item) => (
          <CmsLink
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="border-b border-[#e8e0d4] py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-brown transition hover:text-cta-brown"
          >
            {item.label}
          </CmsLink>
        ))}

        {areaEntries.length > 0 ? (
          <div className="border-b border-[#e8e0d4]">
            <button
              type="button"
              aria-expanded={expandedId === 'areas'}
              onClick={() => setExpandedId(expandedId === 'areas' ? null : 'areas')}
              className="flex w-full items-center justify-between gap-3 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-text-brown transition hover:text-cta-brown"
            >
              <span>Areas</span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted transition-transform duration-200', expandedId === 'areas' && 'rotate-180')} />
            </button>
            {expandedId === 'areas' ? (
              <div className="flex flex-col gap-1 pb-4 pl-1">
                {areaEntries.map(([, area]) => (
                  <CmsLink
                    key={area.name}
                    href={`/search?q=${encodeURIComponent(area.name)}`}
                    onClick={onClose}
                    className="rounded-lg px-3 py-2.5 text-sm text-text-brown transition hover:bg-soft-beige"
                  >
                    {area.name}
                  </CmsLink>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {headerLinks.map((link) => (
            <CmsLink
              key={link.id}
              href={link.href}
              onClick={onClose}
              className="border-b border-[#e8e0d4] py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-brown transition hover:text-cta-brown"
            >
              {link.label}
            </CmsLink>
          ))}
      </nav>

      <div className="shrink-0 border-t border-[#e8e0d4] bg-soft-beige px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8">
        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/search"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-content-bg px-2 py-3 text-center text-xs font-semibold text-text-brown transition hover:bg-white"
          >
            <Search className="h-5 w-5 text-cta-brown" />
            Search
          </Link>
          <Link
            to="/account"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-content-bg px-2 py-3 text-center text-xs font-semibold text-text-brown transition hover:bg-white"
          >
            <User className="h-5 w-5 text-cta-brown" />
            Account
          </Link>
          <button
            type="button"
            onClick={handleOpenCart}
            className="relative flex flex-col items-center gap-1.5 rounded-xl bg-content-bg px-2 py-3 text-center text-xs font-semibold text-text-brown transition hover:bg-white"
          >
            <ShoppingBag className="h-5 w-5 text-cta-brown" />
            Cart
            {cartCount > 0 ? (
              <span className="absolute right-3 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-hero-brown px-1 text-[9px] font-bold text-cream-text">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>

        <Button type="button" variant="cream" className="mt-3 h-11 w-full rounded-full text-sm font-bold" onClick={onClose}>
          Close menu
        </Button>
      </div>
    </div>
  )
}
