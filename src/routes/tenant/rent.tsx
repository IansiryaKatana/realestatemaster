import { createFileRoute } from '@tanstack/react-router'
import { Fragment, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { fetchTenantInstallments, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { submitRentPaymentProof } from '@/lib/tenancy/tenancyRpc'
import { PortalStatusBadge } from '@/portals/components/PortalStatusBadge'
import { FileUploadField } from '@/portals/components/FileUploadField'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
import { useFormatPrice } from '@/lib/currency'
import { formatOrdinalShortDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
    if (!proofUrl) {
      toast.error('Please upload payment proof')
      return
    }
    setSubmitting(true)
    try {
      await submitRentPaymentProof(installmentId, amount, 'bank_transfer', proofUrl)
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
        <PortalDataTable
          columns={[
            { key: 'amount', label: 'Amount' },
            { key: 'due', label: 'Due date' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', className: 'text-right' },
          ]}
          isEmpty={installments.length === 0}
          emptyMessage="No installments on your schedule yet."
        >
          {installments.map((inst) => {
            const canUpload = ['due', 'overdue', 'scheduled'].includes(inst.status)
            const isExpanded = selectedId === inst.id

            return (
              <Fragment key={inst.id}>
                <PortalTableRow>
                  <PortalTableCell className="font-semibold">{formatPrice(Number(inst.amount))}</PortalTableCell>
                  <PortalTableCell>{formatOrdinalShortDate(inst.due_date)}</PortalTableCell>
                  <PortalTableCell className="capitalize">{inst.installment_type}</PortalTableCell>
                  <PortalTableCell>
                    <PortalStatusBadge status={inst.status} />
                  </PortalTableCell>
                  <PortalTableCell className="text-right">
                    {canUpload && !isExpanded ? (
                      <Button size="sm" variant="outline" onClick={() => setSelectedId(inst.id)}>
                        Upload proof
                      </Button>
                    ) : null}
                  </PortalTableCell>
                </PortalTableRow>
                {isExpanded ? (
                  <PortalTableRow>
                    <PortalTableCell colSpan={5}>
                      <div className="space-y-3 rounded-lg border border-[#e8e0d4] bg-[#faf8f4] p-4">
                        <FileUploadField
                          label="Payment proof"
                          value={proofUrl}
                          onChange={setProofUrl}
                          folder={`rent-proofs/${lease?.id ?? 'unknown'}`}
                          required
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={submitting || !proofUrl}
                            onClick={() => void handleSubmitProof(inst.id, Number(inst.amount))}
                          >
                            Submit proof
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedId(null)
                              setProofUrl('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </PortalTableCell>
                  </PortalTableRow>
                ) : null}
              </Fragment>
            )
          })}
        </PortalDataTable>
      )}
    </div>
  )
}
