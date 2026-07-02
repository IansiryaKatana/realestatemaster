import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { fetchAgentLeases } from '@/lib/tenancy/tenancyQueries'

export const Route = createFileRoute('/agent/')({
  component: AgentDashboardPage,
})

function AgentDashboardPage() {
  const { agent } = useAgentAuth()
  const { data } = useQuery({
    queryKey: ['agent-dashboard', agent?.id],
    enabled: Boolean(agent?.id),
    queryFn: async () => {
      const supabase = tryGetSupabase()
      const [inquiries, viewings, transactions, leases] = await Promise.all([
        supabase.from('property_inquiries').select('id', { count: 'exact', head: true }).eq('assigned_agent_id', agent!.id),
        supabase.from('viewing_requests').select('id', { count: 'exact', head: true }).eq('assigned_agent_id', agent!.id).eq('status', 'pending'),
        supabase.from('property_transactions').select('id', { count: 'exact', head: true }).eq('assigned_agent_id', agent!.id),
        fetchAgentLeases(agent!.id).catch(() => []),
      ])
      const overdue = await supabase
        .from('rent_installments')
        .select('id', { count: 'exact', head: true })
        .in('status', ['due', 'overdue'])
        .lt('due_date', new Date().toISOString().slice(0, 10))
      return {
        inquiries: inquiries.count ?? 0,
        pendingViewings: viewings.count ?? 0,
        transactions: transactions.count ?? 0,
        activeTenancies: leases.length,
        overdueRent: overdue.count ?? 0,
      }
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-text-brown">Welcome, {agent?.name}</h1>
        <p className="mt-1 text-sm text-muted">Manage assigned properties, inquiries, and applications.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Link to="/agent/inquiries" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="text-3xl font-extrabold text-text-brown">{data?.inquiries ?? 0}</p>
          <p className="text-sm text-muted">Inquiries</p>
        </Link>
        <Link to="/agent/viewings" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="text-3xl font-extrabold text-text-brown">{data?.pendingViewings ?? 0}</p>
          <p className="text-sm text-muted">Pending viewings</p>
        </Link>
        <Link to="/agent/transactions" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="text-3xl font-extrabold text-text-brown">{data?.transactions ?? 0}</p>
          <p className="text-sm text-muted">Transactions</p>
        </Link>
        <Link to="/agent/tenants" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="text-3xl font-extrabold text-text-brown">{data?.activeTenancies ?? 0}</p>
          <p className="text-sm text-muted">Active tenancies</p>
        </Link>
        <Link to="/agent/maintenance" className="rounded-xl border border-[#e8e0d4] bg-white p-5 hover:border-cta-brown/40">
          <p className="text-3xl font-extrabold text-text-brown">{data?.overdueRent ?? 0}</p>
          <p className="text-sm text-muted">Overdue rent items</p>
        </Link>
      </div>
    </div>
  )
}
