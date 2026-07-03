import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { fetchClientProfile, upsertClientProfile } from '@/lib/property/propertyTransactionQueries'
import { profileSchema, type ProfileFormValues } from '@/lib/validators/profile.schema'
import { PageHero } from '@/components/layout/PageHero'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormNationalitySelect } from '@/components/ui/NationalitySelect'
import { FormPhoneInput } from '@/components/ui/phone-input-field'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/account/profile')({
  component: AccountProfilePage,
  head: () => ({ meta: [{ title: 'My Profile | GW Vacation Homes' }] }),
})

const EMPTY_PROFILE: ProfileFormValues = {
  full_name: '',
  phone: '',
  address: '',
  emirates_id: '',
  passport_number: '',
  nationality: '',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

function AccountProfilePage() {
  const { user, loading: authLoading } = useStorefrontAuth()
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['client-profile'],
    queryFn: fetchClientProfile,
    enabled: Boolean(user),
  })
  const [saving, setSaving] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: EMPTY_PROFILE,
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        emirates_id: profile.emirates_id ?? '',
        passport_number: profile.passport_number ?? '',
        nationality: profile.nationality ?? '',
      })
    }
  }, [profile, reset])

  async function onSubmit(values: ProfileFormValues) {
    setSaving(true)
    try {
      await upsertClientProfile(values)
      toast.success('Profile saved')
      void refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <StorefrontLayout>
        <SectionContainer className="flex flex-1 items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </SectionContainer>
      </StorefrontLayout>
    )
  }

  if (!user) {
    return (
      <StorefrontLayout>
        <PageHero title="My profile" />
        <SectionContainer className="py-10 text-center">
          <Button asChild><Link to="/account">Sign in</Link></Button>
        </SectionContainer>
      </StorefrontLayout>
    )
  }

  const invalidClass = (field: keyof ProfileFormValues) =>
    cn(errors[field] && 'border-red-500 focus-visible:ring-red-500/30')

  return (
    <StorefrontLayout>
      <PageHero title="My profile" subtitle="Used for contracts and property applications" backTo="/account" backLabel="Back to account" />
      <SectionContainer className="max-w-2xl py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="profile-full-name">
              Full name
            </label>
            <Input
              id="profile-full-name"
              placeholder="As on your ID or passport"
              className={invalidClass('full_name')}
              {...register('full_name')}
            />
            <FieldError message={errors.full_name?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Nationality</label>
            <FormNationalitySelect control={control} fieldName="nationality" />
            <FieldError message={errors.nationality?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="profile-emirates-id">
              Emirates ID
            </label>
            <Input
              id="profile-emirates-id"
              placeholder="784-1990-1234567-1"
              className={invalidClass('emirates_id')}
              {...register('emirates_id')}
            />
            <FieldError message={errors.emirates_id?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="profile-passport">
              Passport number
            </label>
            <Input
              id="profile-passport"
              placeholder="e.g. N1234567"
              className={invalidClass('passport_number')}
              {...register('passport_number')}
            />
            <FieldError message={errors.passport_number?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="profile-phone">
              Phone
            </label>
            <FormPhoneInput control={control} fieldName="phone" id="profile-phone" variant="public" />
            <FieldError message={errors.phone?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="profile-address">
              Address
            </label>
            <Textarea
              id="profile-address"
              rows={3}
              className={invalidClass('address')}
              {...register('address')}
            />
            <FieldError message={errors.address?.message} />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </form>
      </SectionContainer>
    </StorefrontLayout>
  )
}
