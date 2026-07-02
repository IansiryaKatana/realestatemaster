import { Suspense, lazy, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const PropertyLeafletMap = lazy(() =>
  import('@/components/property/PropertyLeafletMap').then((mod) => ({ default: mod.PropertyLeafletMap })),
)

type PropertyMapPreviewProps = {
  lat: number
  lng: number
  title: string
  zoom?: number
  className?: string
}

function MapPlaceholder({ className }: { className?: string }) {
  return <div className={cn('h-full w-full bg-[#e8e4dc]', className)} aria-hidden />
}

export function PropertyMapPreviewView({ lat, lng, title, zoom = 14, className }: PropertyMapPreviewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <MapPlaceholder className={className} />
  }

  return (
    <Suspense fallback={<MapPlaceholder className={className} />}>
      <PropertyLeafletMap lat={lat} lng={lng} title={title} zoom={zoom} className={className} />
    </Suspense>
  )
}
