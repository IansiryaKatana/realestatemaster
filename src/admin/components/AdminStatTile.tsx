import type { LucideIcon } from 'lucide-react'
import { StatValue } from '@/components/ui/StatValue'

type AdminStatTileProps = {
  label: string
  value: string
  icon: LucideIcon
  /** Shown on hover when the value is truncated in the tile */
  title?: string
}

export function AdminStatTile({ label, value, icon: Icon, title }: AdminStatTileProps) {
  return (
    <div className="admin-stat-tile">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm text-[var(--admin-muted)]">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" aria-hidden />
      </div>
      <StatValue className="mt-2 text-[var(--admin-text)]" title={title ?? value}>
        {value}
      </StatValue>
    </div>
  )
}
