import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { useClientViewings } from '@/lib/property/propertyTransactionQueries'
import { PageHero } from '@/components/layout/PageHero'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/account/viewings/')({
  component: AccountViewingsPage,
  head: () => ({ meta: [{ title: 'Viewing Requests | GW Vacation Homes' }] }),
})

function AccountViewingsPage() {
  const { user, loading: authLoading } = useStorefrontAuth()
  const { data: viewings = [], isLoading } = useClientViewings(Boolean(user))

  if (authLoading) {
    return (
      <StorefrontLayout>
        <SectionContainer className="flex flex-1 items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </SectionContainer>
      </StorefrontLayout>
    )
  }

  if (!user) {
    return (
      <StorefrontLayout>
        <PageHero title="Viewing requests" />
        <SectionContainer className="py-10 text-center">
          <Button asChild><Link to="/account">Sign in</Link></Button>
        </SectionContainer>
      </StorefrontLayout>
    )
  }

  return (
    <StorefrontLayout>
      <PageHero title="Viewing requests" backTo="/account" backLabel="Back to account" />
      <SectionContainer className="py-10">
        {isLoading ? (
          <p className="text-muted">Loading viewings…</p>
        ) : viewings.length === 0 ? (
          <div className="rounded-xl border border-[#e8e0d4] p-10 text-center text-muted">No viewing requests yet.</div>
        ) : (
          <div className="space-y-3">
            {viewings.map((viewing) => {
              const property = viewing.products as { name?: string; slug?: string; image_url?: string } | null
              return (
                <article key={viewing.id} className="flex flex-col gap-3 rounded-xl border border-[#e8e0d4] p-4 sm:flex-row sm:items-center">
                  {property?.image_url ? <img src={property.image_url} alt="" className="h-16 w-16 rounded object-cover" /> : null}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text-brown">{property?.name ?? 'Property'}</h3>
                    <p className="text-sm capitalize text-muted">Status: {viewing.status.replaceAll('_', ' ')}</p>
                    {viewing.scheduled_date ? <p className="text-sm text-muted">Scheduled: {viewing.scheduled_date}</p> : null}
                  </div>
                  {viewing.transaction_id ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/account/transactions/$transactionId" params={{ transactionId: viewing.transaction_id }}>
                        View application
                      </Link>
                    </Button>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </SectionContainer>
    </StorefrontLayout>
  )
}
