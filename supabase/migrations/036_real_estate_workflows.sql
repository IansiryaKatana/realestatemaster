-- Real estate workflows: transactions, inquiries, viewings, contracts, payments, notifications

-- ── Property transactions (extends order lifecycle) ─────────────────────────
create table if not exists public.property_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_number text unique not null,
  property_id uuid not null references public.products(id) on delete restrict,
  client_user_id uuid references auth.users(id) on delete set null,
  client_email text not null,
  assigned_agent_id uuid references public.agents(id) on delete set null,
  listing_type text not null check (listing_type in ('rent', 'sale')),
  status text not null default 'inquiry_submitted',
  order_id uuid references public.orders(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists property_transactions_property_id_idx on public.property_transactions(property_id);
create index if not exists property_transactions_client_user_id_idx on public.property_transactions(client_user_id);
create index if not exists property_transactions_assigned_agent_id_idx on public.property_transactions(assigned_agent_id);
create index if not exists property_transactions_status_idx on public.property_transactions(status);

-- ── Property inquiries ────────────────────────────────────────────────────────
create table if not exists public.property_inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.products(id) on delete cascade,
  transaction_id uuid references public.property_transactions(id) on delete set null,
  assigned_agent_id uuid references public.agents(id) on delete set null,
  client_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  message text,
  preferred_viewing_date date,
  preferred_viewing_time time,
  interest_type text check (interest_type in ('rent', 'buy', 'both')),
  property_reference text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- ── Viewing requests ──────────────────────────────────────────────────────────
create table if not exists public.viewing_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.products(id) on delete cascade,
  transaction_id uuid references public.property_transactions(id) on delete set null,
  client_user_id uuid references auth.users(id) on delete set null,
  assigned_agent_id uuid references public.agents(id) on delete set null,
  preferred_date date,
  preferred_time time,
  scheduled_date date,
  scheduled_time time,
  status text not null default 'pending'
    check (status in ('pending', 'scheduled', 'completed', 'cancelled', 'no_show')),
  agent_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Client declarations ───────────────────────────────────────────────────────
create table if not exists public.client_declarations (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.property_transactions(id) on delete cascade,
  viewing_request_id uuid references public.viewing_requests(id) on delete set null,
  decision text not null check (decision in ('proceed', 'not_proceed', 'need_more_info')),
  notes text,
  created_at timestamptz not null default now()
);

-- ── Agent approvals ───────────────────────────────────────────────────────────
create table if not exists public.agent_approvals (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.property_transactions(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete restrict,
  decision text not null check (decision in ('approved', 'rejected', 'need_more_info')),
  internal_notes text,
  created_at timestamptz not null default now()
);

-- ── Contracts ─────────────────────────────────────────────────────────────────
create table if not exists public.contract_requests (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.property_transactions(id) on delete cascade,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);

create table if not exists public.generated_contracts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.property_transactions(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  file_url text,
  file_name text,
  contract_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.uploaded_contracts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.property_transactions(id) on delete cascade,
  generated_contract_id uuid references public.generated_contracts(id) on delete set null,
  client_user_id uuid references auth.users(id) on delete set null,
  file_url text not null,
  file_name text,
  review_status text not null default 'under_review'
    check (review_status in ('under_review', 'approved', 'rejected', 'reupload_requested')),
  review_notes text,
  reviewed_by_agent_id uuid references public.agents(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── Payment breakdowns & invoices ─────────────────────────────────────────────
create table if not exists public.payment_breakdowns (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.property_transactions(id) on delete cascade,
  charge_type_id uuid references public.payment_charge_types(id) on delete set null,
  label text not null,
  amount numeric(12,2) not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.property_transactions(id) on delete cascade,
  invoice_number text unique not null,
  client_email text not null,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'AED',
  payment_status text not null default 'pending',
  file_url text,
  issued_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

-- ── Handover ──────────────────────────────────────────────────────────────────
create table if not exists public.handover_records (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.property_transactions(id) on delete cascade,
  handover_date date,
  handover_time time,
  meeting_location text,
  agent_notes text,
  required_documents text,
  key_collection_details text,
  possession_instructions text,
  status text not null default 'pending' check (status in ('pending', 'scheduled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Notifications ───────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  recipient_role text not null check (recipient_role in ('admin', 'agent', 'client')),
  title text not null,
  body text,
  link_href text,
  transaction_id uuid references public.property_transactions(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(user_id, is_read);

-- ── Deferred client profile policy for agents ─────────────────────────────────
create policy "agent_read_assigned_client_profiles" on public.client_profiles
  for select to authenticated using (
    public.is_agent() and exists (
      select 1 from public.property_transactions pt
      where pt.client_user_id = client_profiles.user_id
        and pt.assigned_agent_id = public.current_agent_id()
    )
  );

-- ── RLS: transactions & workflow tables ───────────────────────────────────────
alter table public.property_transactions enable row level security;
alter table public.property_inquiries enable row level security;
alter table public.viewing_requests enable row level security;
alter table public.client_declarations enable row level security;
alter table public.agent_approvals enable row level security;
alter table public.contract_requests enable row level security;
alter table public.generated_contracts enable row level security;
alter table public.uploaded_contracts enable row level security;
alter table public.payment_breakdowns enable row level security;
alter table public.invoices enable row level security;
alter table public.handover_records enable row level security;
alter table public.notifications enable row level security;

-- Admin: full access
create policy "admin_all_property_transactions" on public.property_transactions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_property_inquiries" on public.property_inquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_viewing_requests" on public.viewing_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_client_declarations" on public.client_declarations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_agent_approvals" on public.agent_approvals
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_contract_requests" on public.contract_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_generated_contracts" on public.generated_contracts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_uploaded_contracts" on public.uploaded_contracts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_payment_breakdowns" on public.payment_breakdowns
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_invoices" on public.invoices
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_handover_records" on public.handover_records
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_notifications" on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Client: own records
create policy "client_own_transactions" on public.property_transactions
  for select to authenticated
  using (client_user_id = (select auth.uid()) or lower(client_email) = lower(coalesce(auth.jwt()->>'email', '')));
create policy "client_insert_inquiries" on public.property_inquiries
  for insert to authenticated with check (true);
create policy "client_read_own_inquiries" on public.property_inquiries
  for select to authenticated
  using (client_user_id = (select auth.uid()) or lower(email) = lower(coalesce(auth.jwt()->>'email', '')));
create policy "client_own_viewing_requests" on public.viewing_requests
  for all to authenticated
  using (client_user_id = (select auth.uid()))
  with check (client_user_id = (select auth.uid()));
create policy "client_own_declarations" on public.client_declarations
  for all to authenticated
  using (exists (
    select 1 from public.property_transactions pt
    where pt.id = client_declarations.transaction_id
      and pt.client_user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.property_transactions pt
    where pt.id = client_declarations.transaction_id
      and pt.client_user_id = (select auth.uid())
  ));
create policy "client_read_own_contracts" on public.generated_contracts
  for select to authenticated using (exists (
    select 1 from public.property_transactions pt
    where pt.id = generated_contracts.transaction_id
      and pt.client_user_id = (select auth.uid())
  ));
create policy "client_own_uploaded_contracts" on public.uploaded_contracts
  for all to authenticated
  using (client_user_id = (select auth.uid()))
  with check (client_user_id = (select auth.uid()));
create policy "client_read_own_payment_breakdowns" on public.payment_breakdowns
  for select to authenticated using (exists (
    select 1 from public.property_transactions pt
    where pt.id = payment_breakdowns.transaction_id
      and pt.client_user_id = (select auth.uid())
  ));
create policy "client_read_own_invoices" on public.invoices
  for select to authenticated using (exists (
    select 1 from public.property_transactions pt
    where pt.id = invoices.transaction_id
      and pt.client_user_id = (select auth.uid())
  ));
create policy "client_read_own_handover" on public.handover_records
  for select to authenticated using (exists (
    select 1 from public.property_transactions pt
    where pt.id = handover_records.transaction_id
      and pt.client_user_id = (select auth.uid())
  ));
create policy "client_own_notifications" on public.notifications
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Agent: assigned records
create policy "agent_assigned_transactions" on public.property_transactions
  for select to authenticated
  using (assigned_agent_id = public.current_agent_id());
create policy "agent_update_assigned_transactions" on public.property_transactions
  for update to authenticated
  using (assigned_agent_id = public.current_agent_id())
  with check (assigned_agent_id = public.current_agent_id());
create policy "agent_assigned_inquiries" on public.property_inquiries
  for all to authenticated
  using (assigned_agent_id = public.current_agent_id())
  with check (assigned_agent_id = public.current_agent_id());
create policy "agent_assigned_viewings" on public.viewing_requests
  for all to authenticated
  using (assigned_agent_id = public.current_agent_id())
  with check (assigned_agent_id = public.current_agent_id());
create policy "agent_read_assigned_declarations" on public.client_declarations
  for select to authenticated using (exists (
    select 1 from public.property_transactions pt
    where pt.id = client_declarations.transaction_id
      and pt.assigned_agent_id = public.current_agent_id()
  ));
create policy "agent_assigned_approvals" on public.agent_approvals
  for all to authenticated
  using (agent_id = public.current_agent_id())
  with check (agent_id = public.current_agent_id());
create policy "agent_assigned_contract_requests" on public.contract_requests
  for all to authenticated using (exists (
    select 1 from public.property_transactions pt
    where pt.id = contract_requests.transaction_id
      and pt.assigned_agent_id = public.current_agent_id()
  ));
create policy "agent_assigned_generated_contracts" on public.generated_contracts
  for all to authenticated
  using (agent_id = public.current_agent_id() or exists (
    select 1 from public.property_transactions pt
    where pt.id = generated_contracts.transaction_id
      and pt.assigned_agent_id = public.current_agent_id()
  ));
create policy "agent_review_uploaded_contracts" on public.uploaded_contracts
  for all to authenticated using (exists (
    select 1 from public.property_transactions pt
    where pt.id = uploaded_contracts.transaction_id
      and pt.assigned_agent_id = public.current_agent_id()
  ));
create policy "agent_assigned_handover" on public.handover_records
  for all to authenticated using (exists (
    select 1 from public.property_transactions pt
    where pt.id = handover_records.transaction_id
      and pt.assigned_agent_id = public.current_agent_id()
  ));
create policy "agent_own_notifications" on public.notifications
  for all to authenticated
  using (user_id = (select auth.uid()) and recipient_role = 'agent')
  with check (user_id = (select auth.uid()));

-- Public can submit inquiries (anon)
create policy "anon_insert_property_inquiries" on public.property_inquiries
  for insert to anon with check (true);

grant select, insert on public.property_inquiries to anon;
grant all on public.property_transactions, public.property_inquiries, public.viewing_requests,
  public.client_declarations, public.agent_approvals, public.contract_requests,
  public.generated_contracts, public.uploaded_contracts, public.payment_breakdowns,
  public.invoices, public.handover_records, public.notifications
  to authenticated;

-- Contract & agent document storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('contracts', 'contracts', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']),
  ('agent-media', 'agent-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "client_upload_contracts" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'contracts' and (select auth.uid()) is not null);

create policy "read_own_contracts" on storage.objects
  for select to authenticated
  using (bucket_id = 'contracts' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "admin_all_contracts_storage" on storage.objects
  for all to authenticated
  using (bucket_id = 'contracts' and public.is_admin())
  with check (bucket_id = 'contracts' and public.is_admin());

create policy "public_read_agent_media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'agent-media');

create policy "admin_agent_media_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'agent-media' and (public.is_admin() or public.is_agent()));
