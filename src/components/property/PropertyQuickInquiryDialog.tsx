import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Product } from '@/data/static-cms'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { submitPropertyInquiry } from '@/lib/property/submitPropertyInquiry'
import { propertyInterestType } from '@/lib/property/formatProperty'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormPhoneInput } from '@/components/ui/phone-input-field'
import { phoneFieldSchema } from '@/lib/validators/phone.schema'

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: phoneFieldSchema,
})

type PropertyQuickInquiryDialogProps = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
}

export function PropertyQuickInquiryDialog({
  product,
  open,
  onOpenChange,
  title,
}: PropertyQuickInquiryDialogProps) {
  const { user } = useStorefrontAuth()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: user?.email ?? '', phone: '' },
  })

  async function onSubmit(values: z.infer<typeof schema>) {
    const result = await submitPropertyInquiry({
      product,
      ...values,
      interestType: propertyInterestType(product.listingType),
      requestViewing: false,
    })
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Your application has been submitted.')
    reset()
    onOpenChange(false)
  }

  const interestLabel = product.listingType === 'rent' ? 'Renting' : 'Buying'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted">{product.name}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Full name</label>
            <Input {...register('fullName')} />
            {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Email</label>
            <Input type="email" {...register('email')} />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Phone</label>
            <FormPhoneInput control={control} fieldName="phone" id="phone" variant="public" />
            {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Interested in</label>
            <Input readOnly value={`${interestLabel} — ${product.name}`} />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
