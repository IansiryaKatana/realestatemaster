import type { Product } from '@/data/static-cms'
import { RichTextContent } from '@/components/content/RichTextContent'
import { SectionContainer } from '@/components/layout/SectionContainer'
import {
  ProductFeatureBlocks,
  ProductSpecsList,
  productSectionProseClass,
  type ProductSectionBlock,
} from '@/components/product/ProductFeatureBlocks'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductReviewSection, ProductRatingStars } from '@/components/product/ProductReviewSection'
import { isPropertyListing } from '@/lib/property/formatProperty'
import type { PropertyLookups } from '@/lib/property/propertyLookups'
import { buildPropertyAgentSection } from '@/components/property/PropertyAgentCard'
import { PropertyAmenitiesList } from '@/components/property/PropertyAmenitiesSection'
import { PropertyLocationActions } from '@/components/property/PropertyLocationActions'
import type { PropertyAmenity } from '@/lib/property/propertyStorefront'
import { hasPropertyDirections, resolvePropertyLocation } from '@/lib/property/mapLinks'

function hasOverview(product: Product) {
  return Boolean(product.overview?.trim())
}

function hasFeatures(product: Product) {
  return Boolean(product.specs && product.specs.length > 0)
}

function hasHandover(product: Product) {
  return Boolean(product.contractTerms?.trim() || product.deliveryText?.trim())
}

function hasDelivery(product: Product) {
  return Boolean(product.deliveryText?.trim())
}

function hasReviews(product: Product) {
  return Boolean(product.reviews && product.reviews.count > 0)
}

function buildDetailSections(
  product: Product,
  isProperty: boolean,
  lookups?: PropertyLookups,
  amenities: PropertyAmenity[] = [],
): ProductSectionBlock[] {
  const sections: ProductSectionBlock[] = []

  if (hasOverview(product)) {
    sections.push({
      label: 'Overview',
      content: (
        <RichTextContent html={product.overview ?? ''} className={productSectionProseClass} />
      ),
    })
  }

  if (isProperty && amenities.length > 0) {
    sections.push({
      label: 'Amenities & features',
      content: <PropertyAmenitiesList amenities={amenities} />,
    })
  }

  if (isProperty && lookups && hasPropertyDirections(resolvePropertyLocation(product, lookups))) {
    sections.push({
      label: 'Location',
      content: (
        <div className={productSectionProseClass}>
          {product.exactAddress?.trim() ? <p>{product.exactAddress}</p> : null}
          <PropertyLocationActions product={product} lookups={lookups} className="mt-4" />
        </div>
      ),
    })
  } else if (isProperty && product.exactAddress?.trim()) {
    sections.push({
      label: 'Location',
      content: (
        <div className={productSectionProseClass}>
          <p>{product.exactAddress}</p>
        </div>
      ),
    })
  }

  if (hasFeatures(product)) {
    sections.push({
      label: isProperty ? 'Property details' : 'Features',
      content: <ProductSpecsList specs={product.specs ?? []} />,
    })
  }

  if (isProperty && lookups) {
    const agentSection = buildPropertyAgentSection(product, lookups)
    if (agentSection) sections.push(agentSection)
  }

  if (isProperty && hasHandover(product)) {
    sections.push({
      label: 'Handover & move-in',
      content: (
        <RichTextContent
          html={product.contractTerms?.trim() || product.deliveryText || ''}
          className={productSectionProseClass}
        />
      ),
    })
  } else if (!isProperty && hasDelivery(product)) {
    sections.push({
      label: 'Delivery',
      content: (
        <RichTextContent html={product.deliveryText ?? ''} className={productSectionProseClass} />
      ),
    })
  }

  if (hasReviews(product)) {
    const count = product.reviews!.count
    sections.push({
      label: count > 0 ? `Reviews (${count})` : 'Reviews',
      headerAddon: <ProductRatingStars rating={product.reviews!.averageRating} />,
      content: <ProductReviewSection product={product} showApprovedOnly />,
    })
  }

  return sections
}

type ProductDetailSectionsProps = {
  product: Product
  imageUrl: string
  galleryUrls?: string[]
  /** Property pages: no nested container, no sticky gallery column */
  embedded?: boolean
  lookups?: PropertyLookups
  amenities?: PropertyAmenity[]
}

export function ProductDetailSections({
  product,
  imageUrl,
  galleryUrls,
  embedded = false,
  lookups,
  amenities = [],
}: ProductDetailSectionsProps) {
  const isProperty = isPropertyListing(product)
  const sections = buildDetailSections(product, isProperty, lookups, amenities)

  const content = (
    <>
      {sections.length > 0 ? (
        <ProductFeatureBlocks sections={sections} />
      ) : null}

      {!isProperty ? (
        <div className={sections.length > 0 ? 'border-t border-dotted border-border/35 pt-8' : undefined}>
          <ProductReviewSection product={product} showApprovedOnly={false} />
        </div>
      ) : null}
    </>
  )

  if (embedded && isProperty) {
    return <div className="min-w-0">{content}</div>
  }

  if (sections.length === 0 && !isProperty) {
    return (
      <SectionContainer className="pb-16 pt-12 md:pt-16">
        <ProductReviewSection product={product} showApprovedOnly={false} />
      </SectionContainer>
    )
  }

  return (
    <SectionContainer className="pb-16 pt-12 md:pt-16">
      <div className="grid items-start gap-10 md:grid-cols-2 md:gap-14">
        <div className="min-w-0">{content}</div>

        <div className="hidden md:block">
          <div className="sticky top-6 ml-auto w-fit self-start">
            <ProductGallery
              name={product.name}
              imageUrl={imageUrl}
              galleryUrls={galleryUrls}
              variant="detail"
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
