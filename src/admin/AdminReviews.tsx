import { useCallback, useEffect, useState } from 'react'
import { Check, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'
import { listAdminReviews, adminUpdateReviewStatus, adminDelete } from '@/admin/lib/adminRpc'
import type { Database } from '@/integrations/supabase/database.types'
import { AdminErrorBanner, AdminLoadingState } from '@/admin/components/AdminPageHeading'
import { AdminTabToolbar } from '@/admin/components/AdminTabToolbar'
import { AdminTablePagination } from '@/admin/components/AdminTablePagination'
import { useAdminTablePagination } from '@/admin/useAdminTablePagination'
import { adminShowInitialLoading } from '@/admin/adminListLoading'
import { adminBtnSecondary, adminInput, adminLabel } from '@/admin/adminClassNames'
import { AdminTableStopCell } from '@/admin/components/AdminClickableTableRow'
import { AdminRowActions, adminTableActionsCellClass, adminTableActionsHeadClass } from '@/admin/components/AdminRowActions'
import { BrandedSelect } from '@/components/ui/BrandedSelect'
import { cn } from '@/lib/utils'

type ReviewRow = Database['public']['Tables']['product_reviews']['Row'] & {
  product_name?: string
  user_email?: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function statusClass(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-amber-100 text-amber-800'
  }
}

export function AdminReviews() {
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const pagination = useAdminTablePagination(total)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listAdminReviews({
        limit: pagination.pageSize,
        offset: pagination.start,
        status: statusFilter || undefined,
      })
      setRows(result.items as ReviewRow[])
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [pagination.pageSize, pagination.start, statusFilter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function updateStatus(row: ReviewRow, status: 'approved' | 'rejected') {
    setBusyId(row.id)
    try {
      await adminUpdateReviewStatus(row.id, status)
      toast.success(status === 'approved' ? 'Review approved' : 'Review rejected')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review')
    } finally {
      setBusyId(null)
    }
  }

  async function remove(row: ReviewRow) {
    if (!window.confirm('Delete this review permanently?')) return
    try {
      await adminDelete('product_reviews', row.id)
      toast.success('Review deleted')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review')
    }
  }

  if (adminShowInitialLoading(loading, rows.length)) return <AdminLoadingState />

  return (
    <div>
      <AdminTabToolbar
        actions={
          <button type="button" className={adminBtnSecondary} onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      <AdminErrorBanner message={error} />

      <div className="admin-search-row mb-4">
        <div className="w-full max-w-xs">
          <label className={adminLabel}>Status</label>
          <BrandedSelect
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              pagination.setPage(1)
            }}
            options={STATUS_OPTIONS.filter((o) => o.value !== '').map((o) => ({ value: o.value, label: o.label }))}
            allowEmpty
            emptyLabel="All statuses"
          />
        </div>
      </div>

      <div className="admin-table-frame">
        <div className="admin-table-wrap">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Review</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className={adminTableActionsHeadClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.product_name ?? '—'}</td>
                  <td className="px-4 py-3">{row.rating}/5</td>
                  <td className="max-w-xs px-4 py-3">
                    {row.title ? <p className="font-medium">{row.title}</p> : null}
                    <p className="line-clamp-2 text-[var(--admin-muted)]">{row.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusClass(row.status))}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--admin-muted)]">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <AdminTableStopCell className={adminTableActionsCellClass}>
                    <AdminRowActions
                      label="Review actions"
                      actions={[
                        ...(row.status !== 'approved'
                          ? [{
                              label: 'Approve',
                              icon: <Check className="h-4 w-4" />,
                              onClick: () => void updateStatus(row, 'approved'),
                            }]
                          : []),
                        ...(row.status !== 'rejected'
                          ? [{
                              label: 'Reject',
                              icon: <X className="h-4 w-4" />,
                              onClick: () => void updateStatus(row, 'rejected'),
                            }]
                          : []),
                        {
                          label: busyId === row.id ? 'Working…' : 'Delete',
                          onClick: () => void remove(row),
                          variant: 'danger' as const,
                        },
                      ]}
                    />
                  </AdminTableStopCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[var(--admin-border)] p-4">
          <AdminTablePagination {...pagination} totalItems={total} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
        </div>
      </div>
    </div>
  )
}
