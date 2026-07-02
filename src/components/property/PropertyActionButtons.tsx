import { useState } from 'react'
import type { Product } from '@/data/static-cms'
import {
  isPropertyListing,
  propertyPrimaryActionLabel,
} from '@/lib/property/formatProperty'
import { BookViewingDialog } from '@/components/property/BookViewingDialog'
import { PropertyQuickInquiryDialog } from '@/components/property/PropertyQuickInquiryDialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PropertyActionButtonsProps = {
  product: Product
  className?: string
  compact?: boolean
}

export function PropertyActionButtons({ product, className, compact = false }: PropertyActionButtonsProps) {
  const [viewingOpen, setViewingOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)

  if (!isPropertyListing(product)) return null

  const primaryLabel = propertyPrimaryActionLabel(product.listingType)

  return (
    <>
      <div className={className ?? 'flex min-w-0 flex-wrap gap-2 pt-1'}>
        <Button
          type="button"
          variant="secondary"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'h-10 min-w-0 flex-1 rounded-md px-4 text-sm md:h-11 md:text-base',
            compact && 'md:h-10',
          )}
          onClick={() => setViewingOpen(true)}
        >
          Book a Viewing
        </Button>
        <Button
          type="button"
          variant="default"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'h-10 min-w-0 flex-1 rounded-md px-4 text-sm md:h-11 md:text-base',
            compact && 'md:h-10',
          )}
          onClick={() => setApplyOpen(true)}
        >
          {primaryLabel}
        </Button>
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
