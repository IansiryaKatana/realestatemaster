import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const portalTableHideBelowMd = 'hidden md:table-cell'

export type PortalTableColumn = {
  key: string
  label: string
  className?: string
  /** Hide this column below the `md` breakpoint (show in mobile accordion instead). */
  hideBelowMd?: boolean
}

type PortalDataTableProps = {
  columns: PortalTableColumn[]
  emptyMessage?: string
  isEmpty: boolean
  children: ReactNode
  minWidth?: string
  /** Drop fixed min-width on mobile so accordion tables fit without horizontal scroll. */
  responsive?: boolean
}

export function PortalDataTable({
  columns,
  emptyMessage = 'No records yet.',
  isEmpty,
  children,
  minWidth = '640px',
  responsive = false,
}: PortalDataTableProps) {
  const desktopMinWidthClass = !responsive ? 'md:min-w-[640px]' : undefined

  return (
    <div className="overflow-x-auto rounded-xl border border-[#e8e0d4] max-md:overflow-x-visible">
      <table
        className={cn(
          'w-full min-w-0 text-left text-sm',
          desktopMinWidthClass,
        )}
      >
        <thead className="bg-[#f8f4ee] text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 font-medium',
                  col.hideBelowMd && portalTableHideBelowMd,
                  col.className,
                )}
              >
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

type PortalAccordionTableRowProps = {
  title: ReactNode
  detail: ReactNode
  trailing: ReactNode
  className?: string
  titleClassName?: string
  detailClassName?: string
  trailingClassName?: string
  onRowClick?: () => void
}

/** Two visible columns on mobile (title + trailing); detail expands on row tap. */
export function PortalAccordionTableRow({
  title,
  detail,
  trailing,
  className,
  titleClassName,
  detailClassName,
  trailingClassName,
  onRowClick,
}: PortalAccordionTableRowProps) {
  const [expanded, setExpanded] = useState(false)

  function handleClick() {
    onRowClick?.()
    if (window.matchMedia('(max-width: 767px)').matches) {
      setExpanded((open) => !open)
    }
  }

  return (
    <>
      <tr
        className={cn(
          'border-t border-[#efe7db] cursor-pointer transition-colors hover:bg-[#faf8f4]',
          className,
        )}
        onClick={handleClick}
        aria-expanded={expanded}
      >
        <PortalTableCell className={cn('font-medium', titleClassName)}>
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0">{title}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted transition-transform md:hidden',
                expanded && 'rotate-180',
              )}
              aria-hidden
            />
          </div>
        </PortalTableCell>
        <PortalTableCell className={cn('max-w-md text-muted', portalTableHideBelowMd, detailClassName)}>
          {detail}
        </PortalTableCell>
        <PortalTableCell className={cn('whitespace-nowrap text-muted', trailingClassName)}>
          {trailing}
        </PortalTableCell>
      </tr>
      {expanded ? (
        <tr className={cn('border-t border-[#efe7db] bg-[#faf8f4] md:hidden', className)}>
          <PortalTableCell colSpan={2} className="pt-0 text-sm text-muted">
            {detail}
          </PortalTableCell>
        </tr>
      ) : null}
    </>
  )
}
