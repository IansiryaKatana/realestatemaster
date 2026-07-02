import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { Product } from '@/data/static-cms'
import { isPropertyListing } from '@/lib/property/formatProperty'
import { fetchSimilarProperties } from '@/lib/property/propertyStorefront'
import { ProductCard } from '@/components/home/ProductCard'
import { WideSectionContainer } from '@/components/layout/WideSectionContainer'
import { homepageProductGridClasses } from '@/components/storefront/productGridClasses'
import { RelatedProductsSection } from '@/components/product/RelatedProductsSection'

export function SimilarPropertiesSection({ product }: { product: Product }) {
  if (!isPropertyListing(product)) {
    return <RelatedProductsSection product={product} />
  }

  const { data: similar = [], isLoading, isError } = useQuery({
    queryKey: ['similar-properties', product.id, product.listingType, product.areaId],
    queryFn: () => fetchSimilarProperties(product, 4),
    staleTime: 60_000,
  })

  if (!isLoading && !isError && similar.length === 0) return null

  return (
    <section className="bg-white pb-16 pt-12 md:pt-16">
      <WideSectionContainer>
        <div className="mx-auto max-w-[420px] text-center">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-text-brown md:text-4xl">
            Similar properties
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            More {product.listingType === 'rent' ? 'rental' : 'sale'} listings in the same area
          </p>
        </div>

        {isLoading ? (
          <div className="mt-10 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        ) : isError ? (
          <p className="mt-10 text-center text-sm text-muted">Could not load similar properties.</p>
        ) : (
          <div className={`product-grid mt-10 ${homepageProductGridClasses}`}>
            {similar.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </WideSectionContainer>
    </section>
  )
}
