import { contrastLabel, contrastRatio, getContrastLevel, type ContrastLevel } from '@/lib/branding/colorUtils'

export type BrandContrastCheck = {
  id: string
  label: string
  foregroundKey: string
  backgroundKey: string
  largeText?: boolean
  required: boolean
}

export const BRAND_CONTRAST_CHECKS: BrandContrastCheck[] = [
  {
    id: 'hero-nav',
    label: 'Navigation on hero / header',
    foregroundKey: 'brand_color_cream_text',
    backgroundKey: 'brand_color_hero_brown',
    largeText: true,
    required: true,
  },
  {
    id: 'footer-text',
    label: 'Footer text',
    foregroundKey: 'brand_color_cream_text',
    backgroundKey: 'brand_color_footer_dark',
    required: true,
  },
  {
    id: 'body-text',
    label: 'Body text on content background',
    foregroundKey: 'brand_color_text_brown',
    backgroundKey: 'brand_color_content_bg',
    required: true,
  },
  {
    id: 'muted-text',
    label: 'Muted text on content background',
    foregroundKey: 'brand_color_muted',
    backgroundKey: 'brand_color_content_bg',
    required: true,
  },
  {
    id: 'cta-on-content',
    label: 'CTA accent on content background',
    foregroundKey: 'brand_color_cta_brown',
    backgroundKey: 'brand_color_content_bg',
    largeText: true,
    required: true,
  },
  {
    id: 'admin-body',
    label: 'Admin text on workspace',
    foregroundKey: 'brand_admin_text',
    backgroundKey: 'brand_admin_surface',
    required: true,
  },
  {
    id: 'admin-muted',
    label: 'Admin muted text on workspace',
    foregroundKey: 'brand_admin_muted',
    backgroundKey: 'brand_admin_surface',
    required: true,
  },
  {
    id: 'admin-sidebar',
    label: 'Admin sidebar navigation',
    foregroundKey: 'brand_admin_sidebar_text',
    backgroundKey: 'brand_admin_sidebar',
    required: true,
  },
  {
    id: 'admin-primary-button',
    label: 'Admin primary button text',
    foregroundKey: 'brand_color_cream_text',
    backgroundKey: 'brand_admin_primary',
    largeText: true,
    required: true,
  },
]

export type BrandContrastResult = BrandContrastCheck & {
  ratio: number | null
  level: ContrastLevel
  message: string
}

export function evaluateBrandContrast(colors: Record<string, string>): BrandContrastResult[] {
  return BRAND_CONTRAST_CHECKS.map((check) => {
    const ratio = contrastRatio(colors[check.foregroundKey] ?? '', colors[check.backgroundKey] ?? '')
    const level = getContrastLevel(ratio, check.largeText)
    return {
      ...check,
      ratio,
      level,
      message: contrastLabel(level),
    }
  })
}

export function hasBlockingContrastIssues(results: BrandContrastResult[]) {
  return results.some((result) => result.required && result.level === 'fail')
}
