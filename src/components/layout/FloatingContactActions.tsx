import { Phone } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { useCms } from '@/contexts/CmsContext'
import { getContactSettings } from '@/lib/contactLinks'
import { cn } from '@/lib/utils'

const btnBase =
  'pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-brown/40'

export function FloatingContactActions() {
  const { snapshot } = useCms()
  const { telHref, whatsAppHref } = getContactSettings(snapshot.siteSettings)

  if (!telHref && !whatsAppHref) return null

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col gap-3"
      aria-label="Quick contact"
    >
      {telHref ? (
        <a
          href={telHref}
          className={cn(btnBase, 'bg-cta-brown text-white hover:bg-cta-brown/90')}
          aria-label="Call us"
          title="Call us"
        >
          <Phone className="h-5 w-5" />
        </a>
      ) : null}
      {whatsAppHref ? (
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(btnBase, 'bg-[#25D366] text-white hover:bg-[#20bd5a]')}
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      ) : null}
    </div>
  )
}
