import { SiteHeader } from '@/components/layout/SiteHeader'
import { TextMarquee } from '@/components/layout/TextMarquee'
import { ProductBuyBox } from '@/components/product/ProductBuyBox'
import { PropertyHeroMedia } from '@/components/property/PropertyHeroMedia'
import type { Product, ProductVariant } from '@/data/static-cms'
import { isPropertyListing } from '@/lib/property/formatProperty'
import type { PropertyLookups } from '@/lib/property/propertyLookups'

type ProductDetailHeroProps = {
  product: Product
  heroImage: string
  galleryUrls?: string[]
  activeVariant: ProductVariant | null
  displayPrice: number
  displayCompareAt: number | null
  displaySku: string | null | undefined
  displayInventory: number
  categoryName?: string | null
  categorySlug?: string | null
  parentCategoryName?: string | null
  parentCategorySlug?: string | null
  marqueeText: string
  onVariantSelect: (variant: ProductVariant) => void
  lookups?: PropertyLookups
}

export function ProductDetailHero({
  product,
  heroImage,
  galleryUrls,
  activeVariant,
  displayPrice,
  displayCompareAt,
  displaySku,
  displayInventory,
  categoryName,
  categorySlug,
  parentCategoryName,
  parentCategorySlug,
  marqueeText,
  onVariantSelect,
  lookups,
}: ProductDetailHeroProps) {
  const isProperty = isPropertyListing(product)

  const buyBox = (
    <ProductBuyBox
      product={product}
      activeVariant={activeVariant}
      displayPrice={displayPrice}
      displayCompareAt={displayCompareAt}
      displaySku={displaySku}
      displayInventory={displayInventory}
      categoryName={categoryName}
      categorySlug={categorySlug}
      parentCategoryName={parentCategoryName}
      parentCategorySlug={parentCategorySlug}
      onVariantSelect={onVariantSelect}
    />
  )

  const mobileBuyBox = isProperty ? (
    <ProductBuyBox
      product={product}
      activeVariant={activeVariant}
      displayPrice={displayPrice}
      displayCompareAt={displayCompareAt}
      displaySku={displaySku}
      displayInventory={displayInventory}
      categoryName={categoryName}
      categorySlug={categorySlug}
      parentCategoryName={parentCategoryName}
      parentCategorySlug={parentCategorySlug}
      onVariantSelect={onVariantSelect}
      className="rounded-none p-0 shadow-none"
    />
  ) : undefined

  return (
    <section className="relative bg-hero-brown text-white">
      <SiteHeader />

      <div className="relative flex min-h-[55vh] flex-col md:min-h-[75vh]">
        <div className="absolute inset-x-0 top-16 bottom-14 md:top-20 md:bottom-16">
          <PropertyHeroMedia
            product={product}
            heroImage={heroImage}
            galleryUrls={galleryUrls}
            lookups={lookups}
            mobileDetails={mobileBuyBox}
          />
        </div>

        <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="hidden flex-1 flex-col justify-center px-14 py-14 md:flex">
            <div className="pointer-events-auto ml-auto w-full max-w-[420px]">{buyBox}</div>
          </div>

          <div className="pointer-events-auto mt-auto w-full">
            <TextMarquee text={marqueeText} />
          </div>
        </div>
      </div>
    </section>
  )
}
