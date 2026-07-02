-- Real estate foundation: lookups, agency, agents, client profiles, property extensions

-- ── Lookup tables ─────────────────────────────────────────────────────────────
create table if not exists public.property_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  city text,
  country text default 'UAE',
  latitude numeric,
  longitude numeric,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.furnishing_statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.property_statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique not null,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.payment_charge_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique not null,
  applies_to text not null default 'both' check (applies_to in ('rent', 'sale', 'both')),
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ── Agency settings (singleton row) ───────────────────────────────────────────
create table if not exists public.agency_settings (
  id uuid primary key default gen_random_uuid(),
  agency_name text not null default '',
  trade_license_number text,
  rera_number text,
  company_email text,
  company_phone text,
  company_whatsapp text,
  company_address text,
  logo_url text,
  signatory_name text,
  signatory_title text,
  default_contract_terms text,
  default_payment_terms text,
  default_service_charges numeric(12,2) default 0,
  default_security_deposit_rules text,
  default_commission_rules text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Agents ────────────────────────────────────────────────────────────────────
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text unique not null,
  phone text,
  whatsapp text,
  photo_url text,
  license_number text,
  default_commission_type text not null default 'percent'
    check (default_commission_type in ('percent', 'fixed')),
  default_commission_value numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agents_auth_user_id_idx on public.agents(auth_user_id);
create index if not exists agents_is_active_idx on public.agents(is_active);

-- ── Client profiles ─────────────────────────────────────────────────────────
create table if not exists public.client_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  emirates_id text,
  passport_number text,
  nationality text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Extend products → properties ──────────────────────────────────────────────
alter table public.products
  add column if not exists property_reference text,
  add column if not exists listing_type text check (listing_type is null or listing_type in ('rent', 'sale')),
  add column if not exists property_type_id uuid references public.property_types(id) on delete set null,
  add column if not exists property_status_id uuid references public.property_statuses(id) on delete set null,
  add column if not exists area_id uuid references public.property_areas(id) on delete set null,
  add column if not exists exact_address text,
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists bedrooms int,
  add column if not exists bathrooms int,
  add column if not exists size_sqft numeric(12,2),
  add column if not exists furnishing_status_id uuid references public.furnishing_statuses(id) on delete set null,
  add column if not exists availability_date date,
  add column if not exists security_deposit numeric(12,2),
  add column if not exists agent_commission_type text check (agent_commission_type is null or agent_commission_type in ('percent', 'fixed')),
  add column if not exists agent_commission_value numeric(12,2),
  add column if not exists other_charges numeric(12,2) default 0,
  add column if not exists assigned_agent_id uuid references public.agents(id) on delete set null,
  add column if not exists viewing_availability jsonb not null default '[]'::jsonb,
  add column if not exists contract_terms text;

create unique index if not exists products_property_reference_uidx
  on public.products (lower(trim(property_reference)))
  where property_reference is not null and btrim(property_reference) <> '';

create index if not exists products_listing_type_idx on public.products(listing_type);
create index if not exists products_assigned_agent_id_idx on public.products(assigned_agent_id);
create index if not exists products_area_id_idx on public.products(area_id);

-- ── Property amenities junction ─────────────────────────────────────────────
create table if not exists public.property_amenities (
  property_id uuid not null references public.products(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- ── Auth helpers ──────────────────────────────────────────────────────────────
create or replace function public.is_agent()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.agents a
    where a.auth_user_id = (select auth.uid())
      and a.is_active = true
  );
$$;

create or replace function public.current_agent_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select a.id from public.agents a
  where a.auth_user_id = (select auth.uid()) and a.is_active = true
  limit 1;
$$;

grant execute on function public.is_agent() to authenticated;
grant execute on function public.current_agent_id() to authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.property_areas enable row level security;
alter table public.property_types enable row level security;
alter table public.furnishing_statuses enable row level security;
alter table public.property_statuses enable row level security;
alter table public.amenities enable row level security;
alter table public.payment_charge_types enable row level security;
alter table public.agency_settings enable row level security;
alter table public.agents enable row level security;
alter table public.client_profiles enable row level security;
alter table public.property_amenities enable row level security;

create policy "public_read_property_areas" on public.property_areas
  for select to anon, authenticated using (is_active = true);
create policy "public_read_property_types" on public.property_types
  for select to anon, authenticated using (is_active = true);
create policy "public_read_furnishing_statuses" on public.furnishing_statuses
  for select to anon, authenticated using (is_active = true);
create policy "public_read_property_statuses" on public.property_statuses
  for select to anon, authenticated using (is_active = true);
create policy "public_read_amenities" on public.amenities
  for select to anon, authenticated using (is_active = true);
create policy "public_read_payment_charge_types" on public.payment_charge_types
  for select to anon, authenticated using (is_active = true);

create policy "public_read_agency_settings" on public.agency_settings
  for select to anon, authenticated using (true);
create policy "admin_all_agency_settings" on public.agency_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public_read_active_agents" on public.agents
  for select to anon, authenticated using (is_active = true);
create policy "agent_read_own_agent" on public.agents
  for select to authenticated using (auth_user_id = (select auth.uid()));
create policy "admin_all_agents" on public.agents
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "client_own_profile" on public.client_profiles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "admin_all_client_profiles" on public.client_profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public_read_property_amenities" on public.property_amenities
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = property_amenities.property_id and p.published = true)
  );
create policy "admin_all_property_amenities" on public.property_amenities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admin_all_property_areas" on public.property_areas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_property_types" on public.property_types
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_furnishing_statuses" on public.furnishing_statuses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_property_statuses" on public.property_statuses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_amenities" on public.amenities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_payment_charge_types" on public.payment_charge_types
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.property_areas, public.property_types, public.furnishing_statuses,
  public.property_statuses, public.amenities, public.payment_charge_types,
  public.agency_settings, public.agents, public.property_amenities
  to anon, authenticated;
grant all on public.property_areas, public.property_types, public.furnishing_statuses,
  public.property_statuses, public.amenities, public.payment_charge_types,
  public.agency_settings, public.agents, public.client_profiles, public.property_amenities
  to authenticated;
