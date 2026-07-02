import { describe, expect, it } from 'vitest'
import {
  buildAppleMapsDirectionsUrl,
  buildDirectionsUrl,
  buildGoogleMapsDirectionsUrl,
  buildWazeDirectionsUrl,
  hasPropertyCoordinates,
  hasPropertyDirections,
  resolvePropertyLocation,
} from '@/lib/property/mapLinks'
import type { Product } from '@/data/static-cms'

const baseProduct = {
  id: '1',
  name: 'Test Villa',
  slug: 'test-villa',
  exactAddress: 'Palm Jumeirah, Dubai',
} as Product

describe('mapLinks', () => {
  it('resolves coordinates from product and area fallback', () => {
    const product = { ...baseProduct, latitude: 25.1, longitude: 55.2 } as Product
    const location = resolvePropertyLocation(product)
    expect(location.lat).toBe(25.1)
    expect(location.lng).toBe(55.2)
    expect(location.address).toBe('Palm Jumeirah, Dubai')
  })

  it('falls back to area coordinates when product coords are missing', () => {
    const product = { ...baseProduct, areaId: 'area-1', latitude: null, longitude: null } as Product
    const location = resolvePropertyLocation(product, {
      areas: {
        'area-1': { name: 'Palm Jumeirah', city: 'Dubai', latitude: 25.11, longitude: 55.22 },
      },
      types: {},
      statuses: {},
      furnishing: {},
      agents: {},
      amenities: {},
    })
    expect(location.lat).toBe(25.11)
    expect(location.lng).toBe(55.22)
  })

  it('builds provider-specific direction URLs', () => {
    const location = { lat: 25.1, lng: 55.2, address: 'Palm Jumeirah, Dubai' }
    expect(buildGoogleMapsDirectionsUrl(location)).toContain('google.com/maps/dir')
    expect(buildAppleMapsDirectionsUrl(location)).toContain('maps.apple.com')
    expect(buildWazeDirectionsUrl(location)).toContain('waze.com/ul')
    expect(buildDirectionsUrl(location, 'google')).toContain('google.com/maps/dir')
  })

  it('supports address-only directions', () => {
    const location = { lat: null, lng: null, address: 'Palm Jumeirah, Dubai' }
    expect(hasPropertyCoordinates(location)).toBe(false)
    expect(hasPropertyDirections(location)).toBe(true)
    expect(buildGoogleMapsDirectionsUrl(location)).toContain(encodeURIComponent('Palm Jumeirah, Dubai'))
  })
})
