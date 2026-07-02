import type { Product } from '@/data/static-cms'
import { stripHtml } from '@/lib/stripHtml'
import { isPropertyListing, resolvePropertyMeta } from '@/lib/property/formatProperty'
import { usePropertyLookups } from '@/lib/property/propertyLookups'
import { Badge } from '@/components/ui/badge'
import { ProductPrice } from '@/components/product/ProductPrice'
import { PropertyPriceDisplay } from '@/components/property/PropertyPriceDisplay'
import { PropertyStats } from '@/components/property/PropertyStats'
import { PropertyActionButtons } from '@/components/property/PropertyActionButtons'
import { AddToCartButton } from '@/components/ecommerce/AddToCartButton'
import { BuyNowButton } from '@/components/ecommerce/BuyNowButton'
import { WishlistButton } from '@/components/ecommerce/WishlistButton'
import { Link } from '@tanstack/react-router'

export function ProductCard({ product }: { product: Product }) {
  const overviewText = stripHtml(product.overview ?? '')
  const isProperty = isPropertyListing(product)
  const { data: lookups } = usePropertyLookups()
  const meta = lookups ? resolvePropertyMeta(product, lookups) : null

  return (
    <article className="product-card min-w-0 max-w-full">
      <div className="group relative aspect-[1/0.82] overflow-hidden rounded-[10px] bg-gradient-to-b from-[#f8f8f6] to-[#eeeeea]">
        <Link
          to={isProperty ? '/property/$slug' : '/product/$slug'}
          params={{ slug: product.slug }}
          className="block h-full w-full"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[250ms] ease-out group-hover:scale-[1.04]"
            />
          ) : null}
        </Link>
        {isProperty && (product.listingType || meta?.propertyTypeName) ? (
          <div className="absolute left-2.5 top-2.5 z-[1] flex flex-wrap gap-1">
            {product.listingType ? (
              <Badge className="bg-white/95 text-text-brown">
                {product.listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </Badge>
            ) : null}
            {meta?.propertyTypeName ? (
              <Badge className="bg-white/95 text-text-brown">
                {meta.propertyTypeName}
              </Badge>
            ) : null}
          </div>
        ) : null}
        {isProperty && meta ? (
          <div className="absolute bottom-2.5 left-2.5 z-[1] flex flex-wrap gap-1">
            {meta.furnishingName ? (
              <Badge variant="secondary" className="bg-black/60 text-[10px] uppercase text-white hover:bg-black/60">
                {meta.furnishingName}
              </Badge>
            ) : null}
            {meta.areaName ? (
              <Badge variant="secondary" className="bg-black/60 text-[10px] uppercase text-white hover:bg-black/60">
                {meta.areaName}
              </Badge>
            ) : null}
          </div>
        ) : null}
        <WishlistButton
          productId={product.id}
          variant="icon"
          className="absolute right-2.5 top-2.5 z-[1]"
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          {isProperty ? (
            <PropertyPriceDisplay product={product} size="sm" showBadges={false} />
          ) : (
            <>
              <ProductPrice price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
              {product.badge && <Badge>{product.badge}</Badge>}
            </>
          )}
        </div>
        <Link to={isProperty ? '/property/$slug' : '/product/$slug'} params={{ slug: product.slug }}>
          <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-text-brown md:text-2xl">{product.name}</h3>
        </Link>
        {isProperty ? (
          <PropertyStats product={product} compact />
        ) : overviewText ? (
          <p className="line-clamp-1 text-xs leading-5 text-muted">{overviewText}</p>
        ) : null}
        {isProperty ? (
          <PropertyActionButtons product={product} compact />
        ) : (
          <div className="flex min-w-0 flex-wrap gap-2 pt-1">
            <AddToCartButton product={product} className="min-w-0 flex-1" />
            <BuyNowButton product={product} />
          </div>
        )}
      </div>
    </article>
  )
}
