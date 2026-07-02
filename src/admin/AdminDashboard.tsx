import { useCallback, useEffect, useState } from 'react'
import {
  Banknote,
  Building2,
  Coins,
  FileText,
  FolderOpen,
  Image,
  Inbox,
  KeyRound,
  MessageSquare,
  Wrench,
} from 'lucide-react'
import { fetchAdminDashboard } from '@/admin/lib/adminRpc'
import { fetchTenancyDashboard } from '@/lib/tenancy/tenancyRpc'
import { AdminPageHeading, AdminLoadingState } from '@/admin/components/AdminPageHeading'
import { AdminStatTile } from '@/admin/components/AdminStatTile'
import { AdminOrdersChart, type OrderChartData } from '@/admin/components/AdminOrdersChart'
import { AdminActiveTransactionsPanel } from '@/admin/AdminActiveTransactionsPanel'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useFormatPrice } from '@/lib/currency'
import { formatOrdinalShortDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/database.types'
import type { LucideIcon } from 'lucide-react'

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
  activeLeases: number
  overdueRent: number
  pendingVerification: number
  openComplaints: number
  openMaintenance: number
}

type StatCard = {
  label: string
  value: string
  icon: LucideIcon
  title?: string
}

type StatTab = {
  id: string
  label: string
  cards: StatCard[]
}

const EMPTY_CHART: OrderChartData = { daily: [], weekly: [], monthly: [] }

const STAT_TABS: { id: string; label: string }[] = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'tenancy', label: 'Tenancy' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'payments', label: 'Payments' },
]

export function AdminDashboard() {
  const formatPrice = useFormatPrice()
  const [activeStatTab, setActiveStatTab] = useState('portfolio')
  const [counts, setCounts] = useState<DashboardCounts | null>(null)
  const [recentNewsletter, setRecentNewsletter] = useState<NewsletterRow[]>([])
  const [orderChart, setOrderChart] = useState<OrderChartData>(EMPTY_CHART)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminDashboard()
      const sb = tryGetSupabase()
      const [activeTxRes, inquiriesRes, tenancyRes] = await Promise.all([
        sb
          .from('property_transactions')
          .select('*', { count: 'exact', head: true })
          .not('status', 'in', '(transaction_completed,cancelled,rejected)'),
        sb.from('property_inquiries').select('*', { count: 'exact', head: true }),
        fetchTenancyDashboard().catch(() => ({
          activeLeases: 0,
          overdueRent: 0,
          pendingVerification: 0,
          openComplaints: 0,
          openMaintenance: 0,
          landlords: 0,
        })),
      ])
      setCounts({
        ...data.counts,
        activeTransactions: activeTxRes.count ?? 0,
        propertyInquiries: inquiriesRes.count ?? 0,
        activeLeases: tenancyRes.activeLeases,
        overdueRent: tenancyRes.overdueRent,
        pendingVerification: tenancyRes.pendingVerification,
        openComplaints: tenancyRes.openComplaints,
        openMaintenance: tenancyRes.openMaintenance,
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
        activeLeases: 0,
        overdueRent: 0,
        pendingVerification: 0,
        openComplaints: 0,
        openMaintenance: 0,
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

  const totalPaymentsFormatted = formatPrice(counts.totalSales)

  const statTabGroups: StatTab[] = [
    {
      id: 'portfolio',
      label: 'Portfolio',
      cards: [
        { label: 'Published properties', value: String(counts.products), icon: Building2 },
        { label: 'Collections', value: String(counts.collections), icon: FolderOpen },
        { label: 'Media assets', value: String(counts.media), icon: Image },
      ],
    },
    {
      id: 'tenancy',
      label: 'Tenancy',
      cards: [
        { label: 'Active leases', value: String(counts.activeLeases), icon: KeyRound },
        { label: 'Overdue rent', value: String(counts.overdueRent), icon: Banknote },
        { label: 'Pending verification', value: String(counts.pendingVerification), icon: FileText },
        { label: 'Open complaints', value: String(counts.openComplaints), icon: MessageSquare },
        { label: 'Open maintenance', value: String(counts.openMaintenance), icon: Wrench },
      ],
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      cards: [
        { label: 'Active transactions', value: String(counts.activeTransactions), icon: Building2 },
        { label: 'Property inquiries', value: String(counts.propertyInquiries), icon: Inbox },
        { label: 'Open payment quotes', value: String(counts.unreadQuotes), icon: FileText },
        { label: 'Form submissions', value: String(counts.unreadSubmissions), icon: Inbox },
      ],
    },
    {
      id: 'payments',
      label: 'Payments',
      cards: [
        {
          label: 'Total payments',
          value: totalPaymentsFormatted,
          title: totalPaymentsFormatted,
          icon: Coins,
        },
      ],
    },
  ]

  const activeGroup = statTabGroups.find((tab) => tab.id === activeStatTab) ?? statTabGroups[0]

  return (
    <div>
      <AdminPageHeading title="Dashboard" subtitle="Overview of your real estate platform" />

      <div className="admin-tab-nav-row mb-4">
        <div className="admin-tab-nav" role="tablist" aria-label="Dashboard metrics">
          {STAT_TABS.map((tab) => {
            const isActive = tab.id === activeStatTab
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn('admin-tab-nav-item', isActive && 'admin-tab-nav-item-active')}
                onClick={() => setActiveStatTab(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        className="admin-stat-grid admin-stat-grid--tabbed"
        aria-label={`${activeGroup.label} metrics`}
      >
        {activeGroup.cards.map((card) => (
          <AdminStatTile key={card.label} {...card} />
        ))}
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
