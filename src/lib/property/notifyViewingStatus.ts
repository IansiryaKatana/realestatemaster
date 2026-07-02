import { tryGetSupabase } from '@/integrations/supabase/client'

export async function notifyViewingStatus(input: {
  viewingId: string
  action?: 'approve' | 'decline' | 'cancel'
  scheduledDate?: string
  scheduledTime?: string
}) {
  const supabase = tryGetSupabase()
  if (!supabase) return { ok: false as const, error: 'Database is not configured' }

  const { data: sessionData } = await supabase.auth.getSession()
  const headers: Record<string, string> = {}
  if (sessionData.session?.access_token) {
    headers.Authorization = `Bearer ${sessionData.session.access_token}`
  }

  const { data, error } = await supabase.functions.invoke('notify-viewing-status', {
    body: {
      viewing_id: input.viewingId,
      action: input.action ?? 'approve',
      scheduled_date: input.scheduledDate ?? null,
      scheduled_time: input.scheduledTime ?? null,
    },
    headers,
  })

  if (error) return { ok: false as const, error: error.message }
  const result = data as { ok?: boolean; error?: string }
  if (!result?.ok) return { ok: false as const, error: result?.error ?? 'Notification failed' }
  return { ok: true as const }
}
