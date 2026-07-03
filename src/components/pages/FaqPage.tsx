import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Search } from 'lucide-react'
import type { MarketingPage } from '@/data/static-cms'
import { PageHero } from '@/components/layout/PageHero'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { RichTextContent } from '@/components/content/RichTextContent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { faqKeys, fetchFaqCategories, fetchPublishedFaqs, type FaqEntry } from '@/lib/faq/faqQueries'
import { usePageMeta } from '@/lib/seo'

type FaqPageProps = {
  page: MarketingPage
}

function FaqJsonLd({ faqs }: { faqs: FaqEntry[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.slice(0, 50).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function FaqCategoryNav({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: { id: string; slug: string; title: string }[]
  activeCategory: string
  onSelect: (slug: string) => void
}) {
  const itemClass = (active: boolean) =>
    cn(
      'w-full py-2 text-left text-sm transition',
      active ? 'font-semibold text-cta-brown' : 'text-text-brown hover:text-cta-brown',
    )

  return (
    <nav aria-label="FAQ topics" className="flex flex-col">
      <button type="button" onClick={() => onSelect('all')} className={itemClass(activeCategory === 'all')}>
        All topics
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.slug)}
          className={itemClass(activeCategory === cat.slug)}
        >
          {cat.title}
        </button>
      ))}
    </nav>
  )
}

function FaqAccordionItem({ faq, defaultOpen }: { faq: FaqEntry; defaultOpen?: boolean }) {
  return (
    <details
      id={faq.slug}
      open={defaultOpen}
      className="group border-b border-[#e8e0d4] last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 font-semibold text-text-brown marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="text-left text-sm leading-snug md:text-base">{faq.question}</span>
        <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-cta-brown transition group-open:rotate-180" />
      </summary>
      <div className="pb-5">
        <RichTextContent
          html={faq.answer_html}
          className="prose-a:font-semibold text-sm leading-relaxed text-muted"
        />
      </div>
    </details>
  )
}

export function FaqPage({ page }: FaqPageProps) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const { data: categories = [] } = useQuery({
    queryKey: faqKeys.categories(),
    queryFn: fetchFaqCategories,
  })

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: faqKeys.entries(),
    queryFn: fetchPublishedFaqs,
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return faqs.filter((faq) => {
      const inCategory = activeCategory === 'all' || faq.category?.slug === activeCategory
      if (!inCategory) return false
      if (!q) return true
      const plain = faq.answer_html.replace(/<[^>]+>/g, ' ')
      return faq.question.toLowerCase().includes(q) || plain.toLowerCase().includes(q)
    })
  }, [faqs, query, activeCategory])

  const grouped = useMemo(() => {
    if (activeCategory !== 'all') {
      return [{ slug: activeCategory, title: categories.find((c) => c.slug === activeCategory)?.title ?? '', items: filtered }]
    }
    return categories
      .map((cat) => ({
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        items: filtered.filter((f) => f.category?.slug === cat.slug),
      }))
      .filter((g) => g.items.length > 0)
  }, [activeCategory, categories, filtered])

  usePageMeta({
    title: `${page.title} | GW Vacation Homes`,
    description: page.metaDescription ?? '150+ answers about renting, buying, and property applications in Dubai.',
    path: '/pages/faq',
  })

  return (
    <StorefrontLayout>
      <FaqJsonLd faqs={faqs} />
      <PageHero
        title={page.title}
        subtitle="150+ expert answers on renting, buying, viewings, contracts, Ejari, DEWA, payments, and handover in Dubai."
        backLabel="Back to Home"
        contained
      />

      <SectionContainer className="py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(220px,280px)_1fr] lg:items-start lg:gap-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative mb-6">
              <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="search"
                placeholder="Search FAQs…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-none border-0 border-b border-[#d7c7b4]/60 bg-transparent pl-7 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-label="Search FAQs"
              />
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Topics</p>
            <FaqCategoryNav
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />
          </aside>

          <div className="min-w-0">
            {isLoading ? (
              <p className="text-muted">Loading FAQs…</p>
            ) : filtered.length === 0 ? (
              <div className="py-10">
                <p className="text-muted">No questions match your search.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setQuery(''); setActiveCategory('all') }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {grouped.map((group) => (
                  <section key={group.slug} aria-labelledby={`faq-${group.slug}`}>
                    <div className="mb-5 border-b border-[#e8e0d4] pb-3">
                      <h2 id={`faq-${group.slug}`} className="font-display text-xl font-extrabold text-text-brown md:text-2xl">
                        {group.title}
                      </h2>
                      {'description' in group && group.description ? (
                        <p className="mt-1 text-sm text-muted">{group.description}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted">{group.items.length} questions</p>
                    </div>
                    <div>
                      {group.items.map((faq, idx) => (
                        <FaqAccordionItem key={faq.id} faq={faq} defaultOpen={idx === 0 && Boolean(query)} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-14 border-t border-[#e8e0d4] pt-10">
          <h2 className="font-display text-xl font-extrabold text-text-brown">Still have a question?</h2>
          <p className="mt-2 text-sm text-muted">
            Browse our guides or speak with an agent about a specific listing or application.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/pages/contact">Contact us</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/pages/how-it-works">How it works</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/pages/renting-guide">Renting guide</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/pages/buying-guide">Buying guide</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/collection/all">Browse listings</Link>
            </Button>
          </div>
        </div>
      </SectionContainer>
    </StorefrontLayout>
  )
}
