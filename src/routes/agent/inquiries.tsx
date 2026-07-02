import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useAgentAuth } from '@/contexts/AgentAuthContext'

export const Route = createFileRoute('/agent/inquiries')({
  component: AgentInquiriesPage,
})

function AgentInquiriesPage() {
  const { agent } = useAgentAuth()
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['agent-inquiries', agent?.id],
    enabled: Boolean(agent?.id),
    queryFn: async () => {
      const { data, error } = await tryGetSupabase()
        .from('property_inquiries')
        .select('*, products(name, slug)')
        .eq('assigned_agent_id', agent!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-extrabold text-text-brown">Inquiries</h1>
      {isLoading ? <p className="text-muted">Loading…</p> : (
        <div className="space-y-3">
          {inquiries.map((row) => {
            const property = row.products as { name?: string } | null
            return (
              <article key={row.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
                <p className="font-semibold text-text-brown">{row.full_name} · {property?.name}</p>
                <p className="text-sm text-muted">{row.email}{row.phone ? ` · ${row.phone}` : ''}</p>
                {row.message ? <p className="mt-2 text-sm">{row.message}</p> : null}
                <p className="mt-2 text-xs uppercase tracking-wide text-muted">{row.status}</p>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
