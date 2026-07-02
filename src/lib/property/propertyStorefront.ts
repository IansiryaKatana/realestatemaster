import { tryGetSupabase } from '@/integrations/supabase/client'
import { mapProductRows } from '@/lib/cms/mapProduct'
import type { Product } from '@/data/static-cms'

export type PropertyAmenity = {
  id: string
  name: string
  icon: string | null
}

export async function fetchPropertyAmenities(propertyId: string): Promise<PropertyAmenity[]> {
  const supabase = tryGetSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('property_amenities')
    .select('amenity_id, amenities(id, name, icon)')
    .eq('property_id', propertyId)

  if (error) throw new Error(error.message)

  return (data ?? [])
    .map((row) => {
      const amenity = row.amenities as { id?: string; name?: string; icon?: string | null } | null
      if (!amenity?.id || !amenity.name) return null
      return { id: amenity.id, name: amenity.name, icon: amenity.icon ?? null }
    })
    .filter((item): item is PropertyAmenity => item !== null)
}

export async function fetchSimilarProperties(product: Product, limit = 4): Promise<Product[]> {
  const supabase = tryGetSupabase()
  if (!supabase) return []

  let query = supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .neq('id', product.id)

  if (product.listingType) {
    query = query.eq('listing_type', product.listingType)
  }
  if (product.areaId) {
    query = query.eq('area_id', product.areaId)
  }

  const { data, error } = await query.order('sort_order').limit(limit)
  if (error) throw new Error(error.message)

  let items = mapProductRows(data ?? [])

  if (items.length < limit && product.listingType) {
    const { data: fallback } = await supabase
      .from('products')
      .select('*')
      .eq('published', true)
      .eq('listing_type', product.listingType)
      .neq('id', product.id)
      .order('sort_order')
      .limit(limit)

    const seen = new Set(items.map((p) => p.id))
    for (const row of mapProductRows(fallback ?? [])) {
      if (!seen.has(row.id)) items.push(row)
      if (items.length >= limit) break
    }
  }

  return items.slice(0, limit)
}
