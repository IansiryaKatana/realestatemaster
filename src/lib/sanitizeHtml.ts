import { sanitizeMarketingHtml as sanitizeBrowser } from './sanitizeHtml.browser'

export function sanitizeMarketingHtml(html: string): string {
  if (import.meta.env.SSR) {
    const { sanitizeMarketingHtml: sanitizeServer } =
      require('./sanitizeHtml.server') as typeof import('./sanitizeHtml.server')
    return sanitizeServer(html)
  }

  return sanitizeBrowser(html)
}
