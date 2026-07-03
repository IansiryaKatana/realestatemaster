import type { Product } from '@/data/static-cms'
import { Bath, BedDouble, MapPin, Ruler } from 'lucide-react'
import { formatPropertyStats } from '@/lib/property/formatProperty'
import { cn } from '@/lib/utils'

type PropertyStatsProps = {
  product: Product
  areaName?: string | null
  className?: string
  compact?: boolean
}

export function PropertyStats({ product, areaName, className, compact = false }: PropertyStatsProps) {
  const stats = formatPropertyStats(product)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {areaName ? (
        <p className={cn('flex items-center gap-1.5 text-muted', compact ? 'text-xs' : 'text-sm')}>
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{areaName}</span>
        </p>
      ) : null}
      {stats.length > 0 ? (
        <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5 text-text-brown', compact ? 'text-xs md:text-base' : 'text-sm')}>
          {product.bedrooms != null ? (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-muted" />
              {product.bedrooms}
            </span>
          ) : null}
          {product.bathrooms != null ? (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-muted" />
              {product.bathrooms}
            </span>
          ) : null}
          {product.sizeSqft != null ? (
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-muted" />
              {product.sizeSqft.toLocaleString()} sqft
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
