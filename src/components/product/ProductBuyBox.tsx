import { Star } from 'lucide-react'
import type { Product, ProductVariant } from '@/data/static-cms'
import { Badge } from '@/components/ui/badge'
import { CmsLink } from '@/components/layout/CmsLink'
import { RichTextContent } from '@/components/content/RichTextContent'
import { ProductPrice } from '@/components/product/ProductPrice'
import { ProductVariantSelector } from '@/components/product/ProductVariantSelector'
import { ProductPurchaseActions } from '@/components/product/ProductPurchaseActions'
import { PropertyActionButtons } from '@/components/property/PropertyActionButtons'
import { PropertyPriceDisplay } from '@/components/property/PropertyPriceDisplay'
import { PropertyStats } from '@/components/property/PropertyStats'
import { isPropertyListing, propertyListingLabel, resolvePropertyMeta } from '@/lib/property/formatProperty'
import { usePropertyLookups } from '@/lib/property/propertyLookups'
import { WishlistButton } from '@/components/ecommerce/WishlistButton'
import { cn } from '@/lib/utils'

type ProductBuyBoxProps = {
  product: Product
  activeVariant: ProductVariant | null
  displayPrice: number
  displayCompareAt: number | null
  displaySku: string | null | undefined
  displayInventory: number
  categoryName?: string | null
  categorySlug?: string | null
  parentCategoryName?: string | null
  parentCategorySlug?: string | null
  onVariantSelect: (variant: ProductVariant) => void
  className?: string
}

export function ProductBuyBox({
  product,
  activeVariant,
  displayPrice,
  displayCompareAt,
  displaySku,
  displayInventory,
  categoryName,
  categorySlug,
  parentCategoryName,
  parentCategorySlug,
  onVariantSelect,
  className,
}: ProductBuyBoxProps) {
  const isProperty = isPropertyListing(product)
  const { data: lookups } = usePropertyLookups()
  const meta = lookups ? resolvePropertyMeta(product, lookups) : null
  const listingLabel = propertyListingLabel(product.listingType)

  return (
    <div className={cn('rounded-2xl bg-white p-5 text-text-brown shadow-2xl md:p-7', className)}>
      {(parentCategoryName && parentCategorySlug) || (categoryName && categorySlug) ? (
        <nav className="mb-3 text-xs text-muted" aria-label="Breadcrumb">
          {parentCategoryName && parentCategorySlug ? (
            <>
              <CmsLink href={`/collection/${parentCategorySlug}`} className="transition hover:text-cta-brown">
                {parentCategoryName}
              </CmsLink>
              <span className="mx-1.5">/</span>
            </>
          ) : null}
          {categoryName && categorySlug ? (
            <CmsLink href={`/collection/${categorySlug}`} className="transition hover:text-cta-brown">
              {categoryName}
            </CmsLink>
          ) : null}
        </nav>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold leading-tight md:text-3xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {isProperty ? (
              <PropertyPriceDisplay
                product={{ ...product, price: displayPrice, compareAtPrice: displayCompareAt }}
                size="lg"
                listingBadgeClassName="md:hidden"
              />
            ) : (
              <>
                {product.badge ? <Badge>{product.badge}</Badge> : null}
                <ProductPrice price={displayPrice} compareAtPrice={displayCompareAt} size="lg" />
              </>
            )}
          </div>
          {product.reviews && product.reviews.count > 0 ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.round(product.reviews!.averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border',
                    )}
                  />
                ))}
              </div>
              <span>
                {product.reviews.averageRating.toFixed(1)} ({product.reviews.count})
              </span>
            </div>
          ) : null}
        </div>
        <WishlistButton productId={product.id} />
      </div>

      {meta?.propertyTypeName ? (
        <p className="mt-2 text-sm font-medium text-muted">{meta.propertyTypeName}</p>
      ) : null}

      {isProperty ? (
        <PropertyStats product={product} areaName={meta?.areaName} className="mt-4" />
      ) : null}

      {listingLabel || meta?.furnishingName || meta?.statusName ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {listingLabel ? <Badge className="hidden md:inline-flex">{listingLabel}</Badge> : null}
          {meta?.furnishingName ? <Badge>{meta.furnishingName}</Badge> : null}
          {meta?.statusName ? <Badge>{meta.statusName}</Badge> : null}
        </div>
      ) : null}

      {meta?.agentName ? (
        <p className="mt-3 text-sm text-muted">
          Assigned agent: <span className="font-semibold text-text-brown">{meta.agentName}</span>
        </p>
      ) : null}

      {product.propertyReference ? (
        <p className="mt-2 text-xs text-muted">Ref: {product.propertyReference}</p>
      ) : null}

      {!isProperty && displaySku ? <p className="mt-2 text-xs text-muted">SKU: {displaySku}</p> : null}

      {product.description?.trim() ? (
        <RichTextContent html={product.description} className="mt-4 line-clamp-4 text-sm text-muted" />
      ) : null}

      {product.variants && product.variants.length > 0 && !isProperty ? (
        <ProductVariantSelector
          variants={product.variants}
          selectedId={activeVariant?.id ?? null}
          onSelect={onVariantSelect}
        />
      ) : null}

      {isProperty ? (
        <PropertyActionButtons product={product} className="mt-6 flex flex-col gap-2 sm:flex-row" />
      ) : (
        <>
          <p className="mt-4 text-xs text-muted">{displayInventory} in stock</p>
          <ProductPurchaseActions
            product={product}
            variant={activeVariant}
            className="mt-6 [&>div]:max-w-none"
          />
        </>
      )}
    </div>
  )
}
