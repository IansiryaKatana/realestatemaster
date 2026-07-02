import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr', 'span', 'div',
]

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'class']

export function sanitizeMarketingHtml(html: string) {
  if (!html.trim()) return ''
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: Object.fromEntries(
      ALLOWED_TAGS.map((tag) => [tag, ALLOWED_ATTR]),
    ),
  })
}
