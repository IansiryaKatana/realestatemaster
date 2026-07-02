import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { fetchMoveInChecklist, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/tenant/move-in')({
  component: TenantMoveInPage,
})

function TenantMoveInPage() {
  const { lease } = useTenantAuth()
  const queryClient = useQueryClient()

  const { data: checklist, isLoading } = useQuery({
    queryKey: lease?.id ? [...tenancyKeys.all, 'move-in', lease.id] : ['skip'],
    queryFn: () => fetchMoveInChecklist(lease!.id),
    enabled: Boolean(lease?.id),
  })

  async function toggleItem(itemId: string, done: boolean) {
    if (!checklist?.id) return
    const supabase = tryGetSupabase()
    if (!supabase) return
    const { data, error } = await supabase.rpc('rpc_toggle_move_in_item', {
      p_checklist_id: checklist.id,
      p_item_id: itemId,
      p_done: done,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    const result = data as { ok: boolean; error?: string }
    if (!result.ok) {
      toast.error(result.error ?? 'Update failed')
      return
    }
    void queryClient.invalidateQueries({ queryKey: tenancyKeys.all })
  }

  const items = checklist?.items ?? []

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Move-in checklist</h1>
      {isLoading ? (
        <p className="text-muted">Loading checklist…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">Your move-in checklist will appear here after lease activation.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-xl border border-[#e8e0d4] bg-white p-4">
              <span className={item.done ? 'text-muted line-through' : 'font-medium'}>{item.label}</span>
              <Button
                size="sm"
                variant={item.done ? 'outline' : 'default'}
                onClick={() => void toggleItem(item.id, !item.done)}
              >
                {item.done ? 'Undo' : 'Mark done'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
