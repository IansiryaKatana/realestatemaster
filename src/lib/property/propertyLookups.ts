import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured } from '@/integrations/supabase/client'
import { callRpc } from '@/lib/rpc/callRpc'

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

export async function fetchPropertyLookups(): Promise<PropertyLookups> {
  if (!isSupabaseConfigured()) return emptyLookups
  try {
    const result = await callRpc<{
      areas: PropertyLookups['areas']
      types: PropertyLookups['types']
      statuses: PropertyLookups['statuses']
      furnishing: PropertyLookups['furnishing']
      agents: PropertyLookups['agents']
      amenities: PropertyLookups['amenities']
    }>('rpc_get_property_lookups')
    return {
      areas: result.areas ?? {},
      types: result.types ?? {},
      statuses: result.statuses ?? {},
      furnishing: result.furnishing ?? {},
      agents: result.agents ?? {},
      amenities: result.amenities ?? {},
    }
  } catch {
    return emptyLookups
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
