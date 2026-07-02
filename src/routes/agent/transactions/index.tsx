import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { transactionStatusLabel } from '@/lib/property/transactionStatuses'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/agent/transactions/')({
  component: AgentTransactionsPage,
})

function AgentTransactionsPage() {
  const { agent } = useAgentAuth()
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['agent-transactions', agent?.id],
    enabled: Boolean(agent?.id),
    queryFn: async () => {
      const { data, error } = await tryGetSupabase()
        .from('property_transactions')
        .select('*, products(name, slug)')
        .eq('assigned_agent_id', agent!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold text-text-brown">Transactions</h1>
      {isLoading ? <p className="text-muted">Loading…</p> : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const property = tx.products as { name?: string } | null
            return (
              <article key={tx.id} className="flex flex-col gap-3 rounded-xl border border-[#e8e0d4] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-text-brown">{property?.name}</p>
                  <p className="text-sm text-muted">{tx.transaction_number} · {transactionStatusLabel(tx.status)}</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/agent/transactions/$transactionId" params={{ transactionId: tx.id }}>Manage</Link>
                </Button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
