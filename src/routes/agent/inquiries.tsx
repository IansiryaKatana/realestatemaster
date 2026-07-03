import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useAgentAuth } from '@/contexts/AgentAuthContext'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'

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
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <PortalDataTable
          columns={[
            { key: 'contact', label: 'Contact' },
            { key: 'property', label: 'Property' },
            { key: 'message', label: 'Message' },
            { key: 'status', label: 'Status' },
          ]}
          isEmpty={inquiries.length === 0}
          emptyMessage="No inquiries yet."
          minWidth="720px"
        >
          {inquiries.map((row) => {
            const property = row.products as { name?: string } | null
            return (
              <PortalTableRow key={row.id}>
                <PortalTableCell>
                  <p className="font-semibold text-text-brown">{row.full_name}</p>
                  <p className="text-sm text-muted">
                    {row.email}
                    {row.phone ? ` · ${row.phone}` : ''}
                  </p>
                </PortalTableCell>
                <PortalTableCell>{property?.name ?? '—'}</PortalTableCell>
                <PortalTableCell className="max-w-md text-sm">{row.message ?? '—'}</PortalTableCell>
                <PortalTableCell className="text-xs uppercase tracking-wide text-muted">{row.status}</PortalTableCell>
              </PortalTableRow>
            )
          })}
        </PortalDataTable>
      )}
    </div>
  )
}
