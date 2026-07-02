import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { tryGetSupabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/database.types'
import { AdminBulkToolbar } from '@/admin/components/AdminBulkToolbar'
import { AdminLoadingState } from '@/admin/components/AdminPageHeading'
import { AdminTablePagination } from '@/admin/components/AdminTablePagination'
import { EntityDetailSheet } from '@/admin/components/EntityDetailSheet'
import { useAdminTablePagination } from '@/admin/useAdminTablePagination'
import { useBulkSelection } from '@/admin/hooks/useBulkSelection'
import { AdminClickableTableRow, AdminTableStopCell } from '@/admin/components/AdminClickableTableRow'
import { AdminRowActions, adminTableActionsCellClass, adminTableActionsHeadClass, crudRowActions } from '@/admin/components/AdminRowActions'
import { adminBadge, adminBtnSecondary } from '@/admin/adminClassNames'
import {
  parseSubmissionPayload,
  submissionContact,
  submissionDetailFields,
  submissionStatusLabel,
  submissionSummary,
  submissionTypeLabel,
} from '@/admin/lib/formSubmissionPresentation'
import { cn } from '@/lib/utils'

type SubmissionRow = Database['public']['Tables']['form_submissions']['Row']

function statusBadgeClass(status: string) {
  switch (status) {
    case 'new':
      return 'bg-amber-100 text-amber-900'
    case 'in_progress':
      return 'bg-sky-100 text-sky-900'
    case 'resolved':
      return 'bg-emerald-100 text-emerald-900'
    default:
      return 'bg-[var(--admin-primary-muted)] text-[var(--admin-primary)]'
  }
}

export function AdminFormSubmissions() {
  const [rows, setRows] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [detail, setDetail] = useState<SubmissionRow | null>(null)

  const pagination = useAdminTablePagination(rows.length)
  const pageRows = rows.slice(pagination.start, pagination.end)
  const bulk = useBulkSelection(pageRows.map((r) => r.id))

  const refresh = useCallback(async () => {
    setLoading(true)
    const sb = tryGetSupabase()
    if (!sb) return
    const { data } = await sb.from('form_submissions').select('*').order('created_at', { ascending: false })
    setRows(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function openDetail(row: SubmissionRow) {
    setDetail(row)
    if (row.admin_viewed_at) return
    const sb = tryGetSupabase()
    if (!sb) return
    const viewedAt = new Date().toISOString()
    const { error } = await sb.from('form_submissions').update({ admin_viewed_at: viewedAt }).eq('id', row.id)
    if (!error) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, admin_viewed_at: viewedAt } : r)))
      setDetail({ ...row, admin_viewed_at: viewedAt })
    }
  }

  async function updateStatus(row: SubmissionRow, status: string) {
    const sb = tryGetSupabase()
    if (!sb) return
    setStatusBusy(true)
    const { error } = await sb.from('form_submissions').update({ status }).eq('id', row.id)
    setStatusBusy(false)
    if (error) return
    const next = { ...row, status }
    setRows((prev) => prev.map((r) => (r.id === row.id ? next : r)))
    if (detail?.id === row.id) setDetail(next)
  }

  async function bulkDelete() {
    const sb = tryGetSupabase()
    if (!sb) return
    setBulkBusy(true)
    await sb.from('form_submissions').delete().in('id', bulk.selectedIds)
    setBulkBusy(false)
    bulk.clear()
    await refresh()
  }

  const detailPayload = detail ? parseSubmissionPayload(detail.payload) : {}
  const detailFields = detail
    ? submissionDetailFields(detail.form_type, detailPayload, (slug, label) => (
        <Link to="/property/$slug" params={{ slug }} className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline">
          {label}
        </Link>
      ))
    : []

  if (loading) return <AdminLoadingState />

  return (
    <div className="space-y-4">
      <AdminBulkToolbar selectedCount={bulk.selectedIds.length} onClear={bulk.clear} onDelete={() => void bulkDelete()} busy={bulkBusy} />

      <div className="admin-table-frame">
        <div className="admin-table-wrap">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-xs uppercase text-[var(--admin-muted)]">
                <th className="p-3"><input type="checkbox" checked={bulk.allSelected} onChange={bulk.toggleAll} /></th>
                <th className="p-3">Type</th>
                <th className="p-3">Summary</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className={adminTableActionsHeadClass} />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-[var(--admin-muted)]">No submissions yet.</td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const payload = parseSubmissionPayload(row.payload)
                  const unread = !row.admin_viewed_at
                  return (
                    <AdminClickableTableRow key={row.id} onOpen={() => void openDetail(row)}>
                      <AdminTableStopCell className="p-3"><input type="checkbox" checked={bulk.selected.has(row.id)} onChange={() => bulk.toggle(row.id)} /></AdminTableStopCell>
                      <td className="p-3">
                        <span className={adminBadge}>{submissionTypeLabel(row.form_type)}</span>
                      </td>
                      <td className="p-3">
                        <span className={cn('font-medium text-[var(--admin-text)]', unread && 'font-semibold')}>
                          {submissionSummary(row.form_type, payload)}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--admin-muted)]">{submissionContact(row.form_type, payload)}</td>
                      <td className="p-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusBadgeClass(row.status))}>
                          {submissionStatusLabel(row.status)}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--admin-muted)]">{new Date(row.created_at).toLocaleString()}</td>
                      <AdminTableStopCell className={adminTableActionsCellClass}>
                        <AdminRowActions
                          label="Submission actions"
                          actions={crudRowActions({
                            onView: () => void openDetail(row),
                            onDelete: async () => {
                              const sb = tryGetSupabase()
                              if (sb) {
                                await sb.from('form_submissions').delete().eq('id', row.id)
                                await refresh()
                              }
                            },
                          })}
                        />
                      </AdminTableStopCell>
                    </AdminClickableTableRow>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[var(--admin-border)] p-4">
          <AdminTablePagination
            {...pagination}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </div>
      </div>

      <EntityDetailSheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail ? submissionTypeLabel(detail.form_type) : 'Submission'}
        subtitle={detail ? new Date(detail.created_at).toLocaleString() : undefined}
        fields={detailFields}
        footer={detail ? (
          <div className="flex flex-wrap gap-2">
            {detail.status !== 'in_progress' ? (
              <button type="button" className={adminBtnSecondary} disabled={statusBusy} onClick={() => void updateStatus(detail, 'in_progress')}>
                Mark in progress
              </button>
            ) : null}
            {detail.status !== 'resolved' ? (
              <button type="button" className={adminBtnSecondary} disabled={statusBusy} onClick={() => void updateStatus(detail, 'resolved')}>
                Mark resolved
              </button>
            ) : null}
          </div>
        ) : undefined}
      />
    </div>
  )
}
