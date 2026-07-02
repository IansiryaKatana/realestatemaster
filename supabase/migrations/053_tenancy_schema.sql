-- Tenancy & property management schema (post-handover)

-- Landlords (external property owners)
create table if not exists public.property_owners (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  company_name text,
  tax_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.property_owner_assignments (
  id uuid primary key default gen_random_uuid(),
  property_owner_id uuid not null references public.property_owners (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  ownership_share numeric(5,2) not null default 100,
  management_fee_pct numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (property_owner_id, product_id)
);

-- Active tenancies
create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  property_transaction_id uuid references public.property_transactions (id) on delete set null,
  product_id uuid not null references public.products (id) on delete restrict,
  tenant_user_id uuid not null references auth.users (id) on delete restrict,
  landlord_owner_id uuid references public.property_owners (id) on delete set null,
  assigned_agent_id uuid references public.agents (id) on delete set null,
  start_date date not null,
  end_date date,
  rent_amount numeric(12,2) not null,
  payment_frequency text not null default 'monthly' check (payment_frequency in ('monthly', 'cheque')),
  cheque_count int,
  security_deposit numeric(12,2),
  status text not null default 'pending' check (status in ('pending', 'active', 'notice', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leases_tenant_user_id_idx on public.leases (tenant_user_id);
create index if not exists leases_product_id_idx on public.leases (product_id);
create index if not exists leases_status_idx on public.leases (status);

create table if not exists public.rent_installments (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete cascade,
  due_date date not null,
  amount numeric(12,2) not null,
  installment_type text not null default 'rent' check (installment_type in ('rent', 'deposit', 'fee')),
  status text not null default 'scheduled' check (status in (
    'scheduled', 'due', 'pending_verification', 'paid', 'overdue', 'waived'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rent_installments_lease_id_idx on public.rent_installments (lease_id);
create index if not exists rent_installments_status_idx on public.rent_installments (status);

create table if not exists public.rent_payments (
  id uuid primary key default gen_random_uuid(),
  installment_id uuid not null references public.rent_installments (id) on delete cascade,
  amount numeric(12,2) not null,
  payment_method text not null default 'bank_transfer',
  proof_url text,
  stripe_payment_id text,
  submitted_by uuid references auth.users (id) on delete set null,
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  status text not null default 'pending_verification' check (status in ('pending_verification', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid references public.leases (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  tenant_user_id uuid not null references auth.users (id) on delete cascade,
  request_type text not null check (request_type in ('complaint', 'maintenance')),
  category text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  assigned_agent_id uuid references public.agents (id) on delete set null,
  resolved_at timestamptz,
  sla_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests (id) on delete cascade,
  author_user_id uuid not null references auth.users (id) on delete cascade,
  author_role text not null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.move_in_checklists (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete cascade,
  handover_record_id uuid references public.handover_records (id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  tenant_signed_at timestamptz,
  agent_signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_documents (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases (id) on delete cascade,
  doc_type text not null check (doc_type in ('ejari', 'dewa', 'lease', 'id', 'other')),
  file_url text not null,
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.owner_statements (
  id uuid primary key default gen_random_uuid(),
  property_owner_id uuid not null references public.property_owners (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_rent numeric(12,2) not null default 0,
  fees numeric(12,2) not null default 0,
  net_payout numeric(12,2) not null default 0,
  pdf_url text,
  created_at timestamptz not null default now()
);

-- Role helpers
create or replace function public.is_tenant()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.leases l
    where l.tenant_user_id = (select auth.uid())
      and l.status in ('pending', 'active', 'notice')
  );
$$;

create or replace function public.is_landlord()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.property_owners po
    where po.auth_user_id = (select auth.uid())
      and po.is_active = true
  );
$$;

create or replace function public.current_landlord_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select po.id from public.property_owners po
  where po.auth_user_id = (select auth.uid()) and po.is_active = true
  limit 1;
$$;

-- Extend notifications recipient_role
alter table public.notifications drop constraint if exists notifications_recipient_role_check;
alter table public.notifications add constraint notifications_recipient_role_check
  check (recipient_role in ('admin', 'agent', 'client', 'tenant', 'landlord'));

-- RLS
alter table public.property_owners enable row level security;
alter table public.property_owner_assignments enable row level security;
alter table public.leases enable row level security;
alter table public.rent_installments enable row level security;
alter table public.rent_payments enable row level security;
alter table public.service_requests enable row level security;
alter table public.service_request_messages enable row level security;
alter table public.move_in_checklists enable row level security;
alter table public.tenant_documents enable row level security;
alter table public.owner_statements enable row level security;

-- property_owners
create policy admin_all_property_owners on public.property_owners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_reader_property_owners on public.property_owners for select to authenticated
  using (public.is_admin_reader());
create policy landlord_own_property_owners on public.property_owners for select to authenticated
  using (auth_user_id = (select auth.uid()));

-- property_owner_assignments
create policy admin_all_property_owner_assignments on public.property_owner_assignments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_reader_property_owner_assignments on public.property_owner_assignments for select to authenticated
  using (public.is_admin_reader());
create policy landlord_read_assignments on public.property_owner_assignments for select to authenticated
  using (property_owner_id = public.current_landlord_id());

-- leases
create policy admin_all_leases on public.leases for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_reader_leases on public.leases for select to authenticated
  using (public.is_admin_reader());
create policy tenant_own_leases on public.leases for select to authenticated
  using (tenant_user_id = (select auth.uid()));
create policy agent_assigned_leases on public.leases for select to authenticated
  using (assigned_agent_id = public.current_agent_id());
create policy landlord_leases on public.leases for select to authenticated
  using (
    landlord_owner_id = public.current_landlord_id()
    or product_id in (
      select poa.product_id from public.property_owner_assignments poa
      where poa.property_owner_id = public.current_landlord_id()
    )
  );

-- rent_installments
create policy admin_all_rent_installments on public.rent_installments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_reader_rent_installments on public.rent_installments for select to authenticated
  using (public.is_admin_reader());
create policy tenant_rent_installments on public.rent_installments for select to authenticated
  using (
    lease_id in (select l.id from public.leases l where l.tenant_user_id = (select auth.uid()))
  );
create policy agent_rent_installments on public.rent_installments for select to authenticated
  using (
    lease_id in (select l.id from public.leases l where l.assigned_agent_id = public.current_agent_id())
  );

-- rent_payments
create policy admin_all_rent_payments on public.rent_payments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_reader_rent_payments on public.rent_payments for select to authenticated
  using (public.is_admin_reader());
create policy tenant_insert_rent_payments on public.rent_payments for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and installment_id in (
      select ri.id from public.rent_installments ri
      join public.leases l on l.id = ri.lease_id
      where l.tenant_user_id = (select auth.uid())
    )
  );
create policy tenant_read_rent_payments on public.rent_payments for select to authenticated
  using (
    installment_id in (
      select ri.id from public.rent_installments ri
      join public.leases l on l.id = ri.lease_id
      where l.tenant_user_id = (select auth.uid())
    )
  );

-- service_requests
create policy admin_all_service_requests on public.service_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_reader_service_requests on public.service_requests for select to authenticated
  using (public.is_admin_reader());
create policy tenant_service_requests on public.service_requests for all to authenticated
  using (tenant_user_id = (select auth.uid()))
  with check (tenant_user_id = (select auth.uid()));
create policy agent_service_requests on public.service_requests for select to authenticated
  using (assigned_agent_id = public.current_agent_id());
create policy agent_update_service_requests on public.service_requests for update to authenticated
  using (assigned_agent_id = public.current_agent_id())
  with check (assigned_agent_id = public.current_agent_id());

-- service_request_messages
create policy admin_all_service_request_messages on public.service_request_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy participants_read_messages on public.service_request_messages for select to authenticated
  using (
    exists (
      select 1 from public.service_requests sr
      where sr.id = request_id
        and (
          sr.tenant_user_id = (select auth.uid())
          or sr.assigned_agent_id = public.current_agent_id()
          or public.is_admin_reader()
        )
    )
  );
create policy participants_insert_messages on public.service_request_messages for insert to authenticated
  with check (author_user_id = (select auth.uid()));

-- move_in_checklists, tenant_documents
create policy admin_all_move_in_checklists on public.move_in_checklists for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_reader_move_in_checklists on public.move_in_checklists for select to authenticated
  using (public.is_admin_reader());
create policy tenant_move_in_checklists on public.move_in_checklists for select to authenticated
  using (lease_id in (select id from public.leases where tenant_user_id = (select auth.uid())));

create policy admin_all_tenant_documents on public.tenant_documents for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_reader_tenant_documents on public.tenant_documents for select to authenticated
  using (public.is_admin_reader());
create policy tenant_tenant_documents on public.tenant_documents for all to authenticated
  using (lease_id in (select id from public.leases where tenant_user_id = (select auth.uid())))
  with check (lease_id in (select id from public.leases where tenant_user_id = (select auth.uid())));

-- owner_statements
create policy admin_all_owner_statements on public.owner_statements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy landlord_owner_statements on public.owner_statements for select to authenticated
  using (property_owner_id = public.current_landlord_id());

grant execute on function public.is_tenant() to authenticated;
grant execute on function public.is_landlord() to authenticated;
grant execute on function public.current_landlord_id() to authenticated;
