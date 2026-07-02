import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr', 'span', 'div',
]

export function sanitizeMarketingHtml(html: string): string {
  if (!html.trim()) return ''

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel', 'class'],
      '*': ['class'],
      p: ['class'],
      div: ['class'],
      span: ['class'],
      h1: ['class'],
      h2: ['class'],
      h3: ['class'],
      h4: ['class'],
      ul: ['class'],
      ol: ['class'],
      li: ['class'],
      blockquote: ['class'],
    },
  })
}
