import { BRAND_DEFAULTS, BRAND_TOKENS } from '@/lib/branding/brandTokens'
import { normalizeHexColor } from '@/lib/branding/colorUtils'

export function resolveBrandColor(settings: Record<string, string>, settingKey: string): string {
  const raw = settings[settingKey]?.trim()
  const normalized = raw ? normalizeHexColor(raw) : null
  if (normalized) return normalized
  return BRAND_DEFAULTS[settingKey] ?? '#000000'
}

export function resolveBrandTheme(settings: Record<string, string>) {
  const colors: Record<string, string> = {}
  for (const token of BRAND_TOKENS) {
    colors[token.settingKey] = resolveBrandColor(settings, token.settingKey)
  }
  return colors
}

export function resolveEmailBrandColor(settings: Record<string, string>) {
  return resolveBrandColor(settings, 'brand_color_cta_brown')
}

export function brandThemeToCssVars(colors: Record<string, string>) {
  const vars: Record<string, string> = {}
  for (const token of BRAND_TOKENS) {
    vars[token.cssVar] = colors[token.settingKey] ?? token.defaultValue
  }
  return vars
}
