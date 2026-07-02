import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { createServiceRequest } from '@/lib/tenancy/tenancyRpc'
import { fetchServiceRequests, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/tenant/complaints')({
  component: TenantComplaintsPage,
})

function TenantComplaintsPage() {
  const { lease } = useTenantAuth()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)

  const { data: complaints = [] } = useQuery({
    queryKey: tenancyKeys.serviceRequests('complaint'),
    queryFn: () => fetchServiceRequests('complaint'),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lease?.id) return
    setSubmitting(true)
    try {
      await createServiceRequest(lease.id, 'complaint', category, 'normal', title, description)
      toast.success('Complaint filed')
      setTitle('')
      setDescription('')
      void queryClient.invalidateQueries({ queryKey: tenancyKeys.serviceRequests('complaint') })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to file complaint')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Complaints</h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-[#e8e0d4] bg-white p-5">
        <h2 className="font-semibold">File a complaint</h2>
        <Input placeholder="Subject" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select className="w-full rounded-md border border-input px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="general">General</option>
          <option value="noise">Noise</option>
          <option value="neighbour">Neighbour</option>
          <option value="building">Building management</option>
        </select>
        <textarea className="min-h-24 w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="Describe the issue" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit complaint'}</Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold">Your complaints</h2>
        {complaints.length === 0 ? (
          <p className="text-sm text-muted">No complaints filed yet.</p>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="mt-1 text-sm text-muted">{c.description}</p>
                </div>
                <PortalStatusBadge status={c.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
