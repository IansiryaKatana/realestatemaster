import { Images, LayoutList, MapPin } from 'lucide-react'
import { ProductHeroCarousel } from '@/components/product/ProductHeroCarousel'
import { PropertyDirectionButtons } from '@/components/property/PropertyDirectionButtons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Product } from '@/data/static-cms'
import { resolvePropertyMeta } from '@/lib/property/formatProperty'
import {
  hasPropertyCoordinates,
  hasPropertyDirections,
  resolvePropertyLocation,
} from '@/lib/property/mapLinks'
import { PropertyMapPreviewView } from '@/components/property/PropertyMapPreview'
import type { PropertyLookups } from '@/lib/property/propertyLookups'
import type { ReactNode } from 'react'

type PropertyHeroMediaProps = {
  product: Product
  heroImage: string
  galleryUrls?: string[]
  lookups?: PropertyLookups
  mobileDetails?: ReactNode
}

function mergeGalleryImages(heroImage: string, galleryUrls: string[] = []) {
  return [heroImage, ...galleryUrls.filter((url) => url && url !== heroImage)].filter(Boolean)
}

function DirectionsPanel({
  product,
  lookups,
}: {
  product: Product
  lookups?: PropertyLookups
}) {
  const location = resolvePropertyLocation(product, lookups)
  const hasCoordinates = hasPropertyCoordinates(location)
  const { areaName, city } = resolvePropertyMeta(product, lookups ?? {
    areas: {},
    agents: {},
    types: {},
    statuses: {},
    furnishing: {},
    amenities: {},
  })
  const areaLabel = [areaName, city].filter(Boolean).join(', ')
  const displayAddress = location.address || areaLabel || product.name

  return (
    <div className="relative h-full w-full">
      {hasCoordinates ? (
        <div className="absolute inset-0">
          <PropertyMapPreviewView
            lat={location.lat!}
            lng={location.lng!}
            title={`Map location for ${product.name}`}
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center bg-[#e8e4dc]">
          <MapPin className="size-10 text-text-brown/40" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pb-5 pt-14 md:px-14 md:pb-6 md:pt-16">
        <div className="pointer-events-auto max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">Location</p>
          <p className="mt-1 text-base font-medium text-white md:text-lg">{displayAddress}</p>
          {hasPropertyCoordinates(location) ? (
            <p className="mt-1 text-sm text-white/70">
              {location.lat!.toFixed(5)}, {location.lng!.toFixed(5)}
            </p>
          ) : null}

          <PropertyDirectionButtons location={location} className="mt-4" />
        </div>
      </div>
    </div>
  )
}

export function PropertyHeroMedia({
  product,
  heroImage,
  galleryUrls = [],
  lookups,
  mobileDetails,
}: PropertyHeroMediaProps) {
  const images = mergeGalleryImages(heroImage, galleryUrls)
  const location = resolvePropertyLocation(product, lookups)
  const showGallery = images.length > 0
  const showDirections = hasPropertyDirections(location)
  const showDetails = Boolean(mobileDetails)

  if (!showGallery && !showDirections && !showDetails) {
    return <div className="h-full w-full bg-[#f3f1ec]" />
  }

  if (!showDirections && !showDetails) {
    return (
      <ProductHeroCarousel name={product.name} images={images} singleSlide hideIndicators className="h-full" />
    )
  }

  const defaultTab = showGallery ? 'gallery' : showDirections ? 'directions' : 'details'

  return (
    <Tabs defaultValue={defaultTab} className="relative h-full">
      <HeroTabList showGallery={showGallery} showDirections={showDirections} showDetails={showDetails} />

      {showGallery ? (
        <TabsContent value="gallery" className="h-full focus-visible:outline-none">
          <ProductHeroCarousel name={product.name} images={images} singleSlide hideIndicators className="h-full" />
        </TabsContent>
      ) : null}

      {showDirections ? (
        <TabsContent value="directions" className="h-full focus-visible:outline-none">
          <DirectionsPanel product={product} lookups={lookups} />
        </TabsContent>
      ) : null}

      {showDetails ? (
        <TabsContent value="details" className="h-full bg-white md:hidden focus-visible:outline-none">
          <div className="h-full overflow-y-auto px-5 pb-5 pt-[4.25rem]">{mobileDetails}</div>
        </TabsContent>
      ) : null}
    </Tabs>
  )
}

function HeroTabList({
  showGallery,
  showDirections,
  showDetails,
}: {
  showGallery: boolean
  showDirections: boolean
  showDetails: boolean
}) {
  return (
    <TabsList className="absolute left-4 top-4 z-30 h-auto w-fit max-w-[calc(100%-2rem)] flex-wrap justify-start md:left-14">
      {showGallery ? (
        <TabsTrigger value="gallery">
          <Images className="size-4" />
          Gallery
        </TabsTrigger>
      ) : null}
      {showDirections ? (
        <TabsTrigger value="directions">
          <MapPin className="size-4" />
          Directions
        </TabsTrigger>
      ) : null}
      {showDetails ? (
        <TabsTrigger value="details" className="md:hidden">
          <LayoutList className="size-4" />
          Details
        </TabsTrigger>
      ) : null}
    </TabsList>
  )
}
