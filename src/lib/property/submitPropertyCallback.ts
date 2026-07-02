import { tryGetSupabase } from '@/integrations/supabase/client'

export async function submitPropertyCallback(input: {
  propertyId: string
  fullName: string
  phone: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data, error } = await supabase.functions.invoke('submit-property-callback', {
    body: {
      property_id: input.propertyId,
      full_name: input.fullName,
      phone: input.phone,
    },
  })

  if (error) return { ok: false as const, error: error.message }
  const result = data as { ok?: boolean; error?: string }
  if (!result?.ok) return { ok: false as const, error: result?.error ?? 'Callback request failed' }
  return { ok: true as const }
}
