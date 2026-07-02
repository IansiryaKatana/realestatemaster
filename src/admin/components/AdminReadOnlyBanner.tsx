import type { ReactNode } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

export function AdminReadOnlyBanner() {
  const { canEdit } = useAdminAuth()
  if (canEdit) return null
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      You have read-only access. Contact an administrator to make changes.
    </div>
  )
}

export function AdminEditGate({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { canEdit } = useAdminAuth()
  if (!canEdit) return <>{fallback}</>
  return <>{children}</>
}
