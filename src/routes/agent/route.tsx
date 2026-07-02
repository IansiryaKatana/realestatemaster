import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { AgentAuthProvider, useAgentAuth } from '@/contexts/AgentAuthContext'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { AgentShell } from '@/agent/AgentShell'
import { isSupabaseConfigured } from '@/integrations/supabase/client'

export const Route = createFileRoute('/agent')({
  component: AgentRouteWrapper,
})

function AgentRouteWrapper() {
  return (
    <AgentAuthProvider>
      <AgentGate />
    </AgentAuthProvider>
  )
}

function AgentGate() {
  const { user, loading: authLoading } = useStorefrontAuth()
  const { isAgent, loading: agentLoading } = useAgentAuth()

  if (!isSupabaseConfigured()) {
    return <p className="p-6">Supabase is not configured.</p>
  }

  if (authLoading || agentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    )
  }

  if (!user) return <Navigate to="/account" />
  if (!isAgent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Agent access required</h1>
          <p className="mt-2 text-muted">This account is not linked to an active agent profile.</p>
        </div>
      </div>
    )
  }

  return (
    <AgentShell>
      <Outlet />
    </AgentShell>
  )
}
