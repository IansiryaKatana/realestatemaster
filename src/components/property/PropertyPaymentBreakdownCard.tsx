import { useQuery } from '@tanstack/react-query'
import type { Product } from '@/data/static-cms'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useFormatPrice } from '@/lib/currency'
import { buildPropertyMoveInEstimate } from '@/lib/property/propertyMoveInEstimate'
import { isPropertyListing } from '@/lib/property/formatProperty'
import { cn } from '@/lib/utils'

type PropertyPaymentBreakdownCardProps = {
  product: Product
}

async function fetchAgencyServiceCharge() {
  const { data } = await tryGetSupabase()
    .from('agency_settings')
    .select('default_service_charges')
    .limit(1)
    .maybeSingle()
  return Number(data?.default_service_charges ?? 500)
}

export function PropertyPaymentBreakdownCard({ product }: PropertyPaymentBreakdownCardProps) {
  const formatPrice = useFormatPrice()
  const { data: serviceCharge = 500 } = useQuery({
    queryKey: ['agency-service-charge'],
    queryFn: fetchAgencyServiceCharge,
    staleTime: 300_000,
  })

  if (!isPropertyListing(product)) return null

  const estimate = buildPropertyMoveInEstimate(product, serviceCharge)
  if (!estimate) return null

  const isTotalLine = (label: string) =>
    label === 'Estimated move-in total' || label === 'Estimated upfront total'

  const detailLines = estimate.lines.filter((line) => !isTotalLine(line.label))
  const totalLine = estimate.lines.find((line) => isTotalLine(line.label))

  const renderLine = (line: (typeof estimate.lines)[number], isTotal = false) => (
    <>
      <dt className={cn('text-sm text-text-brown', isTotal && 'font-semibold text-white')}>
        {line.label}
        {line.note && line.label !== 'Payment plan' && !isTotal ? (
          <span className="mt-0.5 block text-xs font-normal text-muted">{line.note}</span>
        ) : null}
      </dt>
      <dd className={cn('text-sm font-semibold tabular-nums text-text-brown', isTotal && 'text-base text-white')}>
        {line.label === 'Payment plan' ? line.note : formatPrice(line.amount)}
      </dd>
    </>
  )

  return (
    <section className="overflow-hidden rounded-xl border border-[#e8e0d4] bg-white">
      <div className="px-5 pt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Payment breakdown</h3>
      </div>

      <div className="px-5 py-4">
        <dl>
          {detailLines.map((line, index) => (
            <div
              key={`${line.label}-${index}`}
              className={cn(
                'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2',
                index > 0 && 'border-t border-dotted border-border/35',
              )}
            >
              {renderLine(line)}
            </div>
          ))}
        </dl>
      </div>

      {totalLine ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 bg-cta-brown px-5 py-3 text-white">
          {renderLine(totalLine, true)}
        </div>
      ) : null}
    </section>
  )
}
