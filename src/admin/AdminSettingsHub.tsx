import { AdminTabHub } from '@/admin/components/AdminTabHub'
import { AdminSiteSettings } from '@/admin/AdminSiteSettings'
import { AdminUsers } from '@/admin/AdminUsers'
import { AdminDataTransfer } from '@/admin/AdminDataTransfer'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { canManageAdminUsers } from '@/lib/admin/permissions'

const ALL_TABS = [
  { id: 'site-settings', label: 'Site Settings', content: <AdminSiteSettings /> },
  { id: 'users', label: 'Users', content: <AdminUsers /> },
  { id: 'data-transfer', label: 'Import / Export', content: <AdminDataTransfer /> },
] as const

type TabId = (typeof ALL_TABS)[number]['id']

export function AdminSettingsHub({ tab }: { tab: TabId }) {
  const { role } = useAdminAuth()
  const tabs = ALL_TABS.filter((t) => t.id !== 'users' || canManageAdminUsers(role))

  return (
    <AdminTabHub
      title="Settings"
      subtitle="Store configuration, admin users, and data transfer."
      hubPath="/admin/settings"
      tabs={[...tabs]}
      activeTab={tab}
    />
  )
}

export const SETTINGS_TABS = ALL_TABS.map((t) => t.id) as unknown as readonly [TabId, ...TabId[]]
export const SETTINGS_DEFAULT_TAB: TabId = 'site-settings'
