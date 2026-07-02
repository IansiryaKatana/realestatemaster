import type { ReactNode } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Mail, Phone, PhoneCall } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { toWhatsAppHref } from '@/lib/contactLinks'
import type { Product } from '@/data/static-cms'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { submitPropertyInquiry } from '@/lib/property/submitPropertyInquiry'
import { submitPropertyCallback } from '@/lib/property/submitPropertyCallback'
import { propertyInterestType, resolvePropertyMeta } from '@/lib/property/formatProperty'
import type { PropertyLookups } from '@/lib/property/propertyLookups'
import { productSectionProseClass } from '@/components/product/ProductFeatureBlocks'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type PropertyAgentMeta = ReturnType<typeof resolvePropertyMeta>

const emailSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(6, 'Phone is required'),
})

const callbackSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().min(6, 'Phone is required'),
})

type PropertyAgentContentProps = {
  product: Product
  meta: PropertyAgentMeta
}

export function PropertyAgentContent({ product, meta }: PropertyAgentContentProps) {
  const { user } = useStorefrontAuth()
  const [emailOpen, setEmailOpen] = useState(false)
  const [callbackOpen, setCallbackOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const interestLabel = product.listingType === 'rent' ? 'Renting' : product.listingType === 'sale' ? 'Buying' : 'Renting / Buying'
  const agentWhatsAppHref = meta.agentWhatsapp
    ? toWhatsAppHref(
        meta.agentWhatsapp,
        `Hello, I am interested in ${product.name}${product.propertyReference ? ` (${product.propertyReference})` : ''}.`,
      )
    : null

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { fullName: '', email: user?.email ?? '', phone: '' },
  })

  const callbackForm = useForm<z.infer<typeof callbackSchema>>({
    resolver: zodResolver(callbackSchema),
    defaultValues: { fullName: '', phone: '' },
  })

  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    setSubmitting(true)
    const result = await submitPropertyInquiry({
      product,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      interestType: propertyInterestType(product.listingType),
      requestViewing: false,
      message: `Email inquiry via assigned agent section for ${product.name} (${product.propertyReference ?? product.slug}).`,
    })
    setSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Your email inquiry has been sent.')
    setEmailOpen(false)
    emailForm.reset()
  }

  async function onCallbackSubmit(values: z.infer<typeof callbackSchema>) {
    setSubmitting(true)
    const result = await submitPropertyCallback({
      propertyId: product.id,
      fullName: values.fullName,
      phone: values.phone,
    })
    setSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Callback request sent. An agent will call you shortly.')
    setCallbackOpen(false)
    callbackForm.reset()
  }

  return (
    <>
      <div className={productSectionProseClass}>
        <div className="flex flex-col gap-4">
          <div className="flex items-stretch gap-4">
            <div className="size-24 shrink-0 overflow-hidden rounded-xl">
              {meta.agentPhotoUrl ? (
                <img src={meta.agentPhotoUrl} alt={meta.agentName ?? 'Agent'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-cta-brown/10 text-2xl font-bold text-cta-brown">
                  {meta.agentName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <p className="font-display text-xl font-extrabold text-text-brown">{meta.agentName}</p>
              {meta.agentLicense ? <p className="text-sm text-muted">License: {meta.agentLicense}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
              {meta.agentPhone ? (
                <a
                  href={`tel:${meta.agentPhone}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-sm font-semibold text-text-brown transition-colors hover:bg-white/60"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </a>
              ) : null}
              {meta.agentEmail ? (
                <button
                  type="button"
                  onClick={() => setEmailOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-sm font-semibold text-text-brown transition-colors hover:bg-white/60"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </button>
              ) : null}
              {agentWhatsAppHref ? (
                <a
                  href={agentWhatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#1da851]"
                >
                  <WhatsAppIcon className="size-3.5 shrink-0" />
                  WhatsApp
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setCallbackOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-sm font-semibold text-text-brown transition-colors hover:bg-white/60"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Request callback
              </button>
          </div>
        </div>
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>Email agent</DialogTitle>
            <p className="text-sm text-muted">{product.name}</p>
          </DialogHeader>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">Full name</label>
              <Input {...emailForm.register('fullName')} />
              {emailForm.formState.errors.fullName ? (
                <p className="mt-1 text-xs text-red-600">{emailForm.formState.errors.fullName.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Email</label>
              <Input type="email" {...emailForm.register('email')} />
              {emailForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-600">{emailForm.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Phone</label>
              <Input type="tel" {...emailForm.register('phone')} />
              {emailForm.formState.errors.phone ? (
                <p className="mt-1 text-xs text-red-600">{emailForm.formState.errors.phone.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Interested in</label>
              <Input readOnly value={`${interestLabel} — ${product.name}`} />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send email'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
        <DialogContent className="p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>Request a callback</DialogTitle>
            <p className="text-sm text-muted">{product.name}</p>
          </DialogHeader>
          <form onSubmit={callbackForm.handleSubmit(onCallbackSubmit)} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">Full name</label>
              <Input {...callbackForm.register('fullName')} />
              {callbackForm.formState.errors.fullName ? (
                <p className="mt-1 text-xs text-red-600">{callbackForm.formState.errors.fullName.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Phone number</label>
              <Input type="tel" {...callbackForm.register('phone')} />
              {callbackForm.formState.errors.phone ? (
                <p className="mt-1 text-xs text-red-600">{callbackForm.formState.errors.phone.message}</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Request callback'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function buildPropertyAgentSection(
  product: Product,
  lookups: PropertyLookups,
): { label: string; content: ReactNode } | null {
  const meta = resolvePropertyMeta(product, lookups)
  if (!meta.agentName) return null

  return {
    label: 'Assigned agent',
    content: <PropertyAgentContent product={product} meta={meta} />,
  }
}
