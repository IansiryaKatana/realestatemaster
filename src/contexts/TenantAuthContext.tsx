import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { fetchTenantActiveLease } from '@/lib/tenancy/tenancyQueries'
import type { LeaseRow } from '@/lib/tenancy/types'

type TenantLease = LeaseRow & {
  products: { name: string; slug: string; image_url: string | null; property_reference: string | null } | null
}

type TenantAuthContextValue = {
  lease: TenantLease | null
  loading: boolean
  isTenant: boolean
  refetch: () => Promise<void>
}

const TenantAuthContext = createContext<TenantAuthContextValue | null>(null)

export function TenantAuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useStorefrontAuth()
  const [lease, setLease] = useState<TenantLease | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!user || !tryGetSupabase()) {
      setLease(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchTenantActiveLease()
      setLease(data)
    } catch {
      setLease(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void refetch()
  }, [authLoading, refetch])

  const value = useMemo(
    () => ({ lease, loading: authLoading || loading, isTenant: Boolean(lease), refetch }),
    [lease, authLoading, loading, refetch],
  )

  return <TenantAuthContext.Provider value={value}>{children}</TenantAuthContext.Provider>
}

export function useTenantAuth() {
  const ctx = useContext(TenantAuthContext)
  if (!ctx) throw new Error('useTenantAuth must be used within TenantAuthProvider')
  return ctx
}
