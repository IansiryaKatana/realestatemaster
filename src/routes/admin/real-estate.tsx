import { createFileRoute } from '@tanstack/react-router'
import { AdminRealEstateHub, REAL_ESTATE_DEFAULT_TAB, REAL_ESTATE_TABS } from '@/admin/AdminRealEstateHub'
import { createTabSearchSchema } from '@/admin/lib/adminTabSearch'

const searchSchema = createTabSearchSchema(REAL_ESTATE_TABS, REAL_ESTATE_DEFAULT_TAB)

export const Route = createFileRoute('/admin/real-estate')({
  validateSearch: searchSchema,
  component: RealEstateAdminPage,
})

function RealEstateAdminPage() {
  const { tab } = Route.useSearch()
  return <AdminRealEstateHub tab={tab} />
}
