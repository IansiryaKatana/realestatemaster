import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { createServiceRequest } from '@/lib/tenancy/tenancyRpc'
import { fetchServiceRequests, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/tenant/maintenance')({
  component: TenantMaintenancePage,
})

function TenantMaintenancePage() {
  const { lease } = useTenantAuth()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [submitting, setSubmitting] = useState(false)

  const { data: requests = [] } = useQuery({
    queryKey: tenancyKeys.serviceRequests('maintenance'),
    queryFn: () => fetchServiceRequests('maintenance'),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lease?.id) return
    setSubmitting(true)
    try {
      await createServiceRequest(lease.id, 'maintenance', 'repair', priority, title, description)
      toast.success('Maintenance request submitted')
      setTitle('')
      setDescription('')
      void queryClient.invalidateQueries({ queryKey: tenancyKeys.serviceRequests('maintenance') })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Maintenance</h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-[#e8e0d4] bg-white p-5">
        <h2 className="font-semibold">Request a repair</h2>
        <Input placeholder="Issue summary" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select
          className="w-full rounded-md border border-input px-3 py-2 text-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <textarea
          className="min-h-24 w-full rounded-md border border-input px-3 py-2 text-sm"
          placeholder="Describe the issue and preferred access time"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit request'}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold">Your requests</h2>
        <PortalDataTable
          columns={[
            { key: 'title', label: 'Issue' },
            { key: 'description', label: 'Details' },
            { key: 'status', label: 'Status' },
          ]}
          isEmpty={requests.length === 0}
          emptyMessage="No maintenance requests yet."
        >
          {requests.map((r) => (
            <PortalTableRow key={r.id}>
              <PortalTableCell className="font-medium">{r.title}</PortalTableCell>
              <PortalTableCell className="max-w-md text-muted">{r.description}</PortalTableCell>
              <PortalTableCell>
                <PortalStatusBadge status={r.status} />
              </PortalTableCell>
            </PortalTableRow>
          ))}
        </PortalDataTable>
      </div>
    </div>
  )
}
