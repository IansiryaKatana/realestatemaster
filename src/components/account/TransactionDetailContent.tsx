import { useState } from 'react'
import { toast } from 'sonner'
import type { PropertyTransactionDetail } from '@/lib/property/propertyTransactionQueries'
import { rpcClientRequestContract, rpcCreatePropertyInvoice, rpcRecordPropertyPayment, rpcSubmitClientDeclaration, startPropertyStripeCheckout } from '@/lib/property/propertyWorkflow'
import { TransactionStatusStepper } from '@/components/account/TransactionStatusStepper'
import { useFormatPrice } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { useCms } from '@/contexts/CmsContext'

type TransactionDetailContentProps = {
  detail: PropertyTransactionDetail
  onRefresh: () => void
}

export function TransactionDetailContent({ detail, onRefresh }: TransactionDetailContentProps) {
  const formatPrice = useFormatPrice()
  const { user } = useStorefrontAuth()
  const { snapshot } = useCms()
  const stripeEnabled = snapshot.siteSettings.stripe_enabled === 'true'
  const checkoutMode = snapshot.siteSettings.checkout_mode === 'stripe' ? 'stripe' : 'quote'
  const useStripe = stripeEnabled && checkoutMode === 'stripe'
  const [declarationNotes, setDeclarationNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const latestViewing = detail.viewings[0]
  const canDeclare = detail.status === 'viewing_completed'
  const canRequestContract = detail.status === 'agent_approved'
  const canUploadContract = ['contract_generated', 'contract_sent'].includes(detail.status)
  const breakdownTotal = detail.payment_breakdowns.reduce((sum, row) => sum + Number(row.amount), 0)

  async function submitDeclaration(decision: 'proceed' | 'not_proceed' | 'need_more_info') {
    setBusy(true)
    const result = await rpcSubmitClientDeclaration({
      transactionId: detail.id,
      viewingRequestId: latestViewing?.id,
      decision,
      notes: declarationNotes,
    })
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Declaration submitted')
    onRefresh()
  }

  async function requestContract() {
    setBusy(true)
    const result = await rpcClientRequestContract(detail.id)
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Contract requested')
    onRefresh()
  }

  async function uploadSignedContract(file: File) {
    const supabase = tryGetSupabase()
    if (!supabase || !user) return

    setUploading(true)
    const path = `${detail.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('contracts').upload(path, file)
    if (uploadError) {
      setUploading(false)
      toast.error(uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(path)
    const { error: insertError } = await supabase.from('uploaded_contracts').insert({
      transaction_id: detail.id,
      client_user_id: user.id,
      generated_contract_id: detail.generated_contracts[0]?.id ?? null,
      file_url: urlData.publicUrl,
      file_name: file.name,
      review_status: 'under_review',
    })

    setUploading(false)
    if (insertError) {
      toast.error(insertError.message)
      return
    }

    toast.success('Signed contract uploaded')
    onRefresh()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-text-brown">{detail.property.name}</h2>
          <p className="mt-1 text-sm text-muted">
            {detail.transaction_number} · {detail.listing_type} · {formatPrice(Number(detail.property.price))}
          </p>
        </div>
      </div>

      <TransactionStatusStepper status={detail.status} />

      {latestViewing ? (
        <section className="rounded-xl border border-[#e8e0d4] p-4">
          <h3 className="font-semibold text-text-brown">Viewing</h3>
          <p className="mt-1 text-sm text-muted capitalize">Status: {latestViewing.status.replaceAll('_', ' ')}</p>
          {latestViewing.scheduled_date ? (
            <p className="text-sm text-muted">Scheduled: {latestViewing.scheduled_date} {latestViewing.scheduled_time ?? ''}</p>
          ) : null}
        </section>
      ) : null}

      {canDeclare ? (
        <section className="rounded-xl border border-[#e8e0d4] p-4">
          <h3 className="font-semibold text-text-brown">After your viewing</h3>
          <p className="mt-1 text-sm text-muted">Let us know if you would like to proceed with this property.</p>
          <Input
            className="mt-3"
            placeholder="Optional notes"
            value={declarationNotes}
            onChange={(e) => setDeclarationNotes(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void submitDeclaration('proceed')}>Proceed</Button>
            <Button variant="outline" disabled={busy} onClick={() => void submitDeclaration('need_more_info')}>Need more info</Button>
            <Button variant="secondary" disabled={busy} onClick={() => void submitDeclaration('not_proceed')}>Not proceeding</Button>
          </div>
        </section>
      ) : null}

      {canRequestContract ? (
        <section className="rounded-xl border border-[#e8e0d4] p-4">
          <h3 className="font-semibold text-text-brown">Request contract</h3>
          <p className="mt-1 text-sm text-muted">Your application was approved. Request a contract from your agent.</p>
          <Button className="mt-3" disabled={busy} onClick={() => void requestContract()}>Request contract</Button>
        </section>
      ) : null}

      {detail.generated_contracts.length > 0 ? (
        <section className="rounded-xl border border-[#e8e0d4] p-4">
          <h3 className="font-semibold text-text-brown">Generated contract</h3>
          {detail.generated_contracts.map((contract) => (
            <div key={contract.id} className="mt-2 text-sm">
              {contract.file_url ? (
                <a href={contract.file_url} target="_blank" rel="noreferrer" className="font-semibold text-cta-brown underline">
                  Download contract
                </a>
              ) : (
                <p className="text-muted">Contract prepared — your agent will share the document shortly.</p>
              )}
            </div>
          ))}
        </section>
      ) : null}

      {canUploadContract ? (
        <section className="rounded-xl border border-[#e8e0d4] p-4">
          <h3 className="font-semibold text-text-brown">Upload signed contract</h3>
          <input
            type="file"
            accept="application/pdf,image/*"
            className="mt-3 block w-full text-sm"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void uploadSignedContract(file)
            }}
          />
        </section>
      ) : null}

      {detail.payment_breakdowns.length > 0 ? (
        <section className="rounded-xl border border-[#e8e0d4] p-4">
          <h3 className="font-semibold text-text-brown">Payment breakdown</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {detail.payment_breakdowns.map((row) => (
              <li key={row.id} className="flex justify-between gap-4">
                <span>{row.label}</span>
                <span className="font-semibold">{formatPrice(Number(row.amount))}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-[#efe7db] pt-3 text-sm font-bold">
            Total: {formatPrice(breakdownTotal)}
          </p>
          {detail.status === 'payment_pending' && detail.invoices.length === 0 ? (
            <Button
              className="mt-4"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                const result = await rpcCreatePropertyInvoice(detail.id)
                setBusy(false)
                if (!result.ok) toast.error(result.error)
                else { toast.success('Invoice generated'); onRefresh() }
              }}
            >
              Generate invoice
            </Button>
          ) : null}
        </section>
      ) : null}

      {detail.invoices.length > 0 ? (
        <section className="rounded-xl border border-[#e8e0d4] p-4">
          <h3 className="font-semibold text-text-brown">Invoices</h3>
          {detail.invoices.map((invoice) => (
            <div key={invoice.id} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{invoice.invoice_number}</p>
                <p className="text-sm text-muted capitalize">{invoice.payment_status} · {formatPrice(Number(invoice.total_amount))}</p>
              </div>
              {invoice.payment_status === 'pending' ? (
                useStripe ? (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      const result = await startPropertyStripeCheckout(detail.id, invoice.id)
                      setBusy(false)
                      if (!result.ok) {
                        toast.error(result.error)
                        return
                      }
                      window.location.href = result.url
                    }}
                  >
                    Pay with Stripe
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      const result = await rpcRecordPropertyPayment(detail.id, invoice.id)
                      setBusy(false)
                      if (!result.ok) toast.error(result.error)
                      else { toast.success('Payment recorded'); onRefresh() }
                    }}
                  >
                    Confirm payment
                  </Button>
                )
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {detail.handover_records.length > 0 ? (
        <section className="rounded-xl border border-[#e8e0d4] p-4">
          <h3 className="font-semibold text-text-brown">Handover</h3>
          {detail.handover_records.map((handover) => (
            <div key={handover.id} className="mt-3 space-y-1 text-sm text-muted">
              <p className="capitalize font-semibold text-text-brown">Status: {handover.status}</p>
              {handover.handover_date ? <p>Date: {handover.handover_date} {handover.handover_time ?? ''}</p> : null}
              {handover.meeting_location ? <p>Location: {handover.meeting_location}</p> : null}
              {handover.key_collection_details ? <p>Keys: {handover.key_collection_details}</p> : null}
              {handover.possession_instructions ? <p>{handover.possession_instructions}</p> : null}
              {handover.required_documents ? <p>Documents: {handover.required_documents}</p> : null}
              {handover.agent_notes ? <p>Agent notes: {handover.agent_notes}</p> : null}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}
