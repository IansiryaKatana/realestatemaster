import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { LandlordAuthProvider, useLandlordAuth } from '@/contexts/LandlordAuthContext'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { OwnerShell } from '@/owner/OwnerShell'
import { isSupabaseConfigured } from '@/integrations/supabase/client'

export const Route = createFileRoute('/owner')({
  component: OwnerRouteWrapper,
})

function OwnerRouteWrapper() {
  return (
    <LandlordAuthProvider>
      <OwnerGate />
    </LandlordAuthProvider>
  )
}

function OwnerGate() {
  const { user, loading: authLoading } = useStorefrontAuth()
  const { isLandlord, loading: landlordLoading } = useLandlordAuth()

  if (!isSupabaseConfigured()) {
    return <p className="p-6">Supabase is not configured.</p>
  }

  if (authLoading || landlordLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    )
  }

  if (!user) return <Navigate to="/account" />
  if (!isLandlord) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Owner access required</h1>
          <p className="mt-2 text-muted">This account is not linked to a property owner profile.</p>
        </div>
      </div>
    )
  }

  return (
    <OwnerShell>
      <Outlet />
    </OwnerShell>
  )
}
