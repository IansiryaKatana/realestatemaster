const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr', 'span', 'div',
])

const ALLOWED_ATTR: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  '*': new Set(['class']),
}

function allowedAttributes(tag: string, name: string) {
  return ALLOWED_ATTR[tag]?.has(name) || ALLOWED_ATTR['*']?.has(name)
}

export function sanitizeMarketingHtml(html: string): string {
  if (!html.trim()) return ''

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const body = doc.body

  const walk = (node: Node) => {
    const children = [...node.childNodes]
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        const tag = el.tagName.toLowerCase()
        if (!ALLOWED_TAGS.has(tag)) {
          while (el.firstChild) el.parentNode?.insertBefore(el.firstChild, el)
          el.remove()
          continue
        }
        for (const attr of [...el.attributes]) {
          if (!allowedAttributes(tag, attr.name.toLowerCase())) {
            el.removeAttribute(attr.name)
          }
        }
        if (tag === 'a') {
          const href = el.getAttribute('href') ?? ''
          if (/^\s*javascript:/i.test(href)) el.removeAttribute('href')
          if (el.getAttribute('target') === '_blank') {
            el.setAttribute('rel', 'noopener noreferrer')
          }
        }
      }
      if (child.nodeType === Node.ELEMENT_NODE || child.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        walk(child)
      }
    }
  }

  walk(body)
  return body.innerHTML
}
