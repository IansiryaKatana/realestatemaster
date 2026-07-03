import { tryGetSupabase } from '@/integrations/supabase/client'

export type FaqCategory = {
  id: string
  slug: string
  title: string
  description: string | null
  sort_order: number
}

export type FaqEntry = {
  id: string
  category_id: string
  slug: string
  question: string
  answer_html: string
  meta_description: string | null
  sort_order: number
  category?: FaqCategory
}

export async function fetchFaqCategories(): Promise<FaqCategory[]> {
  const supabase = tryGetSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('faq_categories')
    .select('id, slug, title, description, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchPublishedFaqs(): Promise<FaqEntry[]> {
  const supabase = tryGetSupabase()
  if (!supabase) return []

  const [faqsRes, categoriesRes] = await Promise.all([
    supabase
      .from('faqs')
      .select('id, category_id, slug, question, answer_html, meta_description, sort_order')
      .eq('is_published', true)
      .order('sort_order', { ascending: true }),
    fetchFaqCategories(),
  ])

  if (faqsRes.error) throw new Error(faqsRes.error.message)

  const categoryMap = new Map(categoriesRes.map((c) => [c.id, c]))

  return (faqsRes.data ?? []).map((row) => ({
    ...row,
    category: categoryMap.get(row.category_id),
  }))
}

export const faqKeys = {
  all: ['faqs'] as const,
  categories: () => [...faqKeys.all, 'categories'] as const,
  entries: () => [...faqKeys.all, 'entries'] as const,
}
