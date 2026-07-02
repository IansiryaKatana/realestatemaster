import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { useClientTransactions } from '@/lib/property/propertyTransactionQueries'
import { TransactionListTable } from '@/components/account/TransactionListTable'
import { PageHero } from '@/components/layout/PageHero'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/account/transactions/')({
  component: AccountTransactionsPage,
  head: () => ({ meta: [{ title: 'My Applications | GW Vacation Homes' }] }),
})

function AccountTransactionsPage() {
  const { user, loading: authLoading } = useStorefrontAuth()
  const { data: transactions = [], isLoading } = useClientTransactions(Boolean(user))

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
        <PageHero title="My Applications" subtitle="Sign in to view your property applications" />
        <SectionContainer className="py-10 text-center">
          <Button asChild><Link to="/account">Sign in</Link></Button>
        </SectionContainer>
      </StorefrontLayout>
    )
  }

  return (
    <StorefrontLayout>
      <PageHero title="My Applications" subtitle="Track viewings, contracts, and payments" backTo="/account" backLabel="Back to account" />
      <SectionContainer className="py-10">
        {isLoading ? <p className="text-muted">Loading applications…</p> : <TransactionListTable transactions={transactions} />}
      </SectionContainer>
    </StorefrontLayout>
  )
}
