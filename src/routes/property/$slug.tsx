import { createFileRoute } from '@tanstack/react-router'
import { PropertyDetailPageView } from '@/components/property/PropertyDetailPageView'

export const Route = createFileRoute('/property/$slug')({
  component: PropertyDetailPage,
  head: () => ({ meta: [{ title: 'Property | GW Vacation Homes' }] }),
})

function PropertyDetailPage() {
  const { slug } = Route.useParams()
  return <PropertyDetailPageView slug={slug} />
}
