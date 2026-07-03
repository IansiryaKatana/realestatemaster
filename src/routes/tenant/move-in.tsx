import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { fetchMoveInChecklist, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
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
      ) : (
        <PortalDataTable
          columns={[
            { key: 'item', label: 'Item' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', className: 'text-right' },
          ]}
          isEmpty={items.length === 0}
          emptyMessage="Your move-in checklist will appear here after lease activation."
        >
          {items.map((item) => (
            <PortalTableRow key={item.id}>
              <PortalTableCell className={item.done ? 'text-muted line-through' : 'font-medium'}>
                {item.label}
              </PortalTableCell>
              <PortalTableCell className="capitalize">{item.done ? 'Done' : 'Pending'}</PortalTableCell>
              <PortalTableCell className="text-right">
                <Button
                  size="sm"
                  variant={item.done ? 'outline' : 'default'}
                  onClick={() => void toggleItem(item.id, !item.done)}
                >
                  {item.done ? 'Undo' : 'Mark done'}
                </Button>
              </PortalTableCell>
            </PortalTableRow>
          ))}
        </PortalDataTable>
      )}
    </div>
  )
}
