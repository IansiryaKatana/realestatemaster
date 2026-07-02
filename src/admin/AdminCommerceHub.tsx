import { Link } from '@tanstack/react-router'
import { AdminTabHub } from '@/admin/components/AdminTabHub'
import { AdminInfoBanner } from '@/admin/components/AdminPageHeading'
import { AdminOrders } from '@/admin/AdminOrders'
import { AdminCoupons } from '@/admin/AdminCoupons'
import { AdminCustomers } from '@/admin/AdminCustomers'
import { AdminCheckout } from '@/admin/AdminCheckout'
import { AdminIntegrations } from '@/admin/AdminIntegrations'

const TABS = [
  { id: 'orders', label: 'Payment records', content: <AdminOrders /> },
  { id: 'customers', label: 'Clients', content: <AdminCustomers /> },
  { id: 'checkout', label: 'Payment settings', content: <AdminCheckout /> },
  { id: 'integrations', label: 'Stripe', content: <AdminIntegrations /> },
  { id: 'coupons', label: 'Promotions', content: <AdminCoupons /> },
] as const

type TabId = (typeof TABS)[number]['id']

export function AdminCommerceHub({ tab }: { tab: TabId }) {
  return (
    <AdminTabHub
      title="Payments & Clients"
      subtitle="Client records, payment collection, and Stripe configuration for rent, deposits, and fees."
      hubPath="/admin/commerce"
      tabs={[...TABS]}
      activeTab={tab}
      notice={
        <AdminInfoBanner>
          Property lifecycle workflows — viewings, contracts, handover, and transaction status — are managed under{' '}
          <Link to="/admin/real-estate" search={{ tab: 'transactions' }} className="font-medium underline underline-offset-2">
            Real Estate → Transactions
          </Link>
          . Use this section for client accounts and completed payment records.
        </AdminInfoBanner>
      }
    />
  )
}

export const COMMERCE_TABS = TABS.map((t) => t.id) as unknown as readonly [TabId, ...TabId[]]
export const COMMERCE_DEFAULT_TAB: TabId = 'orders'
