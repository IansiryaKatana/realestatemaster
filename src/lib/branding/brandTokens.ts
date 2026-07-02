export type BrandTokenGroup = 'storefront' | 'admin'

export type BrandToken = {
  settingKey: string
  cssVar: string
  defaultValue: string
  label: string
  description: string
  group: BrandTokenGroup
}

export const BRAND_TOKENS: BrandToken[] = [
  {
    settingKey: 'brand_color_page_bg',
    cssVar: '--color-page-bg',
    defaultValue: '#eeeeec',
    label: 'Page background',
    description: 'Outer page shell behind main content areas.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_color_content_bg',
    cssVar: '--color-content-bg',
    defaultValue: '#f8f7f3',
    label: 'Content background',
    description: 'Primary storefront page background.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_color_hero_brown',
    cssVar: '--color-hero-brown',
    defaultValue: '#7b674f',
    label: 'Hero & header brown',
    description: 'Hero sections, sticky header, and mobile menu bar.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_color_text_brown',
    cssVar: '--color-text-brown',
    defaultValue: '#2b2118',
    label: 'Text brown',
    description: 'Primary body text and headings.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_color_cta_brown',
    cssVar: '--color-cta-brown',
    defaultValue: '#806035',
    label: 'CTA brown',
    description: 'Buttons, links, accents, and transactional email headers.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_color_soft_beige',
    cssVar: '--color-soft-beige',
    defaultValue: '#efe8dd',
    label: 'Soft beige',
    description: 'Subtle surfaces, highlights, and hover states.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_color_footer_dark',
    cssVar: '--color-footer-dark',
    defaultValue: '#1e140c',
    label: 'Footer dark',
    description: 'Footer and cookie banner backgrounds.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_color_cream_text',
    cssVar: '--color-cream-text',
    defaultValue: '#f8f1e8',
    label: 'Cream text',
    description: 'Text on dark hero, header, and footer surfaces.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_color_muted',
    cssVar: '--color-muted',
    defaultValue: '#7e766c',
    label: 'Muted text',
    description: 'Secondary labels, captions, and helper text.',
    group: 'storefront',
  },
  {
    settingKey: 'brand_admin_primary',
    cssVar: '--admin-primary',
    defaultValue: '#806035',
    label: 'Admin primary',
    description: 'Primary buttons and active accents in the admin panel.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_primary_hover',
    cssVar: '--admin-primary-hover',
    defaultValue: '#6b5029',
    label: 'Admin primary hover',
    description: 'Hover state for primary admin actions.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_primary_muted',
    cssVar: '--admin-primary-muted',
    defaultValue: '#efe8dd',
    label: 'Admin primary muted',
    description: 'Soft primary-tinted backgrounds in admin.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_surface',
    cssVar: '--admin-surface',
    defaultValue: '#f8f7f3',
    label: 'Admin surface',
    description: 'Main admin workspace background.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_surface_elevated',
    cssVar: '--admin-surface-elevated',
    defaultValue: '#ffffff',
    label: 'Admin elevated surface',
    description: 'Cards, panels, and raised admin sections.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_border',
    cssVar: '--admin-border',
    defaultValue: '#e5e0d8',
    label: 'Admin border',
    description: 'Dividers and input borders in admin.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_text',
    cssVar: '--admin-text',
    defaultValue: '#2b2118',
    label: 'Admin text',
    description: 'Primary text color in the admin panel.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_muted',
    cssVar: '--admin-muted',
    defaultValue: '#7e766c',
    label: 'Admin muted text',
    description: 'Secondary admin labels and descriptions.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_danger',
    cssVar: '--admin-danger',
    defaultValue: '#b42318',
    label: 'Admin danger',
    description: 'Destructive actions and error emphasis.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_danger_muted',
    cssVar: '--admin-danger-muted',
    defaultValue: '#fef3f2',
    label: 'Admin danger muted',
    description: 'Soft danger-tinted admin backgrounds.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_success',
    cssVar: '--admin-success',
    defaultValue: '#027a48',
    label: 'Admin success',
    description: 'Success states and positive indicators.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_sidebar',
    cssVar: '--admin-sidebar',
    defaultValue: '#1e140c',
    label: 'Admin sidebar',
    description: 'Admin navigation sidebar background.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_sidebar_text',
    cssVar: '--admin-sidebar-text',
    defaultValue: '#f8f1e8',
    label: 'Admin sidebar text',
    description: 'Navigation labels on the admin sidebar.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_sidebar_muted',
    cssVar: '--admin-sidebar-muted',
    defaultValue: '#a89a8c',
    label: 'Admin sidebar muted',
    description: 'Inactive or secondary sidebar items.',
    group: 'admin',
  },
  {
    settingKey: 'brand_admin_sidebar_active',
    cssVar: '--admin-sidebar-active',
    defaultValue: '#806035',
    label: 'Admin sidebar active',
    description: 'Active navigation indicator in the sidebar.',
    group: 'admin',
  },
  {
    settingKey: 'brand_chart_1',
    cssVar: '--chart-1',
    defaultValue: '#806035',
    label: 'Chart primary',
    description: 'Primary data series color in admin charts.',
    group: 'admin',
  },
  {
    settingKey: 'brand_chart_2',
    cssVar: '--chart-2',
    defaultValue: '#a8895c',
    label: 'Chart secondary',
    description: 'Secondary data series color in admin charts.',
    group: 'admin',
  },
]

export const BRAND_SETTING_KEYS = BRAND_TOKENS.map((token) => token.settingKey)

export const BRAND_DEFAULTS: Record<string, string> = Object.fromEntries(
  BRAND_TOKENS.map((token) => [token.settingKey, token.defaultValue]),
)

export function isBrandSettingKey(key: string) {
  return key in BRAND_DEFAULTS
}

export function getBrandToken(settingKey: string) {
  return BRAND_TOKENS.find((token) => token.settingKey === settingKey)
}
