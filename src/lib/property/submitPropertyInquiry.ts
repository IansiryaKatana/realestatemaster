import type { Product } from '@/data/static-cms'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { propertyInterestType } from '@/lib/property/formatProperty'

export type PropertyInquiryInput = {
  product: Product
  fullName: string
  email: string
  phone?: string
  message?: string
  preferredViewingDate?: string
  preferredViewingTime?: string
  interestType?: 'rent' | 'buy' | 'both'
  requestViewing?: boolean
}

export async function submitPropertyInquiry(input: PropertyInquiryInput) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data: sessionData } = await supabase.auth.getSession()
  const headers: Record<string, string> = {}
  if (sessionData.session?.access_token) {
    headers.Authorization = `Bearer ${sessionData.session.access_token}`
  }

  const { data, error } = await supabase.functions.invoke('submit-property-inquiry', {
    body: {
      property_id: input.product.id,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message ?? null,
      preferred_viewing_date: input.preferredViewingDate || null,
      preferred_viewing_time: input.preferredViewingTime || null,
      interest_type: input.interestType ?? propertyInterestType(input.product.listingType),
      request_viewing: input.requestViewing ?? true,
    },
    headers,
  })

  if (error) return { ok: false as const, error: error.message }

  const result = data as { ok?: boolean; error?: string; transaction_id?: string }
  if (!result?.ok) return { ok: false as const, error: result?.error ?? 'Inquiry failed' }
  return { ok: true as const, transactionId: result.transaction_id! }
}
