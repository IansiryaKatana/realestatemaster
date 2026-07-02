import type { ReactNode } from 'react'

type PortalEmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function PortalEmptyState({ title, description, action }: PortalEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[#e5e0d8] bg-white px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-[#2b2118]">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-[#7e766c]">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
