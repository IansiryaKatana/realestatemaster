import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { fetchClientProfile, upsertClientProfile } from '@/lib/property/propertyTransactionQueries'
import { PageHero } from '@/components/layout/PageHero'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInputField } from '@/components/ui/phone-input-field'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/account/profile')({
  component: AccountProfilePage,
  head: () => ({ meta: [{ title: 'My Profile | GW Vacation Homes' }] }),
})

function AccountProfilePage() {
  const { user, loading: authLoading } = useStorefrontAuth()
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['client-profile'],
    queryFn: fetchClientProfile,
    enabled: Boolean(user),
  })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    emirates_id: '',
    passport_number: '',
    nationality: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        emirates_id: profile.emirates_id ?? '',
        passport_number: profile.passport_number ?? '',
        nationality: profile.nationality ?? '',
      })
    }
  }, [profile])

  async function save() {
    setSaving(true)
    try {
      await upsertClientProfile(form)
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

  return (
    <StorefrontLayout>
      <PageHero title="My profile" subtitle="Used for contracts and property applications" backTo="/account" backLabel="Back to account" />
      <SectionContainer className="max-w-2xl py-10">
        <div className="grid gap-4">
          {(['full_name', 'nationality', 'emirates_id', 'passport_number'] as const).map((key) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-semibold capitalize">{key.replace(/_/g, ' ')}</label>
              <Input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-sm font-semibold">Phone</label>
            <PhoneInputField
              id="profile-phone"
              value={form.phone || undefined}
              onChange={(value) => setForm((f) => ({ ...f, phone: value ?? '' }))}
              variant="public"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Address</label>
            <Textarea rows={3} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <Button onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
        </div>
      </SectionContainer>
    </StorefrontLayout>
  )
}
