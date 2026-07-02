import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { fetchTenantInstallments, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { submitRentPaymentProof } from '@/lib/tenancy/tenancyRpc'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { useFormatPrice } from '@/lib/currency'
import { formatOrdinalShortDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/tenant/rent')({
  component: TenantRentPage,
})

function TenantRentPage() {
  const formatPrice = useFormatPrice()
  const { lease } = useTenantAuth()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: installments = [], isLoading } = useQuery({
    queryKey: lease?.id ? tenancyKeys.installments(lease.id) : ['skip'],
    queryFn: () => fetchTenantInstallments(lease!.id),
    enabled: Boolean(lease?.id),
  })

  async function handleSubmitProof(installmentId: string, amount: number) {
    setSubmitting(true)
    try {
      await submitRentPaymentProof(installmentId, amount, 'bank_transfer', proofUrl || undefined)
      toast.success('Payment proof submitted for verification')
      setSelectedId(null)
      setProofUrl('')
      void queryClient.invalidateQueries({ queryKey: tenancyKeys.all })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Rent & payments</h1>
      {isLoading ? (
        <p className="text-muted">Loading schedule…</p>
      ) : (
        <div className="space-y-3">
          {installments.map((inst) => (
            <div key={inst.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{formatPrice(Number(inst.amount))}</p>
                  <p className="text-sm text-muted">Due {formatOrdinalShortDate(inst.due_date)} · {inst.installment_type}</p>
                </div>
                <PortalStatusBadge status={inst.status} />
              </div>
              {['due', 'overdue', 'scheduled'].includes(inst.status) ? (
                <div className="mt-4 border-t border-[#e8e0d4] pt-4">
                  {selectedId === inst.id ? (
                    <div className="space-y-2">
                      <Input placeholder="Proof URL (receipt or transfer screenshot)" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} />
                      <div className="flex gap-2">
                        <Button size="sm" disabled={submitting} onClick={() => void handleSubmitProof(inst.id, Number(inst.amount))}>
                          Submit proof
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setSelectedId(inst.id)}>Upload payment proof</Button>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
