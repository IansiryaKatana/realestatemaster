import { BrandedSelect } from '@/components/ui/BrandedSelect'
import type { Database } from '@/integrations/supabase/database.types'
import { tryGetSupabase } from '@/integrations/supabase/client'
import { adminInput, adminLabel } from '@/admin/adminClassNames'
import type { PropertyLookups } from '@/lib/property/propertyLookups'

export type PropertyFieldsForm = {
  listing_type: string
  property_reference: string
  property_type_id: string
  property_status_id: string
  area_id: string
  furnishing_status_id: string
  assigned_agent_id: string
  bedrooms: string
  bathrooms: string
  size_sqft: string
  exact_address: string
  latitude: string
  longitude: string
  security_deposit: string
  other_charges: string
  agent_commission_type: string
  agent_commission_value: string
  rent_payment_cheques: string
  availability_date: string
  contract_terms: string
  amenity_ids: string[]
}

export const emptyPropertyFields = (): PropertyFieldsForm => ({
  listing_type: '',
  property_reference: '',
  property_type_id: '',
  property_status_id: '',
  area_id: '',
  furnishing_status_id: '',
  assigned_agent_id: '',
  bedrooms: '',
  bathrooms: '',
  size_sqft: '',
  exact_address: '',
  latitude: '',
  longitude: '',
  security_deposit: '',
  other_charges: '',
  agent_commission_type: 'percent',
  agent_commission_value: '',
  rent_payment_cheques: '12',
  availability_date: '',
  contract_terms: '',
  amenity_ids: [],
})

type PropertyFieldsEditorProps = {
  form: PropertyFieldsForm
  lookups: PropertyLookups
  onChange: (patch: Partial<PropertyFieldsForm>) => void
}

export function PropertyFieldsEditor({ form, lookups, onChange }: PropertyFieldsEditorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={adminLabel}>Listing type</label>
        <BrandedSelect allowEmpty emptyLabel="Not a property listing" value={form.listing_type} onValueChange={(v) => onChange({ listing_type: v })} options={[
          { value: 'rent', label: 'Rent' },
          { value: 'sale', label: 'Sale' },
        ]} />
      </div>
      <div>
        <label className={adminLabel}>Property reference</label>
        <input className={adminInput} value={form.property_reference} onChange={(e) => onChange({ property_reference: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Property type</label>
        <BrandedSelect allowEmpty emptyLabel="Select type" value={form.property_type_id} onValueChange={(v) => onChange({ property_type_id: v })} options={Object.entries(lookups.types).map(([id, row]) => ({ value: id, label: row.name }))} />
      </div>
      <div>
        <label className={adminLabel}>Area</label>
        <BrandedSelect allowEmpty emptyLabel="Select area" value={form.area_id} onValueChange={(v) => onChange({ area_id: v })} options={Object.entries(lookups.areas).map(([id, row]) => ({ value: id, label: row.name }))} />
      </div>
      <div>
        <label className={adminLabel}>Property status</label>
        <BrandedSelect allowEmpty emptyLabel="Select status" value={form.property_status_id} onValueChange={(v) => onChange({ property_status_id: v })} options={Object.entries(lookups.statuses).map(([id, row]) => ({ value: id, label: row.name }))} />
      </div>
      <div>
        <label className={adminLabel}>Furnishing</label>
        <BrandedSelect allowEmpty emptyLabel="Select furnishing" value={form.furnishing_status_id} onValueChange={(v) => onChange({ furnishing_status_id: v })} options={Object.entries(lookups.furnishing).map(([id, row]) => ({ value: id, label: row.name }))} />
      </div>
      <div>
        <label className={adminLabel}>Assigned agent</label>
        <BrandedSelect allowEmpty emptyLabel="Unassigned" value={form.assigned_agent_id} onValueChange={(v) => onChange({ assigned_agent_id: v })} options={Object.entries(lookups.agents).map(([id, row]) => ({ value: id, label: row.name }))} />
      </div>
      <div>
        <label className={adminLabel}>Bedrooms</label>
        <input className={adminInput} type="number" value={form.bedrooms} onChange={(e) => onChange({ bedrooms: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Bathrooms</label>
        <input className={adminInput} type="number" value={form.bathrooms} onChange={(e) => onChange({ bathrooms: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Size (sqft)</label>
        <input className={adminInput} type="number" value={form.size_sqft} onChange={(e) => onChange({ size_sqft: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <label className={adminLabel}>Exact address</label>
        <input className={adminInput} value={form.exact_address} onChange={(e) => onChange({ exact_address: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Latitude</label>
        <input className={adminInput} value={form.latitude} onChange={(e) => onChange({ latitude: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Longitude</label>
        <input className={adminInput} value={form.longitude} onChange={(e) => onChange({ longitude: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Security deposit</label>
        <input className={adminInput} type="number" value={form.security_deposit} onChange={(e) => onChange({ security_deposit: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Other charges</label>
        <input className={adminInput} type="number" value={form.other_charges} onChange={(e) => onChange({ other_charges: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Commission type</label>
        <BrandedSelect value={form.agent_commission_type} onValueChange={(v) => onChange({ agent_commission_type: v })} options={[
          { value: 'percent', label: 'Percent' },
          { value: 'fixed', label: 'Fixed' },
        ]} />
      </div>
      <div>
        <label className={adminLabel}>Commission value</label>
        <input className={adminInput} type="number" value={form.agent_commission_value} onChange={(e) => onChange({ agent_commission_value: e.target.value })} />
      </div>
      <div>
        <label className={adminLabel}>Rent payment cheques</label>
        <BrandedSelect
          allowEmpty
          emptyLabel="Not applicable"
          value={form.rent_payment_cheques}
          onValueChange={(v) => onChange({ rent_payment_cheques: v })}
          options={[
            { value: '1', label: '1 cheque (annual)' },
            { value: '2', label: '2 cheques' },
            { value: '4', label: '4 cheques' },
            { value: '6', label: '6 cheques' },
            { value: '12', label: '12 cheques (monthly)' },
          ]}
        />
      </div>
      <div>
        <label className={adminLabel}>Availability date</label>
        <input className={adminInput} type="date" value={form.availability_date} onChange={(e) => onChange({ availability_date: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <label className={adminLabel}>Contract terms</label>
        <textarea className={`${adminInput} min-h-24 py-2`} value={form.contract_terms} onChange={(e) => onChange({ contract_terms: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <label className={adminLabel}>Amenities</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(lookups.amenities).map(([id, row]) => {
            const checked = form.amenity_ids.includes(id)
            return (
              <label key={id} className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--admin-border)] px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? form.amenity_ids.filter((x) => x !== id) : [...form.amenity_ids, id]
                    onChange({ amenity_ids: next })
                  }}
                />
                {row.name}
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function propertyFieldsFromRow(row: Database['public']['Tables']['products']['Row']): PropertyFieldsForm {
  return {
    listing_type: row.listing_type ?? '',
    property_reference: row.property_reference ?? '',
    property_type_id: row.property_type_id ?? '',
    property_status_id: row.property_status_id ?? '',
    area_id: row.area_id ?? '',
    furnishing_status_id: row.furnishing_status_id ?? '',
    assigned_agent_id: row.assigned_agent_id ?? '',
    bedrooms: row.bedrooms != null ? String(row.bedrooms) : '',
    bathrooms: row.bathrooms != null ? String(row.bathrooms) : '',
    size_sqft: row.size_sqft != null ? String(row.size_sqft) : '',
    exact_address: row.exact_address ?? '',
    latitude: row.latitude != null ? String(row.latitude) : '',
    longitude: row.longitude != null ? String(row.longitude) : '',
    security_deposit: row.security_deposit != null ? String(row.security_deposit) : '',
    other_charges: row.other_charges != null ? String(row.other_charges) : '',
    agent_commission_type: row.agent_commission_type ?? 'percent',
    agent_commission_value: row.agent_commission_value != null ? String(row.agent_commission_value) : '',
    rent_payment_cheques: row.rent_payment_cheques != null ? String(row.rent_payment_cheques) : '',
    availability_date: row.availability_date ?? '',
    contract_terms: row.contract_terms ?? '',
    amenity_ids: [],
  }
}

export function propertyFieldsToPayload(form: PropertyFieldsForm) {
  return {
    listing_type: form.listing_type || null,
    property_reference: form.property_reference.trim() || null,
    property_type_id: form.property_type_id || null,
    property_status_id: form.property_status_id || null,
    area_id: form.area_id || null,
    furnishing_status_id: form.furnishing_status_id || null,
    assigned_agent_id: form.assigned_agent_id || null,
    bedrooms: form.bedrooms.trim() ? Number(form.bedrooms) : null,
    bathrooms: form.bathrooms.trim() ? Number(form.bathrooms) : null,
    size_sqft: form.size_sqft.trim() ? Number(form.size_sqft) : null,
    exact_address: form.exact_address.trim() || null,
    latitude: form.latitude.trim() ? Number(form.latitude) : null,
    longitude: form.longitude.trim() ? Number(form.longitude) : null,
    security_deposit: form.security_deposit.trim() ? Number(form.security_deposit) : null,
    other_charges: form.other_charges.trim() ? Number(form.other_charges) : null,
    agent_commission_type: form.listing_type ? form.agent_commission_type : null,
    agent_commission_value: form.agent_commission_value.trim() ? Number(form.agent_commission_value) : null,
    rent_payment_cheques:
      form.listing_type === 'rent' && form.rent_payment_cheques.trim()
        ? Number(form.rent_payment_cheques)
        : null,
    availability_date: form.availability_date || null,
    contract_terms: form.contract_terms.trim() || null,
  }
}

export async function loadPropertyAmenityIds(propertyId: string): Promise<string[]> {
  const { data, error } = await tryGetSupabase()
    .from('property_amenities')
    .select('amenity_id')
    .eq('property_id', propertyId)
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => row.amenity_id)
}

export async function syncPropertyAmenities(propertyId: string, amenityIds: string[]) {
  const supabase = tryGetSupabase()
  const { error: deleteError } = await supabase.from('property_amenities').delete().eq('property_id', propertyId)
  if (deleteError) throw new Error(deleteError.message)
  if (amenityIds.length === 0) return
  const { error: insertError } = await supabase.from('property_amenities').insert(
    amenityIds.map((amenity_id) => ({ property_id: propertyId, amenity_id })),
  )
  if (insertError) throw new Error(insertError.message)
}
