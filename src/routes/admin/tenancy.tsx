import { createFileRoute } from '@tanstack/react-router'
import { AdminTenancyHub, TENANCY_DEFAULT_TAB, TENANCY_TABS } from '@/admin/AdminTenancyHub'
import { createTabSearchSchema } from '@/admin/lib/adminTabSearch'

const searchSchema = createTabSearchSchema(TENANCY_TABS, TENANCY_DEFAULT_TAB)

export const Route = createFileRoute('/admin/tenancy')({
  validateSearch: searchSchema,
  component: TenancyAdminPage,
})

function TenancyAdminPage() {
  const { tab } = Route.useSearch()
  return <AdminTenancyHub tab={tab} />
}
