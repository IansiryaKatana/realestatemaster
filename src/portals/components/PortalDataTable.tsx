import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type PortalTableColumn = {
  key: string
  label: string
  className?: string
}

type PortalDataTableProps = {
  columns: PortalTableColumn[]
  emptyMessage?: string
  isEmpty: boolean
  children: ReactNode
  minWidth?: string
}

export function PortalDataTable({
  columns,
  emptyMessage = 'No records yet.',
  isEmpty,
  children,
  minWidth = '640px',
}: PortalDataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#e8e0d4]">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="bg-[#f8f4ee] text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 font-medium', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}

type PortalTableRowProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function PortalTableRow({ children, className, onClick }: PortalTableRowProps) {
  return (
    <tr
      className={cn(
        'border-t border-[#efe7db]',
        onClick && 'cursor-pointer transition-colors hover:bg-[#faf8f4]',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

type PortalTableCellProps = {
  children: ReactNode
  className?: string
  colSpan?: number
}

export function PortalTableCell({ children, className, colSpan }: PortalTableCellProps) {
  return (
    <td className={cn('px-4 py-3 align-middle', className)} colSpan={colSpan}>
      {children}
    </td>
  )
}
