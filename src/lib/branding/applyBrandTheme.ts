import { brandThemeToCssVars, resolveBrandTheme } from '@/lib/branding/resolveBrandTheme'

export function applyBrandTheme(settings: Record<string, string>, target: HTMLElement = document.documentElement) {
  const colors = resolveBrandTheme(settings)
  const vars = brandThemeToCssVars(colors)
  for (const [key, value] of Object.entries(vars)) {
    target.style.setProperty(key, value)
  }
}

import { BRAND_TOKENS } from '@/lib/branding/brandTokens'

export function clearBrandTheme(target: HTMLElement = document.documentElement) {
  for (const token of BRAND_TOKENS) {
    target.style.removeProperty(token.cssVar)
  }
}
