import { createFileRoute, redirect } from '@tanstack/react-router'
import { PropertyDetailPageView } from '@/components/property/PropertyDetailPageView'
import { isPropertyListing } from '@/lib/property/formatProperty'
import { fetchStorefrontProductBySlug } from '@/lib/storefront/storefrontRpc'
import { isSupabaseConfigured } from '@/integrations/supabase/client'

export const Route = createFileRoute('/product/$slug')({
  beforeLoad: async ({ params }) => {
    if (!isSupabaseConfigured()) return
    try {
      const product = await fetchStorefrontProductBySlug(params.slug)
      if (product && isPropertyListing(product)) {
        throw redirect({ to: '/property/$slug', params: { slug: params.slug } })
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'to' in err) throw err
    }
  },
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { slug } = Route.useParams()
  return <PropertyDetailPageView slug={slug} />
}
