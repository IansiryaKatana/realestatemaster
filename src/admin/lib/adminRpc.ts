import type { Database } from '@/integrations/supabase/database.types'
import { isSupabaseConfigured, tryGetSupabase } from '@/integrations/supabase/client'

export type CmsMediaRow = Database['public']['Tables']['cms_media']['Row']
export type CategoryRow = Database['public']['Tables']['categories']['Row']
export type CollectionRow = Database['public']['Tables']['collections']['Row']

type RpcOk<T> = { ok: true } & T
type RpcErr = { ok: false; error: string }

function getClient() {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured')
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchAdminSession() {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_get_admin_session')
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ is_admin: boolean; can_edit: boolean; can_manage_users: boolean; role: string | null }> | RpcErr
  if (!result?.ok) return { isAdmin: false, canEdit: false, canManageUsers: false, role: null as string | null }
  return {
    isAdmin: Boolean(result.is_admin),
    canEdit: Boolean(result.can_edit),
    canManageUsers: Boolean(result.can_manage_users),
    role: result.role,
  }
}

export async function fetchAdminEditContext() {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_get_admin_edit_context')
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ categories: CategoryRow[]; collections: CollectionRow[] }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load edit context')
  return {
    categories: result.categories ?? [],
    collections: result.collections ?? [],
  }
}

export async function fetchAdminDashboard() {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_get_admin_dashboard')
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{
    counts: {
      products: number
      collections: number
      unread_quotes?: number
      unread_submissions?: number
      categories?: number
      subscribers?: number
      media: number
      total_sales?: number
      users?: number
    }
    recent_newsletter: Database['public']['Tables']['newsletter_subscribers']['Row'][]
    order_chart?: {
      daily: { label: string; short_label?: string; date?: string; count: number; is_current: boolean }[]
      weekly: { label: string; short_label?: string; date?: string; count: number; is_current: boolean }[]
      monthly: { label: string; year?: number; month?: number; count: number; is_current: boolean }[]
    }
  }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load dashboard')
  return {
    counts: {
      products: Number(result.counts.products ?? 0),
      collections: Number(result.counts.collections ?? 0),
      unreadQuotes: Number(result.counts.unread_quotes ?? 0),
      unreadSubmissions: Number(result.counts.unread_submissions ?? 0),
      media: Number(result.counts.media ?? 0),
      totalSales: Number(result.counts.total_sales ?? result.counts.users ?? 0),
    },
    recentNewsletter: result.recent_newsletter ?? [],
    orderChart: result.order_chart ?? { daily: [], weekly: [], monthly: [] },
  }
}

export async function listCmsMedia(options?: {
  limit?: number
  offset?: number
  kind?: string | null
  search?: string
}) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_list_cms_media', {
    p_limit: options?.limit ?? 48,
    p_offset: options?.offset ?? 0,
    p_kind: options?.kind !== undefined ? options.kind : 'image',
    p_search: options?.search ?? null,
  })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ items: CmsMediaRow[]; total: number }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load media')
  return { items: result.items ?? [], total: Number(result.total ?? 0) }
}

export async function registerCmsMedia(payload: {
  publicUrl: string
  folder: string
  kind: string
  fileName: string
}) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_register_cms_media', {
    p_public_url: payload.publicUrl,
    p_folder: payload.folder,
    p_kind: payload.kind,
    p_file_name: payload.fileName,
  })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ media: CmsMediaRow }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to register media')
  return result.media
}

export async function listAdminProducts(options?: { limit?: number; offset?: number; search?: string }) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_list_admin_products', {
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
    p_search: options?.search ?? null,
  })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ items: Database['public']['Tables']['products']['Row'][]; total: number }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load products')
  return { items: result.items ?? [], total: Number(result.total ?? 0) }
}

export async function listAdminOrders(options?: { limit?: number; offset?: number; search?: string }) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_list_admin_orders', {
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
    p_search: options?.search ?? null,
  })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ items: Database['public']['Tables']['orders']['Row'][]; total: number }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load orders')
  return { items: result.items ?? [], total: Number(result.total ?? 0) }
}

async function listAdminRows<T>(rpc: string): Promise<T[]> {
  const supabase = getClient()
  const { data, error } = await supabase.rpc(rpc)
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ items: T[] }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? `Failed to load ${rpc}`)
  return result.items ?? []
}

export const listAdminCategories = () => listAdminRows<CategoryRow>('rpc_list_admin_categories')
export const listAdminCollections = () => listAdminRows<CollectionRow>('rpc_list_admin_collections')
export const listAdminHeroSlides = () => listAdminRows<Database['public']['Tables']['hero_slides']['Row']>('rpc_list_admin_hero_slides')
export const listAdminFeatureCards = () => listAdminRows<Database['public']['Tables']['feature_cards']['Row']>('rpc_list_admin_feature_cards')
export const listAdminNavLinks = () => listAdminRows<Database['public']['Tables']['nav_links']['Row']>('rpc_list_admin_nav_links')
export const listAdminSocialLinks = () => listAdminRows<Database['public']['Tables']['social_links']['Row']>('rpc_list_admin_social_links')
export const listAdminHomepageSections = () => listAdminRows<Database['public']['Tables']['homepage_sections']['Row']>('rpc_list_admin_homepage_sections')
export const listAdminLifestyleCards = () => listAdminRows<Database['public']['Tables']['lifestyle_cards']['Row']>('rpc_list_admin_lifestyle_cards')
export const listAdminPages = () => listAdminRows<Database['public']['Tables']['marketing_pages']['Row']>('rpc_list_admin_pages')
export const listAdminNewsletter = () => listAdminRows<Database['public']['Tables']['newsletter_subscribers']['Row']>('rpc_list_admin_newsletter')
export const listAdminCoupons = () => listAdminRows<Database['public']['Tables']['coupons']['Row']>('rpc_list_admin_coupons')
export const listAdminUsers = () => listAdminRows<Database['public']['Tables']['admin_users']['Row']>('rpc_list_admin_users')
export const listAdminAgents = () => listAdminRows<Database['public']['Tables']['agents']['Row']>('rpc_list_admin_agents')
export const listAdminPropertyInquiries = () => listAdminRows<Database['public']['Tables']['property_inquiries']['Row']>('rpc_list_admin_property_inquiries')
export const listAdminFormSubmissions = () => listAdminRows<Database['public']['Tables']['form_submissions']['Row']>('rpc_list_admin_form_submissions')
export const listAdminBundles = () => listAdminRows<Database['public']['Tables']['product_bundles']['Row']>('rpc_list_admin_bundles')

export async function listAdminSiteSettingsRows() {
  return listAdminRows<Database['public']['Tables']['site_settings']['Row']>('rpc_list_admin_site_settings')
}

export async function listAdminReviews(options?: { limit?: number; offset?: number; status?: string }) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_list_admin_reviews', {
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
    p_status: options?.status ?? null,
  })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ items: Database['public']['Tables']['product_reviews']['Row'][]; total: number }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load reviews')
  return { items: result.items ?? [], total: Number(result.total ?? 0) }
}

export async function listAdminInvoices(options?: { limit?: number; offset?: number; search?: string }) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_list_admin_invoices', {
    p_limit: options?.limit ?? 100,
    p_offset: options?.offset ?? 0,
    p_search: options?.search ?? null,
  })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ items: Database['public']['Tables']['invoices']['Row'][]; total: number }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load invoices')
  return { items: result.items ?? [], total: Number(result.total ?? 0) }
}

export async function fetchAdminAgencySettings() {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_get_admin_agency_settings')
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ agency: Database['public']['Tables']['agency_settings']['Row'] | null; favicon_url: string | null }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load agency settings')
  return { agency: result.agency ?? null, faviconUrl: result.favicon_url ?? '' }
}

export async function adminDelete(entity: string, id: string) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_admin_delete', { p_entity: entity, p_id: id })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<Record<string, never>> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Delete failed')
}

export async function adminBulkDelete(entity: string, ids: string[]) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_admin_bulk_delete', { p_entity: entity, p_ids: ids })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ count: number }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Bulk delete failed')
}

export async function listProductVariants(productId: string) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_list_product_variants', { p_product_id: productId })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ items: Database['public']['Tables']['product_variants']['Row'][] }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load variants')
  return result.items ?? []
}

export async function listProductAmenityIds(productId: string) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_list_product_amenity_ids', { p_product_id: productId })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ ids: string[] }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to load amenities')
  return result.ids ?? []
}

export async function adminBulkUpdateProducts(ids: string[], patch: Record<string, unknown>) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_admin_bulk_update_products', { p_ids: ids, p_patch: patch })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ count: number }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Bulk update failed')
}

export async function adminUpdateReviewStatus(id: string, status: 'approved' | 'rejected') {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_admin_update_review_status', { p_id: id, p_status: status })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<Record<string, never>> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to update review')
}

export async function adminMarkSubmissionViewed(id: string) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_admin_mark_submission_viewed', { p_id: id })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<{ admin_viewed_at: string }> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to mark viewed')
  return result.admin_viewed_at
}

export async function adminUpdateSubmissionStatus(id: string, status: string) {
  const supabase = getClient()
  const { data, error } = await supabase.rpc('rpc_admin_update_submission_status', { p_id: id, p_status: status })
  if (error) throw new Error(error.message)
  const result = data as RpcOk<Record<string, never>> | RpcErr
  if (!result?.ok) throw new Error(result.error ?? 'Failed to update submission')
}
