import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { useClientTransactionDetail } from '@/lib/property/propertyTransactionQueries'
import { TransactionDetailContent } from '@/components/account/TransactionDetailContent'
import { PageHero } from '@/components/layout/PageHero'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/account/transactions/$transactionId')({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === 'string' ? search.session_id : undefined,
  }),
  component: AccountTransactionDetailPage,
  head: () => ({ meta: [{ title: 'Application Details | GW Vacation Homes' }] }),
})

function AccountTransactionDetailPage() {
  const { transactionId } = Route.useParams()
  const { session_id } = Route.useSearch()
  const { user, loading: authLoading } = useStorefrontAuth()
  const { data, isLoading, refetch } = useClientTransactionDetail(transactionId, Boolean(user))

  useEffect(() => {
    if (!session_id) return

    void fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ session_id }),
    })
      .then((res) => res.json())
      .then((body: { ok?: boolean; type?: string; invoice?: { invoice_number?: string } }) => {
        if (body.ok && body.type === 'property_invoice') {
          toast.success(`Payment received for invoice ${body.invoice?.invoice_number ?? ''}`.trim())
          void refetch()
        } else if (!body.ok) {
          toast.error('Payment could not be confirmed yet. Refresh in a moment if you were charged.')
        }
      })
      .catch(() => {
        toast.error('Could not verify payment status')
      })
  }, [session_id, refetch])

  if (authLoading || isLoading) {
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
        <PageHero title="Application" />
        <SectionContainer className="py-10 text-center">
          <Button asChild><Link to="/account">Sign in</Link></Button>
        </SectionContainer>
      </StorefrontLayout>
    )
  }

  if (!data) {
    return (
      <StorefrontLayout>
        <PageHero title="Application not found" backTo="/account/transactions" backLabel="Back to applications" />
      </StorefrontLayout>
    )
  }

  return (
    <StorefrontLayout>
      <PageHero title="Application details" backTo="/account/transactions" backLabel="Back to applications" />
      <SectionContainer className="py-10">
        <TransactionDetailContent detail={data} onRefresh={() => void refetch()} />
      </SectionContainer>
    </StorefrontLayout>
  )
}
