import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { PropertyOwnerRow } from '@/lib/tenancy/types'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'

type LandlordAuthContextValue = {
  owner: PropertyOwnerRow | null
  loading: boolean
  isLandlord: boolean
  refetch: () => Promise<void>
}

const LandlordAuthContext = createContext<LandlordAuthContextValue | null>(null)

export function LandlordAuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useStorefrontAuth()
  const [owner, setOwner] = useState<PropertyOwnerRow | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const supabase = tryGetSupabase()
    if (!supabase || !user) {
      setOwner(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('property_owners')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    setOwner(error ? null : data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void refetch()
  }, [authLoading, refetch])

  const value = useMemo(
    () => ({ owner, loading: authLoading || loading, isLandlord: Boolean(owner), refetch }),
    [owner, authLoading, loading, refetch],
  )

  return <LandlordAuthContext.Provider value={value}>{children}</LandlordAuthContext.Provider>
}

export function useLandlordAuth() {
  const ctx = useContext(LandlordAuthContext)
  if (!ctx) throw new Error('useLandlordAuth must be used within LandlordAuthProvider')
  return ctx
}
