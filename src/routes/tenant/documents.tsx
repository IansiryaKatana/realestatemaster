import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTenantAuth } from '@/contexts/TenantAuthContext'
import { fetchTenantDocuments, tenancyKeys } from '@/lib/tenancy/tenancyQueries'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { FileUploadField } from '@/portals/components/FileUploadField'
import { PortalDataTable, PortalTableCell, PortalTableRow } from '@/portals/components/PortalDataTable'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/tenant/documents')({
  component: TenantDocumentsPage,
})

function TenantDocumentsPage() {
  const { lease } = useTenantAuth()
  const queryClient = useQueryClient()
  const [docType, setDocType] = useState('ejari')
  const [fileUrl, setFileUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: documents = [], isLoading } = useQuery({
    queryKey: lease?.id ? [...tenancyKeys.all, 'documents', lease.id] : ['skip'],
    queryFn: () => fetchTenantDocuments(lease!.id),
    enabled: Boolean(lease?.id),
  })

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!lease?.id || !fileUrl) {
      toast.error('Please upload a document file')
      return
    }
    setSaving(true)
    try {
      const supabase = tryGetSupabase()
      if (!supabase) throw new Error('Database is not configured')
      const { error } = await supabase.from('tenant_documents').insert({
        lease_id: lease.id,
        doc_type: docType,
        file_url: fileUrl,
      })
      if (error) throw error
      toast.success('Document uploaded')
      setFileUrl('')
      void queryClient.invalidateQueries({ queryKey: tenancyKeys.all })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-extrabold text-text-brown">Documents</h1>

      <form onSubmit={(e) => void handleUpload(e)} className="space-y-4 rounded-xl border border-[#e8e0d4] bg-white p-5">
        <h2 className="font-semibold">Upload document</h2>
        <select
          className="w-full rounded-md border border-input px-3 py-2 text-sm"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
        >
          <option value="ejari">Ejari</option>
          <option value="dewa">DEWA</option>
          <option value="lease">Lease</option>
          <option value="id">ID</option>
          <option value="other">Other</option>
        </select>
        <FileUploadField
          label="Document file"
          value={fileUrl}
          onChange={setFileUrl}
          folder={`documents/${lease?.id ?? 'unknown'}`}
          required
        />
        <Button type="submit" disabled={saving || !fileUrl}>
          {saving ? 'Saving…' : 'Upload'}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold">Your documents</h2>
        {isLoading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          <PortalDataTable
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'file', label: 'File' },
            ]}
            isEmpty={documents.length === 0}
            emptyMessage="No documents uploaded yet."
          >
            {documents.map((doc) => (
              <PortalTableRow key={doc.id}>
                <PortalTableCell className="capitalize font-medium">{doc.doc_type}</PortalTableCell>
                <PortalTableCell>
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-cta-brown underline">
                    View document
                  </a>
                </PortalTableCell>
              </PortalTableRow>
            ))}
          </PortalDataTable>
        )}
      </div>
    </div>
  )
}
