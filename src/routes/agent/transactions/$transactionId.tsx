import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { tryGetSupabase } from '@/integrations/supabase/client'
import {
  rpcAgentApproveTransaction,
  rpcAgentGenerateContract,
  rpcAgentReviewContract,
  rpcBuildPaymentBreakdown,
  rpcCompleteHandover,
  rpcCreatePropertyInvoice,
  rpcScheduleHandover,
} from '@/lib/property/propertyWorkflow'
import { transactionStatusLabel } from '@/lib/property/transactionStatuses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/agent/transactions/$transactionId')({
  component: AgentTransactionDetailPage,
})

function AgentTransactionDetailPage() {
  const { transactionId } = Route.useParams()
  const queryClient = useQueryClient()
  const [handoverForm, setHandoverForm] = useState({
    handoverDate: '',
    handoverTime: '',
    meetingLocation: '',
    agentNotes: '',
    requiredDocuments: '',
    keyCollectionDetails: '',
    possessionInstructions: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['agent-transaction', transactionId],
    queryFn: async () => {
      const supabase = tryGetSupabase()
      const [txRes, uploadsRes, generatedRes, invoicesRes, handoverRes] = await Promise.all([
        supabase.from('property_transactions').select('*, products(name, price, listing_type)').eq('id', transactionId).single(),
        supabase.from('uploaded_contracts').select('*').eq('transaction_id', transactionId),
        supabase.from('generated_contracts').select('*').eq('transaction_id', transactionId),
        supabase.from('invoices').select('*').eq('transaction_id', transactionId).order('issued_at', { ascending: false }),
        supabase.from('handover_records').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: false }),
      ])
      if (txRes.error) throw txRes.error
      return {
        tx: txRes.data,
        uploads: uploadsRes.data ?? [],
        generated: generatedRes.data ?? [],
        invoices: invoicesRes.data ?? [],
        handovers: handoverRes.data ?? [],
      }
    },
  })

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['agent-transaction', transactionId] })
  }

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin text-muted" />
  if (!data?.tx) return <p>Transaction not found</p>

  const property = data.tx.products as { name?: string; price?: number; listing_type?: string } | null
  const canScheduleHandover = ['payment_received', 'handover_scheduled'].includes(data.tx.status)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-text-brown">{property?.name}</h1>
        <p className="text-sm text-muted">{data.tx.transaction_number} · {transactionStatusLabel(data.tx.status)}</p>
      </div>

      {data.tx.status === 'client_proceeding' ? (
        <section className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Client approval</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={async () => {
              const result = await rpcAgentApproveTransaction({ transactionId, decision: 'approved' })
              if (!result.ok) toast.error(result.error)
              else { toast.success('Approved'); void refresh() }
            }}>Approve</Button>
            <Button variant="outline" onClick={async () => {
              const result = await rpcAgentApproveTransaction({ transactionId, decision: 'need_more_info' })
              if (!result.ok) toast.error(result.error)
              else { toast.success('Updated'); void refresh() }
            }}>Need more info</Button>
            <Button variant="secondary" onClick={async () => {
              const result = await rpcAgentApproveTransaction({ transactionId, decision: 'rejected' })
              if (!result.ok) toast.error(result.error)
              else { toast.success('Rejected'); void refresh() }
            }}>Reject</Button>
          </div>
        </section>
      ) : null}

      {['contract_requested', 'agent_approved'].includes(data.tx.status) ? (
        <section className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Generate contract</h2>
          <Button className="mt-3" onClick={async () => {
            const result = await rpcAgentGenerateContract({
              transactionId,
              contractData: { property_name: property?.name, price: property?.price },
            })
            if (!result.ok) toast.error(result.error)
            else { toast.success('Contract generated'); void refresh() }
          }}>Generate contract record</Button>
        </section>
      ) : null}

      {data.uploads.map((upload) => (
        <section key={upload.id} className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Review uploaded contract</h2>
          <p className="text-sm text-muted">{upload.file_name}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={async () => {
              const result = await rpcAgentReviewContract({ uploadId: upload.id, decision: 'approved' })
              if (!result.ok) toast.error(result.error)
              else { toast.success('Contract approved'); void refresh() }
            }}>Approve</Button>
            <Button variant="outline" onClick={async () => {
              const result = await rpcAgentReviewContract({ uploadId: upload.id, decision: 'reupload_requested' })
              if (!result.ok) toast.error(result.error)
              else { toast.success('Re-upload requested'); void refresh() }
            }}>Request re-upload</Button>
          </div>
        </section>
      ))}

      {data.tx.status === 'contract_approved' || data.tx.status === 'payment_pending' ? (
        <section className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Payment breakdown</h2>
          <Button className="mt-3" onClick={async () => {
            const result = await rpcBuildPaymentBreakdown(transactionId)
            if (!result.ok) toast.error(result.error)
            else { toast.success('Breakdown created'); void refresh() }
          }}>Build payment breakdown</Button>
        </section>
      ) : null}

      {data.tx.status === 'payment_pending' && data.invoices.length === 0 ? (
        <section className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Invoice</h2>
          <Button className="mt-3" onClick={async () => {
            const result = await rpcCreatePropertyInvoice(transactionId)
            if (!result.ok) toast.error(result.error)
            else { toast.success('Invoice created'); void refresh() }
          }}>Create invoice</Button>
        </section>
      ) : null}

      {data.invoices.length > 0 ? (
        <section className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Invoices</h2>
          {data.invoices.map((invoice) => (
            <p key={invoice.id} className="mt-2 text-sm text-muted">
              {invoice.invoice_number} · {invoice.payment_status} · AED {Number(invoice.total_amount).toLocaleString()}
            </p>
          ))}
        </section>
      ) : null}

      {canScheduleHandover ? (
        <section className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Schedule handover</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input type="date" value={handoverForm.handoverDate} onChange={(e) => setHandoverForm((f) => ({ ...f, handoverDate: e.target.value }))} />
            <Input type="time" value={handoverForm.handoverTime} onChange={(e) => setHandoverForm((f) => ({ ...f, handoverTime: e.target.value }))} />
            <Input className="sm:col-span-2" placeholder="Meeting location" value={handoverForm.meetingLocation} onChange={(e) => setHandoverForm((f) => ({ ...f, meetingLocation: e.target.value }))} />
            <Textarea className="sm:col-span-2" placeholder="Key collection details" value={handoverForm.keyCollectionDetails} onChange={(e) => setHandoverForm((f) => ({ ...f, keyCollectionDetails: e.target.value }))} />
            <Textarea className="sm:col-span-2" placeholder="Possession instructions" value={handoverForm.possessionInstructions} onChange={(e) => setHandoverForm((f) => ({ ...f, possessionInstructions: e.target.value }))} />
            <Textarea className="sm:col-span-2" placeholder="Required documents" value={handoverForm.requiredDocuments} onChange={(e) => setHandoverForm((f) => ({ ...f, requiredDocuments: e.target.value }))} />
            <Textarea className="sm:col-span-2" placeholder="Agent notes" value={handoverForm.agentNotes} onChange={(e) => setHandoverForm((f) => ({ ...f, agentNotes: e.target.value }))} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={async () => {
              if (!handoverForm.handoverDate) {
                toast.error('Handover date is required')
                return
              }
              const result = await rpcScheduleHandover({
                transactionId,
                handoverDate: handoverForm.handoverDate,
                handoverTime: handoverForm.handoverTime || undefined,
                meetingLocation: handoverForm.meetingLocation || undefined,
                agentNotes: handoverForm.agentNotes || undefined,
                requiredDocuments: handoverForm.requiredDocuments || undefined,
                keyCollectionDetails: handoverForm.keyCollectionDetails || undefined,
                possessionInstructions: handoverForm.possessionInstructions || undefined,
              })
              if (!result.ok) toast.error(result.error)
              else { toast.success('Handover scheduled'); void refresh() }
            }}>Schedule handover</Button>
            {data.tx.status === 'handover_scheduled' ? (
              <Button variant="outline" onClick={async () => {
                const result = await rpcCompleteHandover(transactionId)
                if (!result.ok) toast.error(result.error)
                else { toast.success('Handover completed'); void refresh() }
              }}>Mark complete</Button>
            ) : null}
          </div>
        </section>
      ) : null}

      {data.handovers.length > 0 ? (
        <section className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Handover records</h2>
          {data.handovers.map((handover) => (
            <div key={handover.id} className="mt-3 text-sm text-muted">
              <p className="font-semibold capitalize text-text-brown">{handover.status}</p>
              {handover.handover_date ? <p>{handover.handover_date} {handover.handover_time ?? ''}</p> : null}
              {handover.meeting_location ? <p>{handover.meeting_location}</p> : null}
            </div>
          ))}
        </section>
      ) : null}

      {data.generated.length > 0 ? (
        <section className="rounded-xl border border-[#e8e0d4] bg-white p-4">
          <h2 className="font-semibold">Generated contracts</h2>
          <Input className="mt-2" placeholder="Contract PDF URL (optional)" onBlur={async (e) => {
            if (!e.target.value.trim()) return
            const result = await rpcAgentGenerateContract({
              transactionId,
              fileUrl: e.target.value.trim(),
              fileName: 'contract.pdf',
            })
            if (!result.ok) toast.error(result.error)
            else { toast.success('Contract URL saved'); void refresh() }
          }} />
        </section>
      ) : null}
    </div>
  )
}
