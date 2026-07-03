import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { transactionStatusLabel } from '@/lib/property/transactionStatuses'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
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
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <PortalDataTable
          columns={[
            { key: 'property', label: 'Property' },
            { key: 'reference', label: 'Reference' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', className: 'text-right' },
          ]}
          isEmpty={transactions.length === 0}
          emptyMessage="No transactions assigned to you."
        >
          {transactions.map((tx) => {
            const property = tx.products as { name?: string } | null
            return (
              <PortalTableRow key={tx.id}>
                <PortalTableCell className="font-semibold text-text-brown">{property?.name ?? '—'}</PortalTableCell>
                <PortalTableCell className="text-muted">{tx.transaction_number}</PortalTableCell>
                <PortalTableCell>{transactionStatusLabel(tx.status)}</PortalTableCell>
                <PortalTableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/agent/transactions/$transactionId" params={{ transactionId: tx.id }}>
                      Manage
                    </Link>
                  </Button>
                </PortalTableCell>
              </PortalTableRow>
            )
          })}
        </PortalDataTable>
      )}
    </div>
  )
}
