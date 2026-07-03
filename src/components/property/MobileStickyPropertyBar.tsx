import { useState } from 'react'
import type { Product } from '@/data/static-cms'
import { propertyPrimaryActionLabel } from '@/lib/property/formatProperty'
import { useFormatPrice } from '@/lib/currency'
import { BookViewingDialog } from '@/components/property/BookViewingDialog'
import { PropertyQuickInquiryDialog } from '@/components/property/PropertyQuickInquiryDialog'
import { Button } from '@/components/ui/button'

type MobileStickyPropertyBarProps = {
  product: Product
}

export function MobileStickyPropertyBar({ product }: MobileStickyPropertyBarProps) {
  const formatPrice = useFormatPrice()
  const [viewingOpen, setViewingOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const primaryLabel = propertyPrimaryActionLabel(product.listingType)

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8e0d4] bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-muted">{product.name}</p>
            <p className="font-display text-lg font-extrabold">{formatPrice(product.price)}</p>
          </div>
          <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={() => setViewingOpen(true)}>
            Viewing
          </Button>
          <Button type="button" size="sm" className="shrink-0" onClick={() => setApplyOpen(true)}>
            {primaryLabel.replace(' Now', '')}
          </Button>
        </div>
      </div>

      <BookViewingDialog product={product} open={viewingOpen} onOpenChange={setViewingOpen} />
      <PropertyQuickInquiryDialog
        product={product}
        open={applyOpen}
        onOpenChange={setApplyOpen}
        title={primaryLabel}
      />
    </>
  )
}
