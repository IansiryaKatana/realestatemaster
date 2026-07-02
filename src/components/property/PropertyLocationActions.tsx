import type { Product } from '@/data/static-cms'
import {
  hasPropertyCoordinates,
  hasPropertyDirections,
  resolvePropertyLocation,
} from '@/lib/property/mapLinks'
import type { PropertyLookups } from '@/lib/property/propertyLookups'
import { PropertyDirectionButtons } from '@/components/property/PropertyDirectionButtons'
import { cn } from '@/lib/utils'

type PropertyLocationActionsProps = {
  product: Product
  lookups?: PropertyLookups
  className?: string
}

export function PropertyLocationActions({ product, lookups, className }: PropertyLocationActionsProps) {
  const location = resolvePropertyLocation(product, lookups)
  if (!hasPropertyDirections(location)) return null

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <PropertyDirectionButtons location={location} />
      {hasPropertyCoordinates(location) ? (
        <p className="text-sm text-muted">
          Coordinates: {location.lat!.toFixed(5)}, {location.lng!.toFixed(5)}
        </p>
      ) : null}
    </div>
  )
}
