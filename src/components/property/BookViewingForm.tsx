import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/data/static-cms'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { submitPropertyInquiry } from '@/lib/property/submitPropertyInquiry'
import { propertyInterestType } from '@/lib/property/formatProperty'
import {
  VIEWING_TIME_SLOTS,
  type ViewingTimeSlotId,
  viewingSlotTime,
} from '@/lib/property/viewingTimeSlots'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const contactSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(6, 'Phone is required'),
})

type ContactValues = z.infer<typeof contactSchema>

type BookViewingFormProps = {
  product: Product
  onSuccess?: () => void
  onCancel?: () => void
  showCancel?: boolean
}

function buildCalendarDays(month: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const startOffset = firstDay.getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: Array<{ date: Date | null; key: string }> = []

  for (let i = 0; i < startOffset; i++) {
    cells.push({ date: null, key: `blank-${i}` })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day)
    cells.push({ date, key: date.toISOString() })
  }
  return cells
}

function formatIsoDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function BookViewingForm({ product, onSuccess, onCancel, showCancel = true }: BookViewingFormProps) {
  const { user } = useStorefrontAuth()
  const [step, setStep] = useState(0)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<ViewingTimeSlotId | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const calendarDays = useMemo(() => buildCalendarDays(month), [month])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: user?.email ?? '',
      phone: '',
    },
  })

  function resetFlow() {
    setStep(0)
    setSelectedDate(null)
    setSelectedSlot(null)
    reset()
  }

  function handleCancel() {
    resetFlow()
    onCancel?.()
  }

  async function onSubmitContact(values: ContactValues) {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please choose a date and time')
      return
    }

    setSubmitting(true)
    const result = await submitPropertyInquiry({
      product,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      interestType: propertyInterestType(product.listingType),
      preferredViewingDate: selectedDate,
      preferredViewingTime: viewingSlotTime(selectedSlot),
      requestViewing: true,
    })
    setSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Viewing request sent. You will be notified once the agent confirms.')
    resetFlow()
    onSuccess?.()
  }

  const monthLabel = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {['Date', 'Time', 'Details'].map((label, index) => (
          <div
            key={label}
            className={cn(
              'flex-1 rounded-md border px-2 py-1 text-center text-xs font-semibold',
              step === index ? 'border-cta-brown bg-cta-brown/10 text-cta-brown' : 'border-border/50 text-muted',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="font-semibold text-text-brown">{monthLabel}</p>
            <Button type="button" variant="outline" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell) => {
              if (!cell.date) return <div key={cell.key} />
              const iso = formatIsoDate(cell.date)
              const disabled = cell.date < today
              const selected = selectedDate === iso
              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedDate(iso)}
                  className={cn(
                    'h-9 rounded-md text-sm font-medium transition-colors',
                    disabled && 'cursor-not-allowed text-muted/40',
                    !disabled && !selected && 'hover:bg-cta-brown/10',
                    selected && 'bg-cta-brown text-white',
                  )}
                >
                  {cell.date.getDate()}
                </button>
              )
            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {showCancel ? (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            ) : null}
            <Button type="button" disabled={!selectedDate} onClick={() => setStep(1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">Choose a preferred time on {selectedDate}</p>
          <div className="grid gap-2">
            {VIEWING_TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlot(slot.id)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-left transition-colors',
                  selectedSlot === slot.id
                    ? 'border-cta-brown bg-cta-brown/10'
                    : 'border-border/50 hover:border-cta-brown/40',
                )}
              >
                <p className="font-semibold text-text-brown">{slot.label}</p>
                <p className="text-sm text-muted">{slot.hint}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="button" disabled={!selectedSlot} onClick={() => setStep(2)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-3">
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
            <Input type="tel" {...register('phone')} />
            {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
