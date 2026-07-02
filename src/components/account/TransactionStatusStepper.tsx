import { transactionStatusIndex, transactionStatusLabel, TRANSACTION_STATUS_STEPS } from '@/lib/property/transactionStatuses'
import { cn } from '@/lib/utils'

export function TransactionStatusStepper({ status }: { status: string }) {
  const current = transactionStatusIndex(status)
  const isTerminal = status === 'cancelled' || status === 'rejected'

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-text-brown">{transactionStatusLabel(status)}</p>
      {isTerminal ? (
        <p className="text-sm text-muted">This application is closed.</p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-2">
          {TRANSACTION_STATUS_STEPS.map((step, index) => {
            const done = index <= current
            const active = index === current
            return (
              <li
                key={step}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs',
                  done ? 'border-cta-brown/30 bg-[#f8f4ee] text-text-brown' : 'border-[#e8e0d4] text-muted',
                  active && 'ring-2 ring-cta-brown/20',
                )}
              >
                {transactionStatusLabel(step)}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
