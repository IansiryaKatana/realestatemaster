import type { Product } from '@/data/static-cms'
import type { PropertyLookups } from '@/lib/property/propertyLookups'

export function isPropertyListing(product: Product): boolean {
  return product.listingType === 'rent' || product.listingType === 'sale'
}

export function propertyListingLabel(listingType: Product['listingType']): string {
  if (listingType === 'rent') return 'For Rent'
  if (listingType === 'sale') return 'For Sale'
  return ''
}

export function propertyPriceLabel(product: Product): string {
  if (product.listingType === 'rent') return '/ year'
  if (product.listingType === 'sale') return ''
  return ''
}

export function propertyPrimaryActionLabel(listingType: Product['listingType']): string {
  if (listingType === 'rent') return 'Rent Now'
  if (listingType === 'sale') return 'Buy Now'
  return 'Apply Now'
}

export function propertyInterestType(listingType: Product['listingType']): 'rent' | 'buy' | 'both' {
  if (listingType === 'rent') return 'rent'
  if (listingType === 'sale') return 'buy'
  return 'both'
}

export function formatPropertyStats(product: Product): string[] {
  const parts: string[] = []
  if (product.bedrooms != null) parts.push(`${product.bedrooms} bed`)
  if (product.bathrooms != null) parts.push(`${product.bathrooms} bath`)
  if (product.sizeSqft != null) parts.push(`${product.sizeSqft.toLocaleString()} sqft`)
  return parts
}

export function resolvePropertyMeta(product: Product, lookups: PropertyLookups) {
  const agent = product.assignedAgentId ? lookups.agents[product.assignedAgentId] : null
  return {
    areaName: product.areaId ? lookups.areas[product.areaId]?.name ?? null : null,
    city: product.areaId ? lookups.areas[product.areaId]?.city ?? null : null,
    propertyTypeName: product.propertyTypeId ? lookups.types[product.propertyTypeId]?.name ?? null : null,
    statusName: product.propertyStatusId ? lookups.statuses[product.propertyStatusId]?.name ?? null : null,
    furnishingName: product.furnishingStatusId
      ? lookups.furnishing[product.furnishingStatusId]?.name ?? null
      : null,
    agentName: agent?.name ?? null,
    agentPhotoUrl: agent?.photoUrl ?? null,
    agentEmail: agent?.email ?? null,
    agentPhone: agent?.phone ?? null,
    agentWhatsapp: agent?.whatsapp ?? null,
    agentLicense: agent?.licenseNumber ?? null,
  }
}
