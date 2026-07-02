import { notFound } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useCms } from '@/contexts/CmsContext'
import { buildProductMeta, usePageMeta } from '@/lib/seo'
import { useStorefrontProduct } from '@/lib/storefront/storefrontQueries'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { JsonLd } from '@/components/seo/JsonLd'
import { getCurrencyFromSettings } from '@/lib/currency'
import { buildBreadcrumbJsonLd, buildProductJsonLd } from '@/lib/seo/jsonLd'
import { ProductDetailSections } from '@/components/product/ProductDetailSections'
import { ProductDetailHero } from '@/components/product/ProductDetailHero'
import { MobileStickyBuyBar } from '@/components/product/MobileStickyBuyBar'
import { StockAlertForm } from '@/components/product/StockAlertForm'
import {
  effectiveCompareAtPrice,
  effectiveProductInventory,
  effectiveProductPrice,
} from '@/lib/cms/mapProduct'
import type { ProductVariant } from '@/data/static-cms'
import { isPropertyListing } from '@/lib/property/formatProperty'
import { usePropertyLookups } from '@/lib/property/propertyLookups'
import { fetchPropertyAmenities } from '@/lib/property/propertyStorefront'
import { MobileStickyPropertyBar } from '@/components/property/MobileStickyPropertyBar'
import { PropertyPaymentBreakdownCard } from '@/components/property/PropertyPaymentBreakdownCard'
import { PropertyContactSection } from '@/components/property/PropertyContactSection'
import { SimilarPropertiesSection } from '@/components/property/SimilarPropertiesSection'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { RelatedProductsSection } from '@/components/product/RelatedProductsSection'

export function PropertyDetailPageView({ slug }: { slug: string }) {
  const { snapshot } = useCms()
  const { data: product, isLoading } = useStorefrontProduct(slug)
  const { data: lookups } = usePropertyLookups()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const isProperty = product ? isPropertyListing(product) : false

  const { data: amenities = [] } = useQuery({
    queryKey: ['property-amenities', product?.id],
    queryFn: () => fetchPropertyAmenities(product!.id),
    enabled: Boolean(product?.id && isProperty),
  })

  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    if (selectedVariant) return selectedVariant
    const inStock = product.variants.find((v) => v.inventoryCount > 0)
    return inStock ?? product.variants[0] ?? null
  }, [product, selectedVariant])

  const displayPrice = product ? effectiveProductPrice(product, activeVariant) : 0
  const displayCompareAt = product ? effectiveCompareAtPrice(product, activeVariant) : null
  const displaySku = activeVariant?.sku ?? product?.sku
  const displayInventory = product ? effectiveProductInventory(product, activeVariant) : 0
  const galleryImage = activeVariant?.imageUrl || product?.imageUrl || ''

  const category = product?.categoryId
    ? snapshot.categories.find((c) => c.id === product.categoryId)
    : null
  const parentCategory = category?.parentId
    ? snapshot.categories.find((c) => c.id === category.parentId)
    : null

  const marqueeText =
    snapshot.siteSettings.footer_tagline?.trim() ||
    `${snapshot.siteName} — Premium vacation homes and properties for rent and sale across Dubai.`

  usePageMeta(
    product ? buildProductMeta(product, snapshot.siteName) : { title: isProperty ? 'Property | GW Vacation Homes' : 'Product | GW Vacation Homes' },
  )

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      </StorefrontLayout>
    )
  }

  if (!product) throw notFound()

  const storeUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const currency = getCurrencyFromSettings(snapshot.siteSettings)
  const detailPath = isProperty ? `/property/${product.slug}` : `/product/${product.slug}`

  return (
    <StorefrontLayout>
      <JsonLd
        data={[
          buildProductJsonLd(product, snapshot.siteName, storeUrl, currency),
          buildBreadcrumbJsonLd([
            { name: 'Home', url: storeUrl || '/' },
            { name: product.name, url: `${storeUrl}${detailPath}` },
          ]),
        ]}
      />

      <ProductDetailHero
        product={product}
        heroImage={galleryImage}
        galleryUrls={product.galleryUrls}
        activeVariant={activeVariant}
        displayPrice={displayPrice}
        displayCompareAt={displayCompareAt}
        displaySku={displaySku}
        displayInventory={displayInventory}
        categoryName={category?.name}
        categorySlug={category?.slug}
        parentCategoryName={parentCategory?.name}
        parentCategorySlug={parentCategory?.slug}
        marqueeText={marqueeText.toUpperCase()}
        onVariantSelect={setSelectedVariant}
        lookups={lookups ?? undefined}
      />

      {isProperty ? (
        <SectionContainer className="py-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="min-w-0">
              <ProductDetailSections
                product={product}
                imageUrl={galleryImage}
                galleryUrls={product.galleryUrls}
                embedded
                lookups={lookups ?? undefined}
                amenities={amenities}
              />
            </div>
            <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
              <PropertyPaymentBreakdownCard product={product} />
              <PropertyContactSection product={product} />
            </aside>
          </div>
        </SectionContainer>
      ) : (
        <ProductDetailSections product={product} imageUrl={galleryImage} galleryUrls={product.galleryUrls} />
      )}

      {isProperty ? <SimilarPropertiesSection product={product} /> : <RelatedProductsSection product={product} />}

      {!isProperty ? (
        <>
          <StockAlertForm productId={product.id} variantId={activeVariant?.id} disabled={displayInventory <= 0} />
          <MobileStickyBuyBar product={product} variant={activeVariant} price={displayPrice} inventory={displayInventory} />
        </>
      ) : (
        <MobileStickyPropertyBar product={product} />
      )}
    </StorefrontLayout>
  )
}
