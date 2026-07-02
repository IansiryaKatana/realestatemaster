import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Database } from '@/integrations/supabase/database.types'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'

type AgentRow = Database['public']['Tables']['agents']['Row']

type AgentAuthContextValue = {
  agent: AgentRow | null
  loading: boolean
  isAgent: boolean
  refetch: () => Promise<void>
}

const AgentAuthContext = createContext<AgentAuthContextValue | null>(null)

export function AgentAuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useStorefrontAuth()
  const [agent, setAgent] = useState<AgentRow | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const supabase = tryGetSupabase()
    if (!supabase || !user) {
      setAgent(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      setAgent(null)
    } else {
      setAgent(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void refetch()
  }, [authLoading, refetch])

  const value = useMemo(
    () => ({ agent, loading: authLoading || loading, isAgent: Boolean(agent), refetch }),
    [agent, authLoading, loading, refetch],
  )

  return <AgentAuthContext.Provider value={value}>{children}</AgentAuthContext.Provider>
}

export function useAgentAuth() {
  const ctx = useContext(AgentAuthContext)
  if (!ctx) throw new Error('useAgentAuth must be used within AgentAuthProvider')
  return ctx
}
