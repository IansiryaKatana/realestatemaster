import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StatValueProps = {
  children: ReactNode
  className?: string
  title?: string
}

/** Overflow-safe stat number — use for currency and large counts in cards/tiles */
export function StatValue({ children, className, title }: StatValueProps) {
  const text = typeof children === 'string' || typeof children === 'number' ? String(children) : undefined

  return (
    <p
      className={cn(
        'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-semibold tabular-nums leading-tight',
        'text-[length:clamp(0.875rem,1.4vw,1.375rem)]',
        className,
      )}
      title={title ?? text}
    >
      {children}
    </p>
  )
}
