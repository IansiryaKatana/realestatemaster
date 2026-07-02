import type { ReactNode } from 'react'
import { StatValue } from '@/components/ui/StatValue'
import { cn } from '@/lib/utils'

type PortalStatCardProps = {
  label: string
  value: ReactNode
  hint?: string
  className?: string
}

export function PortalStatCard({ label, value, hint, className }: PortalStatCardProps) {
  const valueTitle = typeof value === 'string' || typeof value === 'number' ? String(value) : undefined

  return (
    <div className={cn('min-w-0 overflow-hidden rounded-xl border border-[#e5e0d8] bg-white p-4 shadow-sm', className)}>
      <p className="truncate text-xs font-medium uppercase tracking-wide text-[#7e766c]">{label}</p>
      {typeof value === 'string' || typeof value === 'number' ? (
        <StatValue className="mt-1 text-[#2b2118]" title={valueTitle}>
          {value}
        </StatValue>
      ) : (
        <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-semibold tabular-nums leading-tight text-[length:clamp(0.875rem,1.4vw,1.375rem)] text-[#2b2118]">
          {value}
        </div>
      )}
      {hint ? <p className="mt-1 truncate text-xs text-[#7e766c]" title={hint}>{hint}</p> : null}
    </div>
  )
}
