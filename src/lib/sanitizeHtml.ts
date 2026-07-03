import { sanitizeMarketingHtml as sanitizeBrowser } from './sanitizeHtml.browser'
import { sanitizeMarketingHtml as sanitizeServer } from './sanitizeHtml.server'

export function sanitizeMarketingHtml(html: string): string {
  return import.meta.env.SSR ? sanitizeServer(html) : sanitizeBrowser(html)
}
