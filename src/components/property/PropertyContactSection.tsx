import { useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import type { Product } from '@/data/static-cms'
import { BookViewingDialog } from '@/components/property/BookViewingDialog'
import { BookViewingForm } from '@/components/property/BookViewingForm'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PropertyContactSection({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleBookClick() {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setExpanded((current) => !current)
      return
    }
    setMobileOpen(true)
  }

  return (
    <>
      <section id="property-contact" className="rounded-xl border border-[#e8e0d4] bg-white p-5">
        <h3 className="font-display text-xl font-extrabold text-text-brown">Book a viewing</h3>
        {product.propertyReference ? (
          <p className="mt-1 text-sm text-muted">Reference: {product.propertyReference}</p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-muted">
          Choose your preferred date and time. Our team will confirm your appointment by email and WhatsApp.
        </p>
        <Button
          type="button"
          className="mt-4 w-full gap-2 sm:w-auto"
          aria-expanded={expanded}
          onClick={handleBookClick}
        >
          <CalendarDays className="h-4 w-4" />
          Book a viewing
          <ChevronDown
            className={cn(
              'hidden h-4 w-4 transition-transform duration-300 md:inline',
              expanded && 'rotate-180',
            )}
          />
        </Button>

        <div
          className={cn(
            'hidden md:grid transition-[grid-template-rows] duration-300 ease-out',
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-5 border-t border-[#e8e0d4] pt-5">
              {expanded ? (
                <BookViewingForm
                  product={product}
                  onSuccess={() => setExpanded(false)}
                  onCancel={() => setExpanded(false)}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <BookViewingDialog product={product} open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  )
}
