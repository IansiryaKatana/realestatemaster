import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { applyBrandTheme } from '@/lib/branding/applyBrandTheme'
import { evaluateBrandContrast, hasBlockingContrastIssues } from '@/lib/branding/brandContrastChecks'
import { BRAND_DEFAULTS, BRAND_TOKENS, type BrandTokenGroup } from '@/lib/branding/brandTokens'
import { isValidHexColor, normalizeHexColor } from '@/lib/branding/colorUtils'
import { resolveBrandTheme } from '@/lib/branding/resolveBrandTheme'
import {
  getSettingValue,
  patchSetting,
  upsertSiteSettings,
  type SettingEntry,
} from '@/admin/lib/siteSettingsAdmin'
import { adminBtnPrimary, adminBtnSecondary, adminInput, adminLabel } from '@/admin/adminClassNames'
import { cn } from '@/lib/utils'

type AdminBrandingSectionProps = {
  entries: SettingEntry[]
  setEntries: React.Dispatch<React.SetStateAction<SettingEntry[]>>
  onSaved: () => Promise<void>
}

function ColorField({
  token,
  value,
  onChange,
  invalid,
}: {
  token: (typeof BRAND_TOKENS)[number]
  value: string
  onChange: (value: string) => void
  invalid: boolean
}) {
  const normalized = normalizeHexColor(value) ?? token.defaultValue

  return (
    <div className="space-y-2">
      <label className={adminLabel} htmlFor={token.settingKey}>
        {token.label}
      </label>
      <p className="text-xs text-[var(--admin-muted)]">{token.description}</p>
      <div className="flex gap-2">
        <input
          id={token.settingKey}
          type="color"
          className="h-10 w-14 shrink-0 cursor-pointer rounded border border-[var(--admin-border)]"
          value={normalized}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className={cn(adminInput, invalid && 'border-[var(--admin-danger)]')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={token.defaultValue}
          spellCheck={false}
        />
      </div>
    </div>
  )
}

function TokenGroup({
  title,
  description,
  group,
  draftColors,
  invalidKeys,
  onChange,
}: {
  title: string
  description: string
  group: BrandTokenGroup
  draftColors: Record<string, string>
  invalidKeys: Set<string>
  onChange: (key: string, value: string) => void
}) {
  const tokens = BRAND_TOKENS.filter((token) => token.group === group)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-[var(--admin-muted)]">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tokens.map((token) => (
          <ColorField
            key={token.settingKey}
            token={token}
            value={draftColors[token.settingKey] ?? token.defaultValue}
            invalid={invalidKeys.has(token.settingKey)}
            onChange={(value) => onChange(token.settingKey, value)}
          />
        ))}
      </div>
    </div>
  )
}

export function AdminBrandingSection({ entries, setEntries, onSaved }: AdminBrandingSectionProps) {
  const [saving, setSaving] = useState(false)

  const draftColors = useMemo(() => {
    const colors: Record<string, string> = {}
    for (const token of BRAND_TOKENS) {
      colors[token.settingKey] = getSettingValue(entries, token.settingKey, token.defaultValue)
    }
    return colors
  }, [entries])

  const invalidKeys = useMemo(() => {
    const invalid = new Set<string>()
    for (const token of BRAND_TOKENS) {
      if (!isValidHexColor(draftColors[token.settingKey] ?? '')) invalid.add(token.settingKey)
    }
    return invalid
  }, [draftColors])

  const contrastResults = useMemo(() => evaluateBrandContrast(resolveBrandTheme(draftColors)), [draftColors])
  const hasContrastBlockers = hasBlockingContrastIssues(contrastResults)

  useEffect(() => {
    applyBrandTheme(draftColors)
  }, [draftColors])

  function updateColor(key: string, value: string) {
    setEntries((prev) => patchSetting(prev, key, value))
  }

  function resetToDefaults() {
    let next = entries
    for (const [key, value] of Object.entries(BRAND_DEFAULTS)) {
      next = patchSetting(next, key, value)
    }
    setEntries(next)
    toast.message('Brand colors reset to defaults. Save to apply permanently.')
  }

  async function saveBranding() {
    if (invalidKeys.size > 0) {
      toast.error('Fix invalid hex colors before saving.')
      return
    }
    if (hasContrastBlockers) {
      toast.error('Contrast checks must pass WCAG standards before saving.')
      return
    }

    setSaving(true)
    try {
      const normalizedEntries = BRAND_TOKENS.reduce<SettingEntry[]>((acc, token) => {
        const value = normalizeHexColor(draftColors[token.settingKey] ?? '') ?? token.defaultValue
        return patchSetting(acc, token.settingKey, value)
      }, entries)

      const ctaColor =
        normalizeHexColor(draftColors.brand_color_cta_brown ?? '') ?? BRAND_DEFAULTS.brand_color_cta_brown
      const contentBg =
        normalizeHexColor(draftColors.brand_color_content_bg ?? '') ?? BRAND_DEFAULTS.brand_color_content_bg

      const withLegacy = patchSetting(
        patchSetting(
          patchSetting(normalizedEntries, 'email_brand_color', ctaColor),
          'brand_primary',
          ctaColor,
        ),
        'brand_surface',
        contentBg,
      )

      setEntries(withLegacy)
      await upsertSiteSettings(
        [...BRAND_TOKENS.map((token) => token.settingKey), 'email_brand_color', 'brand_primary', 'brand_surface'],
        withLegacy,
      )
      toast.success('Brand colors saved')
      await onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save brand colors')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-section space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">Brand colors</h2>
          <p className="text-sm text-[var(--admin-muted)]">
            Controls storefront and admin UI colors. Transactional emails use CTA brown automatically. Reset restores
            the original shipped palette.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminBtnSecondary} onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4" />
            Reset to defaults
          </button>
          <button
            type="button"
            className={adminBtnPrimary}
            disabled={saving || invalidKeys.size > 0 || hasContrastBlockers}
            onClick={() => void saveBranding()}
          >
            <Save className="h-4 w-4" />
            Save brand colors
          </button>
        </div>
      </div>

      <TokenGroup
        title="Storefront"
        description="Public website surfaces, typography, and accents."
        group="storefront"
        draftColors={draftColors}
        invalidKeys={invalidKeys}
        onChange={updateColor}
      />

      <TokenGroup
        title="Admin panel"
        description="Back-office workspace, sidebar, charts, and controls."
        group="admin"
        draftColors={draftColors}
        invalidKeys={invalidKeys}
        onChange={updateColor}
      />

      <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-4">
        <h3 className="font-semibold">Contrast checks (WCAG)</h3>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Required pairs must meet AA contrast. Large text / UI accents may pass at 3:1.
        </p>
        <ul className="mt-4 space-y-2">
          {contrastResults.map((result) => (
            <li
              key={result.id}
              className={cn(
                'flex flex-col gap-1 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between',
                result.level === 'fail'
                  ? 'border-[var(--admin-danger)] bg-[var(--admin-danger-muted)] text-[var(--admin-danger)]'
                  : 'border-[var(--admin-border)]',
              )}
            >
              <span>{result.label}</span>
              <span className="text-xs sm:text-sm">
                {result.ratio ? `${result.ratio.toFixed(2)}:1` : '—'} · {result.message}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
