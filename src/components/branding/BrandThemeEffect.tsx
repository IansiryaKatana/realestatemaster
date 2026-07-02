import { useEffect } from 'react'
import { applyBrandTheme } from '@/lib/branding/applyBrandTheme'
import { useCms } from '@/contexts/CmsContext'

/** Applies storefront + admin CSS variables from live site settings. */
export function BrandThemeEffect() {
  const { snapshot } = useCms()

  useEffect(() => {
    applyBrandTheme(snapshot.siteSettings)
  }, [snapshot.siteSettings])

  return null
}
