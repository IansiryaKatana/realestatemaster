import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { fetchClientNotifications, markNotificationRead, propertyTransactionKeys } from '@/lib/property/propertyTransactionQueries'
import { PageHero } from '@/components/layout/PageHero'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/account/notifications')({
  component: AccountNotificationsPage,
  head: () => ({ meta: [{ title: 'Notifications | GW Vacation Homes' }] }),
})

function AccountNotificationsPage() {
  const { user, loading: authLoading } = useStorefrontAuth()
  const queryClient = useQueryClient()
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: propertyTransactionKeys.notifications(),
    queryFn: fetchClientNotifications,
    enabled: Boolean(user),
  })

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
        <PageHero title="Notifications" />
        <SectionContainer className="py-10 text-center">
          <Button asChild><Link to="/account">Sign in</Link></Button>
        </SectionContainer>
      </StorefrontLayout>
    )
  }

  return (
    <StorefrontLayout>
      <PageHero title="Notifications" backTo="/account" backLabel="Back to account" />
      <SectionContainer className="py-10">
        {isLoading ? (
          <p className="text-muted">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-[#e8e0d4] p-10 text-center text-muted">No notifications yet.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <article
                key={item.id}
                className={`rounded-xl border p-4 ${item.is_read ? 'border-[#e8e0d4] bg-white' : 'border-cta-brown/30 bg-[#faf8f4]'}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-text-brown">{item.title}</p>
                    {item.body ? <p className="mt-1 text-sm text-muted">{item.body}</p> : null}
                    <p className="mt-2 text-xs text-muted">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.transaction_id ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/account/transactions/$transactionId" params={{ transactionId: item.transaction_id }}>
                          View application
                        </Link>
                      </Button>
                    ) : null}
                    {!item.is_read ? (
                      <Button
                        size="sm"
                        onClick={async () => {
                          await markNotificationRead(item.id)
                          void queryClient.invalidateQueries({ queryKey: propertyTransactionKeys.notifications() })
                        }}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionContainer>
    </StorefrontLayout>
  )
}
