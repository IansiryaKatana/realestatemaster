import type { Product } from '@/data/static-cms'
import { propertyListingLabel, propertyPriceLabel } from '@/lib/property/formatProperty'
import { ProductPrice } from '@/components/product/ProductPrice'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PropertyPriceDisplayProps = {
  product: Product
  size?: 'sm' | 'lg'
  className?: string
  showBadges?: boolean
  listingBadgeClassName?: string
}

export function PropertyPriceDisplay({
  product,
  size = 'sm',
  className,
  showBadges = true,
  listingBadgeClassName,
}: PropertyPriceDisplayProps) {
  const suffix = propertyPriceLabel(product)
  const listingLabel = propertyListingLabel(product.listingType)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-baseline gap-1">
        <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} size={size} />
        {suffix ? <span className="text-xs font-medium text-muted">{suffix}</span> : null}
      </div>
      {showBadges && listingLabel ? (
        <Badge className={listingBadgeClassName}>{listingLabel}</Badge>
      ) : null}
      {showBadges && product.badge ? <Badge>{product.badge}</Badge> : null}
    </div>
  )
}
