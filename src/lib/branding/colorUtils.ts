const HEX_PATTERN = /^#([0-9A-Fa-f]{6})$/

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (!HEX_PATTERN.test(withHash)) return null
  return withHash.toLowerCase()
}

export function isValidHexColor(value: string) {
  return normalizeHexColor(value) !== null
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return null
  const raw = normalized.slice(1)
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  }
}

function channelLuminance(channel: number) {
  const srgb = channel / 255
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return 0.2126 * channelLuminance(rgb.r) + 0.7152 * channelLuminance(rgb.g) + 0.0722 * channelLuminance(rgb.b)
}

export function contrastRatio(foreground: string, background: string): number | null {
  const fg = relativeLuminance(foreground)
  const bg = relativeLuminance(background)
  if (fg === null || bg === null) return null
  const lighter = Math.max(fg, bg)
  const darker = Math.min(fg, bg)
  return (lighter + 0.05) / (darker + 0.05)
}

export type ContrastLevel = 'aa' | 'aa-large' | 'fail'

export function getContrastLevel(ratio: number | null, largeText = false): ContrastLevel {
  if (ratio === null) return 'fail'
  if (largeText) return ratio >= 3 ? 'aa-large' : 'fail'
  return ratio >= 4.5 ? 'aa' : ratio >= 3 ? 'aa-large' : 'fail'
}

export function contrastLabel(level: ContrastLevel) {
  if (level === 'aa') return 'Passes WCAG AA'
  if (level === 'aa-large') return 'Passes for large text / UI only'
  return 'Fails WCAG contrast'
}
