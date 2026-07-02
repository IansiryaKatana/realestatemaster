import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { tryGetSupabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/database.types'
import { AdminTabHub } from '@/admin/components/AdminTabHub'
import { AdminLoadingState, AdminErrorBanner } from '@/admin/components/AdminPageHeading'
import { AdminSheet } from '@/admin/components/AdminSheet'
import { EntityDetailSheet } from '@/admin/components/EntityDetailSheet'
import { ImageUploadField } from '@/admin/components/ImageUploadField'
import { AdminClickableTableRow, AdminTableStopCell } from '@/admin/components/AdminClickableTableRow'
import { AdminRowActions, adminTableActionsCellClass, adminTableActionsHeadClass, crudRowActions } from '@/admin/components/AdminRowActions'
import { adminBtnPrimary, adminBtnSecondary, adminInput, adminLabel } from '@/admin/adminClassNames'
import { upsertSiteSettings } from '@/admin/lib/siteSettingsAdmin'
import { useCms } from '@/contexts/CmsContext'
import { fetchPropertyLookups } from '@/lib/property/propertyLookups'
import { AdminPropertyTransactions } from '@/admin/AdminPropertyTransactions'
import { AdminInvoices } from '@/admin/AdminInvoices'

const TABS = [
  { id: 'agency', label: 'Agency' },
  { id: 'agents', label: 'Agents' },
  { id: 'inquiries', label: 'Inquiries' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'invoices', label: 'Invoices' },
] as const

type TabId = (typeof TABS)[number]['id']

export const REAL_ESTATE_TABS = TABS.map((t) => t.id) as unknown as readonly [TabId, ...TabId[]]
export const REAL_ESTATE_DEFAULT_TAB: TabId = 'agency'

export function AdminRealEstateHub({ tab }: { tab: TabId }) {
  return (
    <AdminTabHub
      title="Real Estate"
      subtitle="Agency settings, agents, inquiries, and property transaction lifecycle."
      hubPath="/admin/real-estate"
      tabs={[
        { id: 'agency', label: 'Agency', content: <AdminAgencySettings /> },
        { id: 'agents', label: 'Agents', content: <AdminAgents /> },
        { id: 'inquiries', label: 'Inquiries', content: <AdminPropertyInquiries /> },
        { id: 'transactions', label: 'Transactions', content: <AdminPropertyTransactions /> },
        { id: 'invoices', label: 'Invoices', content: <AdminInvoices /> },
      ]}
      activeTab={tab}
    />
  )
}

const AGENCY_FIELD_LABELS: Record<string, string> = {
  agency_name: 'Agency name',
  trade_license_number: 'Trade license number',
  rera_number: 'RERA number',
  company_email: 'Company email',
  company_phone: 'Company phone',
  company_whatsapp: 'Company WhatsApp',
  company_address: 'Company address',
  signatory_name: 'Signatory name',
  signatory_title: 'Signatory title',
  default_contract_terms: 'Default contract terms',
  default_payment_terms: 'Default payment terms',
  default_security_deposit_rules: 'Default security deposit rules',
  default_commission_rules: 'Default commission rules',
}

function AdminAgencySettings() {
  const { refetchCms } = useCms()
  const [row, setRow] = useState<Database['public']['Tables']['agency_settings']['Row'] | null>(null)
  const [faviconUrl, setFaviconUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = tryGetSupabase()
    const [agencyResult, faviconResult] = await Promise.all([
      supabase.from('agency_settings').select('*').limit(1).maybeSingle(),
      supabase.from('site_settings').select('value').eq('key', 'favicon_url').maybeSingle(),
    ])
    if (agencyResult.error) toast.error(agencyResult.error.message)
    if (faviconResult.error) toast.error(faviconResult.error.message)
    setRow(agencyResult.data)
    setFaviconUrl(faviconResult.data?.value ?? '')
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <AdminLoadingState />

  const form = row ?? {
    id: '',
    agency_name: '',
    trade_license_number: '',
    rera_number: '',
    company_email: '',
    company_phone: '',
    company_whatsapp: '',
    company_address: '',
    logo_url: '',
    signatory_name: '',
    signatory_title: '',
    default_contract_terms: '',
    default_payment_terms: '',
    default_service_charges: 0,
    default_security_deposit_rules: '',
    default_commission_rules: '',
    created_at: '',
    updated_at: '',
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setRow((r) => ({ ...(r ?? form), [key]: value }))
  }

  async function save() {
    setSaving(true)
    const payload = { ...form, updated_at: new Date().toISOString() }
    const supabase = tryGetSupabase()
    const { error } = form.id
      ? await supabase.from('agency_settings').update(payload).eq('id', form.id)
      : await supabase.from('agency_settings').insert(payload)

    if (error) {
      setSaving(false)
      toast.error(error.message)
      return
    }

    try {
      await upsertSiteSettings(['favicon_url'], [{ key: 'favicon_url', value: faviconUrl }])
      await refetchCms()
      toast.success('Agency settings saved')
      void load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Agency saved but favicon failed to update')
      void load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminErrorBanner message={null} />

      <div className="admin-section space-y-4">
        <div>
          <h2 className="font-semibold">Brand assets</h2>
          <p className="text-sm text-[var(--admin-muted)]">
            Logo appears on contracts and agency documents. Favicon is shown in browser tabs across the storefront.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ImageUploadField
            label="Logo"
            value={form.logo_url ?? ''}
            onChange={(url) => updateField('logo_url', url || null)}
            folder="brand"
          />
          <ImageUploadField
            label="Favicon"
            value={faviconUrl}
            onChange={setFaviconUrl}
            folder="brand"
          />
        </div>
      </div>

      <div className="admin-section space-y-4">
        <h2 className="font-semibold">Company details</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(['agency_name', 'trade_license_number', 'rera_number', 'company_email', 'company_phone', 'company_whatsapp'] as const).map((key) => (
            <div key={key}>
              <label className={adminLabel}>{AGENCY_FIELD_LABELS[key]}</label>
              <input
                className={adminInput}
                value={form[key] ?? ''}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          ))}
          <div className="md:col-span-2 lg:col-span-3">
            <label className={adminLabel}>{AGENCY_FIELD_LABELS.company_address}</label>
            <input
              className={adminInput}
              value={form.company_address ?? ''}
              onChange={(e) => updateField('company_address', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-section space-y-4">
        <h2 className="font-semibold">Signatory</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(['signatory_name', 'signatory_title'] as const).map((key) => (
            <div key={key}>
              <label className={adminLabel}>{AGENCY_FIELD_LABELS[key]}</label>
              <input
                className={adminInput}
                value={form[key] ?? ''}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section space-y-4">
        <h2 className="font-semibold">Default terms</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={adminLabel}>Default service charges</label>
            <input
              className={adminInput}
              type="number"
              value={form.default_service_charges ?? 0}
              onChange={(e) => updateField('default_service_charges', Number(e.target.value))}
            />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {(['default_contract_terms', 'default_payment_terms', 'default_security_deposit_rules', 'default_commission_rules'] as const).map((key) => (
            <div key={key}>
              <label className={adminLabel}>{AGENCY_FIELD_LABELS[key]}</label>
              <textarea
                className={`${adminInput} min-h-24 py-2`}
                value={form[key] ?? ''}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <button type="button" className={adminBtnPrimary} disabled={saving} onClick={() => void save()}>
        {saving ? 'Saving…' : 'Save agency settings'}
      </button>
    </div>
  )
}

function AdminAgents() {
  type AgentRow = Database['public']['Tables']['agents']['Row']

  const [rows, setRows] = useState<AgentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AgentRow | null>(null)
  const [detail, setDetail] = useState<AgentRow | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    license_number: '',
    photo_url: '',
    auth_user_id: '',
    is_active: true,
    default_commission_type: 'percent',
    default_commission_value: '5',
  })

  const emptyForm = () => ({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    license_number: '',
    photo_url: '',
    auth_user_id: '',
    is_active: true,
    default_commission_type: 'percent',
    default_commission_value: '5',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await tryGetSupabase().from('agents').select('*').order('name')
    if (error) toast.error(error.message)
    setRows(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setSheetOpen(true)
  }

  function openEdit(agent: AgentRow) {
    setEditing(agent)
    setDetail(null)
    setForm({
      name: agent.name,
      email: agent.email,
      phone: agent.phone ?? '',
      whatsapp: agent.whatsapp ?? '',
      license_number: agent.license_number ?? '',
      photo_url: agent.photo_url ?? '',
      auth_user_id: agent.auth_user_id ?? '',
      is_active: agent.is_active,
      default_commission_type: agent.default_commission_type,
      default_commission_value: String(agent.default_commission_value),
    })
    setSheetOpen(true)
  }

  async function saveAgent() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      license_number: form.license_number.trim() || null,
      photo_url: form.photo_url.trim() || null,
      auth_user_id: form.auth_user_id.trim() || null,
      is_active: form.is_active,
      default_commission_type: form.default_commission_type,
      default_commission_value: Number(form.default_commission_value) || 0,
      updated_at: new Date().toISOString(),
    }
    const supabase = tryGetSupabase()
    const { error } = editing
      ? await supabase.from('agents').update(payload).eq('id', editing.id)
      : await supabase.from('agents').insert(payload)
    setSaving(false)
    if (error) toast.error(error.message)
    else {
      toast.success(editing ? 'Agent updated' : 'Agent created')
      setSheetOpen(false)
      void load()
    }
  }

  async function removeAgent(row: AgentRow) {
    if (!window.confirm(`Delete agent "${row.name}"?`)) return
    const { error } = await tryGetSupabase().from('agents').delete().eq('id', row.id)
    if (error) toast.error(error.message)
    else {
      toast.success('Agent deleted')
      if (detail?.id === row.id) setDetail(null)
      void load()
    }
  }

  if (loading) return <AdminLoadingState />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" className={adminBtnPrimary} onClick={openCreate}>Add agent</button>
      </div>

      <div className="admin-table-frame">
        <div className="admin-table-wrap">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--admin-surface)] text-[var(--admin-muted)]">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Portal</th>
                <th className="px-4 py-3">Status</th>
                <th className={adminTableActionsHeadClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((agent) => (
                <AdminClickableTableRow key={agent.id} onOpen={() => setDetail(agent)}>
                  <td className="px-4 py-3">
                    {agent.photo_url ? (
                      <img src={agent.photo_url} alt="" className="h-10 w-10 rounded-[var(--admin-radius)] object-cover" />
                    ) : (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--admin-radius)] bg-[var(--admin-surface)] text-xs text-[var(--admin-muted)]">
                        {agent.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{agent.name}</td>
                  <td className="px-4 py-3">{agent.email}</td>
                  <td className="px-4 py-3">{agent.license_number ?? '—'}</td>
                  <td className="px-4 py-3">{agent.auth_user_id ? 'Linked' : '—'}</td>
                  <td className="px-4 py-3">{agent.is_active ? 'Active' : 'Inactive'}</td>
                  <AdminTableStopCell className={adminTableActionsCellClass}>
                    <AdminRowActions
                      label={`Actions for ${agent.name}`}
                      actions={crudRowActions({
                        onView: () => setDetail(agent),
                        onEdit: () => openEdit(agent),
                        onDelete: () => void removeAgent(agent),
                      })}
                    />
                  </AdminTableStopCell>
                </AdminClickableTableRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={editing ? 'Edit agent' : 'New agent'}
        onSave={() => void saveAgent()}
        saving={saving}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUploadField
              label="Profile photo"
              value={form.photo_url}
              onChange={(url) => setForm((f) => ({ ...f, photo_url: url }))}
              folder="agents"
            />
          </div>
          {(['name', 'email', 'phone', 'whatsapp', 'license_number', 'auth_user_id'] as const).map((key) => (
            <div key={key}>
              <label className={adminLabel}>
                {key === 'auth_user_id'
                  ? 'Auth user ID (Supabase UUID)'
                  : key === 'phone'
                    ? 'Phone (Call button)'
                    : key === 'whatsapp'
                      ? 'WhatsApp number (alerts & chat link)'
                      : key.replace(/_/g, ' ')}
              </label>
              <input className={adminInput} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className={adminLabel}>Commission type</label>
            <select className={adminInput} value={form.default_commission_type} onChange={(e) => setForm((f) => ({ ...f, default_commission_type: e.target.value }))}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div>
            <label className={adminLabel}>Commission value</label>
            <input className={adminInput} type="number" value={form.default_commission_value} onChange={(e) => setForm((f) => ({ ...f, default_commission_value: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            Active
          </label>
        </div>
      </AdminSheet>

      <EntityDetailSheet
        open={!!detail}
        onOpenChange={(open) => !open && setDetail(null)}
        title={detail?.name ?? ''}
        subtitle={detail?.email}
        fields={
          detail
            ? [
                {
                  label: 'Photo',
                  value: detail.photo_url ? (
                    <img src={detail.photo_url} alt="" className="h-20 w-20 rounded-[var(--admin-radius)] object-cover" />
                  ) : (
                    '—'
                  ),
                },
                { label: 'Phone', value: detail.phone },
                { label: 'WhatsApp', value: detail.whatsapp },
                { label: 'License', value: detail.license_number },
                { label: 'Portal', value: detail.auth_user_id ? 'Linked' : 'Not linked' },
                { label: 'Commission', value: `${detail.default_commission_value} (${detail.default_commission_type})` },
                { label: 'Status', value: detail.is_active ? 'Active' : 'Inactive' },
              ]
            : []
        }
        footer={
          detail ? (
            <button type="button" className={`${adminBtnSecondary} w-full`} onClick={() => openEdit(detail)}>
              Edit agent
            </button>
          ) : null
        }
      />
    </div>
  )
}

function AdminPropertyInquiries() {
  const [rows, setRows] = useState<Database['public']['Tables']['property_inquiries']['Row'][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const { data, error } = await tryGetSupabase()
        .from('property_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) toast.error(error.message)
      setRows(data ?? [])
      setLoading(false)
    })()
  }, [])

  if (loading) return <AdminLoadingState />

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <article key={row.id} className="admin-card p-4">
          <p className="font-medium">{row.full_name} · {row.email}</p>
          <p className="text-sm text-[var(--admin-muted)]">{row.interest_type} · {row.status}</p>
          {row.message ? <p className="mt-2 text-sm">{row.message}</p> : null}
        </article>
      ))}
    </div>
  )
}

export { fetchPropertyLookups }
