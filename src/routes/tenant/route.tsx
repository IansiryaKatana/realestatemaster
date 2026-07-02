import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { TenantAuthProvider, useTenantAuth } from '@/contexts/TenantAuthContext'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { TenantShell } from '@/tenant/TenantShell'
import { isSupabaseConfigured } from '@/integrations/supabase/client'

export const Route = createFileRoute('/tenant')({
  component: TenantRouteWrapper,
})

function TenantRouteWrapper() {
  return (
    <TenantAuthProvider>
      <TenantGate />
    </TenantAuthProvider>
  )
}

function TenantGate() {
  const { user, loading: authLoading } = useStorefrontAuth()
  const { isTenant, loading: tenantLoading } = useTenantAuth()

  if (!isSupabaseConfigured()) {
    return <p className="p-6">Supabase is not configured.</p>
  }

  if (authLoading || tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    )
  }

  if (!user) return <Navigate to="/account" />
  if (!isTenant) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Tenant access required</h1>
          <p className="mt-2 text-muted">You need an active lease to access the tenant portal.</p>
        </div>
      </div>
    )
  }

  return (
    <TenantShell>
      <Outlet />
    </TenantShell>
  )
}
