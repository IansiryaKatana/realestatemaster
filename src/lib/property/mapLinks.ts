import type { Product } from '@/data/static-cms'
import type { PropertyLookups } from '@/lib/property/propertyLookups'

export type MapProvider = 'google' | 'apple' | 'waze' | 'auto'

export type PropertyLocation = {
  lat: number | null
  lng: number | null
  address: string | null
}

export function resolvePropertyLocation(product: Product, lookups?: PropertyLookups): PropertyLocation {
  let lat = product.latitude ?? null
  let lng = product.longitude ?? null

  if ((lat == null || lng == null) && product.areaId && lookups?.areas[product.areaId]) {
    const area = lookups.areas[product.areaId]
    lat = area.latitude ?? lat
    lng = area.longitude ?? lng
  }

  return {
    lat,
    lng,
    address: product.exactAddress?.trim() || null,
  }
}

export function hasPropertyCoordinates(location: PropertyLocation): boolean {
  return location.lat != null && location.lng != null
}

export function hasPropertyDirections(location: PropertyLocation): boolean {
  return hasPropertyCoordinates(location) || Boolean(location.address)
}

function encodeAddress(address: string) {
  return encodeURIComponent(address)
}

export function detectPreferredMapProvider(): 'apple' | 'google' {
  if (typeof navigator === 'undefined') return 'google'
  const ua = navigator.userAgent
  const isApple =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  return isApple ? 'apple' : 'google'
}

export function buildGoogleMapsDirectionsUrl(location: PropertyLocation): string {
  if (hasPropertyCoordinates(location)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
  }
  if (location.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeAddress(location.address)}`
  }
  return 'https://www.google.com/maps'
}

export function buildAppleMapsDirectionsUrl(location: PropertyLocation): string {
  if (hasPropertyCoordinates(location)) {
    return `https://maps.apple.com/?daddr=${location.lat},${location.lng}`
  }
  if (location.address) {
    return `https://maps.apple.com/?q=${encodeAddress(location.address)}`
  }
  return 'https://maps.apple.com'
}

export function buildWazeDirectionsUrl(location: PropertyLocation): string {
  if (hasPropertyCoordinates(location)) {
    return `https://waze.com/ul?ll=${location.lat},${location.lng}&navigate=yes`
  }
  if (location.address) {
    return `https://waze.com/ul?q=${encodeAddress(location.address)}&navigate=yes`
  }
  return 'https://waze.com'
}

export function buildDirectionsUrl(
  location: PropertyLocation,
  provider: MapProvider = 'auto',
): string {
  const resolved = provider === 'auto' ? detectPreferredMapProvider() : provider
  if (resolved === 'apple') return buildAppleMapsDirectionsUrl(location)
  if (resolved === 'waze') return buildWazeDirectionsUrl(location)
  return buildGoogleMapsDirectionsUrl(location)
}

export function openDirections(location: PropertyLocation, provider: MapProvider = 'auto') {
  const url = buildDirectionsUrl(location, provider)
  window.open(url, '_blank', 'noopener,noreferrer')
}
