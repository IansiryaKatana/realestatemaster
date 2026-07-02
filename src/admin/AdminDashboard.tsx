import { useCallback, useEffect, useState } from 'react'
import { Building2, DollarSign, FileText, FolderOpen, Image, Inbox, KeyRound } from 'lucide-react'
import { fetchAdminDashboard } from '@/admin/lib/adminRpc'
import { AdminPageHeading, AdminLoadingState } from '@/admin/components/AdminPageHeading'
import { AdminOrdersChart, type OrderChartData } from '@/admin/components/AdminOrdersChart'
import { AdminActiveTransactionsPanel } from '@/admin/AdminActiveTransactionsPanel'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useCms } from '@/contexts/CmsContext'
import { formatCurrency, getCurrencyFromSettings } from '@/lib/currency'
import { formatOrdinalShortDate } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/database.types'

type NewsletterRow = Database['public']['Tables']['newsletter_subscribers']['Row']

type DashboardCounts = {
  products: number
  collections: number
  unreadQuotes: number
  unreadSubmissions: number
  media: number
  totalSales: number
  activeTransactions: number
  propertyInquiries: number
}

const EMPTY_CHART: OrderChartData = { daily: [], weekly: [], monthly: [] }

export function AdminDashboard() {
  const { snapshot } = useCms()
  const currency = getCurrencyFromSettings(snapshot.siteSettings)
  const [counts, setCounts] = useState<DashboardCounts | null>(null)
  const [recentNewsletter, setRecentNewsletter] = useState<NewsletterRow[]>([])
  const [orderChart, setOrderChart] = useState<OrderChartData>(EMPTY_CHART)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminDashboard()
      const sb = tryGetSupabase()
      const [activeTxRes, inquiriesRes] = await Promise.all([
        sb
          .from('property_transactions')
          .select('*', { count: 'exact', head: true })
          .not('status', 'in', '(transaction_completed,cancelled,rejected)'),
        sb.from('property_inquiries').select('*', { count: 'exact', head: true }),
      ])
      setCounts({
        ...data.counts,
        activeTransactions: activeTxRes.count ?? 0,
        propertyInquiries: inquiriesRes.count ?? 0,
      })
      setRecentNewsletter(data.recentNewsletter)
      setOrderChart(data.orderChart)
    } catch {
      setCounts({
        products: 0,
        collections: 0,
        unreadQuotes: 0,
        unreadSubmissions: 0,
        media: 0,
        totalSales: 0,
        activeTransactions: 0,
        propertyInquiries: 0,
      })
      setRecentNewsletter([])
      setOrderChart(EMPTY_CHART)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (loading || !counts) return <AdminLoadingState />

  const statCards = [
    { label: 'Published properties', value: String(counts.products), icon: Building2 },
    { label: 'Collections', value: String(counts.collections), icon: FolderOpen },
    { label: 'Active transactions', value: String(counts.activeTransactions), icon: KeyRound },
    { label: 'Property inquiries', value: String(counts.propertyInquiries), icon: Inbox },
    { label: 'Open payment quotes', value: String(counts.unreadQuotes), icon: FileText },
    { label: 'Form submissions', value: String(counts.unreadSubmissions), icon: FileText },
    { label: 'Media assets', value: String(counts.media), icon: Image },
    {
      label: 'Total payments',
      value: formatCurrency(counts.totalSales, { code: currency.code, locale: currency.locale }),
      icon: DollarSign,
    },
  ]

  return (
    <div>
      <AdminPageHeading title="Dashboard" subtitle="Overview of your real estate platform" />

      <div className="admin-stat-grid">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="admin-stat-tile">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm text-[var(--admin-muted)]">{card.label}</p>
                <Icon className="h-4 w-4 shrink-0 text-[var(--admin-primary)]" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-[var(--admin-text)] lg:text-3xl">{card.value}</p>
            </div>
          )
        })}
      </div>

      <AdminOrdersChart data={orderChart} />

      <AdminActiveTransactionsPanel />

      <div className="admin-section mt-6 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--admin-text)]">Recent newsletter signups</h2>
        {recentNewsletter.length === 0 ? (
          <p className="text-sm text-[var(--admin-muted)]">No subscribers yet.</p>
        ) : (
          <div className="admin-table-wrap admin-table-wrap--rows">
            <table className="w-full min-w-0 text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)] text-[var(--admin-muted)]">
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="hidden pb-2 pr-4 font-medium sm:table-cell">Source</th>
                  <th className="pb-2 text-right font-medium sm:text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentNewsletter.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--admin-border)] last:border-0">
                    <td className="max-w-0 py-3 pr-2 sm:max-w-none sm:pr-4">
                      <span className="block truncate">{row.email}</span>
                    </td>
                    <td className="hidden py-3 pr-4 text-[var(--admin-muted)] sm:table-cell">
                      {row.source ?? '—'}
                    </td>
                    <td className="whitespace-nowrap py-3 text-right text-[var(--admin-muted)] sm:text-left">
                      {row.created_at ? formatOrdinalShortDate(row.created_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
