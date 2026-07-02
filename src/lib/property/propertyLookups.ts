import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, tryGetSupabase } from '@/integrations/supabase/client'

export type PropertyLookups = {
  areas: Record<string, { name: string; city: string | null; latitude: number | null; longitude: number | null }>
  types: Record<string, { name: string }>
  statuses: Record<string, { name: string }>
  furnishing: Record<string, { name: string }>
  agents: Record<string, { name: string; photoUrl: string | null; email: string | null; phone: string | null; whatsapp: string | null; licenseNumber: string | null }>
  amenities: Record<string, { name: string; icon: string | null }>
}

const emptyLookups: PropertyLookups = {
  areas: {},
  types: {},
  statuses: {},
  furnishing: {},
  agents: {},
  amenities: {},
}

function toRecord<T extends { id: string }>(
  rows: T[],
  map: (row: T) => { name: string; city?: string | null; photoUrl?: string | null },
): Record<string, { name: string; city?: string | null; photoUrl?: string | null }> {
  return Object.fromEntries(rows.map((row) => [row.id, map(row)]))
}

export async function fetchPropertyLookups(): Promise<PropertyLookups> {
  const supabase = tryGetSupabase()
  if (!supabase || !isSupabaseConfigured()) return emptyLookups

  const [areasRes, typesRes, statusesRes, furnishingRes, agentsRes, amenitiesRes] = await Promise.all([
    supabase.from('property_areas').select('id, name, city, latitude, longitude').eq('is_active', true),
    supabase.from('property_types').select('id, name').eq('is_active', true),
    supabase.from('property_statuses').select('id, name').eq('is_active', true),
    supabase.from('furnishing_statuses').select('id, name').eq('is_active', true),
    supabase.from('agents').select('id, name, photo_url, email, phone, whatsapp, license_number').eq('is_active', true),
    supabase.from('amenities').select('id, name, icon').eq('is_active', true),
  ])

  const firstError =
    areasRes.error ?? typesRes.error ?? statusesRes.error ?? furnishingRes.error ?? agentsRes.error ?? amenitiesRes.error
  if (firstError) throw new Error(firstError.message)

  return {
    areas: toRecord(areasRes.data ?? [], (row) => ({
      name: row.name,
      city: row.city,
      latitude: row.latitude != null ? Number(row.latitude) : null,
      longitude: row.longitude != null ? Number(row.longitude) : null,
    })) as PropertyLookups['areas'],
    types: toRecord(typesRes.data ?? [], (row) => ({ name: row.name })) as PropertyLookups['types'],
    statuses: toRecord(statusesRes.data ?? [], (row) => ({ name: row.name })) as PropertyLookups['statuses'],
    furnishing: toRecord(furnishingRes.data ?? [], (row) => ({ name: row.name })) as PropertyLookups['furnishing'],
    agents: toRecord(agentsRes.data ?? [], (row) => ({
      name: row.name,
      photoUrl: row.photo_url ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      whatsapp: row.whatsapp ?? null,
      licenseNumber: row.license_number ?? null,
    })) as PropertyLookups['agents'],
    amenities: toRecord(amenitiesRes.data ?? [], (row) => ({
      name: row.name,
      icon: row.icon ?? null,
    })) as PropertyLookups['amenities'],
  }
}

export const propertyLookupKeys = {
  all: ['property-lookups'] as const,
}

export function usePropertyLookups() {
  return useQuery({
    queryKey: propertyLookupKeys.all,
    queryFn: fetchPropertyLookups,
    staleTime: 5 * 60_000,
    enabled: isSupabaseConfigured(),
  })
}
