import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-800',
  paid: 'bg-emerald-50 text-emerald-800',
  completed: 'bg-emerald-50 text-emerald-800',
  pending: 'bg-amber-50 text-amber-900',
  due: 'bg-amber-50 text-amber-900',
  overdue: 'bg-red-50 text-red-800',
  pending_verification: 'bg-sky-50 text-sky-900',
  open: 'bg-sky-50 text-sky-900',
  in_progress: 'bg-violet-50 text-violet-900',
  resolved: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-neutral-100 text-neutral-600',
  ended: 'bg-neutral-100 text-neutral-600',
}

type PortalStatusBadgeProps = {
  status: string
  label?: string
  className?: string
}

export function PortalStatusBadge({ status, label, className }: PortalStatusBadgeProps) {
  const key = status.toLowerCase()
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        STATUS_STYLES[key] ?? 'bg-neutral-100 text-neutral-700',
        className,
      )}
    >
      {label ?? status.replaceAll('_', ' ')}
    </span>
  )
}
