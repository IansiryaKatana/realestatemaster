import { Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PropertyLocation } from '@/lib/property/mapLinks'
import {
  buildAppleMapsDirectionsUrl,
  buildGoogleMapsDirectionsUrl,
  buildWazeDirectionsUrl,
  openDirections,
} from '@/lib/property/mapLinks'
import { cn } from '@/lib/utils'

const directionButtonClass =
  'inline-flex h-9 w-auto shrink-0 self-start items-center justify-center gap-1.5 rounded-md bg-[#1a73e8] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#1557b0]'

type PropertyDirectionButtonsProps = {
  location: PropertyLocation
  className?: string
}

export function PropertyDirectionButtons({ location, className }: PropertyDirectionButtonsProps) {
  return (
    <div className={cn('flex flex-wrap items-start gap-2', className)}>
      <Button
        type="button"
        variant="ghost"
        className={cn(directionButtonClass, 'hover:text-white')}
        onClick={() => openDirections(location)}
      >
        <Navigation className="size-4 shrink-0" />
        Directions
      </Button>
      <a
        href={buildGoogleMapsDirectionsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className={directionButtonClass}
      >
        Google
      </a>
      <a
        href={buildAppleMapsDirectionsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className={directionButtonClass}
      >
        Apple
      </a>
      <a
        href={buildWazeDirectionsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className={directionButtonClass}
      >
        Waze
      </a>
    </div>
  )
}
