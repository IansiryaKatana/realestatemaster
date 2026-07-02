-- Property transaction workflow RPCs and status constraints

-- ── Status constraint ─────────────────────────────────────────────────────────
alter table public.property_transactions
  drop constraint if exists property_transactions_status_check;

alter table public.property_transactions
  add constraint property_transactions_status_check check (
    status in (
      'inquiry_submitted',
      'viewing_requested',
      'viewing_scheduled',
      'viewing_completed',
      'client_proceeding',
      'agent_approved',
      'contract_requested',
      'contract_generated',
      'contract_sent',
      'signed_contract_uploaded',
      'contract_under_review',
      'contract_approved',
      'payment_pending',
      'payment_completed',
      'handover_pending',
      'handover_scheduled',
      'handover_completed',
      'transaction_completed',
      'cancelled',
      'rejected'
    )
  );

-- ── Helpers ───────────────────────────────────────────────────────────────────
create or replace function public.next_property_transaction_number()
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_seq bigint;
begin
  select coalesce(max((regexp_replace(transaction_number, '\D', '', 'g'))::bigint), 0) + 1
  into v_seq
  from public.property_transactions
  where transaction_number ~ '^PT-[0-9]+$';

  return 'PT-' || lpad(v_seq::text, 6, '0');
end;
$$;

create or replace function public.create_workflow_notification(
  p_user_id uuid,
  p_recipient_role text,
  p_title text,
  p_body text,
  p_link_href text,
  p_transaction_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    return;
  end if;

  insert into public.notifications (user_id, recipient_role, title, body, link_href, transaction_id)
  values (p_user_id, p_recipient_role, p_title, p_body, p_link_href, p_transaction_id);
end;
$$;

-- ── Submit inquiry + transaction + optional viewing ─────────────────────────────
create or replace function public.rpc_submit_property_inquiry(
  p_property_id uuid,
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_message text default null,
  p_preferred_viewing_date date default null,
  p_preferred_viewing_time time default null,
  p_interest_type text default null,
  p_request_viewing boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.products%rowtype;
  v_uid uuid := auth.uid();
  v_tx_id uuid;
  v_inquiry_id uuid;
  v_viewing_id uuid;
  v_tx_number text;
  v_listing_type text;
  v_status text;
  v_agent_user_id uuid;
begin
  if p_full_name is null or trim(p_full_name) = '' then
    return jsonb_build_object('ok', false, 'error', 'Full name is required');
  end if;
  if p_email is null or trim(p_email) = '' then
    return jsonb_build_object('ok', false, 'error', 'Email is required');
  end if;

  select * into v_property
  from public.products
  where id = p_property_id and published = true;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Property not found');
  end if;

  v_listing_type := coalesce(v_property.listing_type, 'rent');
  v_status := case when p_request_viewing then 'viewing_requested' else 'inquiry_submitted' end;
  v_tx_number := public.next_property_transaction_number();

  insert into public.property_transactions (
    transaction_number,
    property_id,
    client_user_id,
    client_email,
    assigned_agent_id,
    listing_type,
    status
  ) values (
    v_tx_number,
    p_property_id,
    v_uid,
    lower(trim(p_email)),
    v_property.assigned_agent_id,
    v_listing_type,
    v_status
  )
  returning id into v_tx_id;

  insert into public.property_inquiries (
    property_id,
    transaction_id,
    assigned_agent_id,
    client_user_id,
    full_name,
    email,
    phone,
    message,
    preferred_viewing_date,
    preferred_viewing_time,
    interest_type,
    property_reference,
    status
  ) values (
    p_property_id,
    v_tx_id,
    v_property.assigned_agent_id,
    v_uid,
    trim(p_full_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_message, '')), ''),
    p_preferred_viewing_date,
    p_preferred_viewing_time,
    coalesce(p_interest_type, v_listing_type),
    v_property.property_reference,
    'new'
  )
  returning id into v_inquiry_id;

  if p_request_viewing and v_uid is not null then
    insert into public.viewing_requests (
      property_id,
      transaction_id,
      client_user_id,
      assigned_agent_id,
      preferred_date,
      preferred_time,
      status
    ) values (
      p_property_id,
      v_tx_id,
      v_uid,
      v_property.assigned_agent_id,
      p_preferred_viewing_date,
      p_preferred_viewing_time,
      'pending'
    )
    returning id into v_viewing_id;
  end if;

  if v_property.assigned_agent_id is not null then
    select auth_user_id into v_agent_user_id
    from public.agents
    where id = v_property.assigned_agent_id;

    perform public.create_workflow_notification(
      v_agent_user_id,
      'agent',
      'New property inquiry',
      trim(p_full_name) || ' inquired about ' || v_property.name,
      '/agent/inquiries',
      v_tx_id
    );
  end if;

  if v_uid is not null then
    perform public.create_workflow_notification(
      v_uid,
      'client',
      'Inquiry submitted',
      'Your request for ' || v_property.name || ' has been received.',
      '/account/transactions/' || v_tx_id::text,
      v_tx_id
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'transaction_id', v_tx_id,
    'transaction_number', v_tx_number,
    'inquiry_id', v_inquiry_id,
    'viewing_request_id', v_viewing_id
  );
end;
$$;

-- ── Client declaration after viewing ──────────────────────────────────────────
create or replace function public.rpc_submit_client_declaration(
  p_transaction_id uuid,
  p_viewing_request_id uuid default null,
  p_decision text default 'proceed',
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_uid uuid := auth.uid();
  v_agent_user_id uuid;
  v_new_status text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Sign in required');
  end if;
  if p_decision not in ('proceed', 'not_proceed', 'need_more_info') then
    return jsonb_build_object('ok', false, 'error', 'Invalid decision');
  end if;

  select * into v_tx
  from public.property_transactions
  where id = p_transaction_id and client_user_id = v_uid;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  insert into public.client_declarations (transaction_id, viewing_request_id, decision, notes)
  values (p_transaction_id, p_viewing_request_id, p_decision, nullif(trim(coalesce(p_notes, '')), ''));

  v_new_status := case p_decision
    when 'proceed' then 'client_proceeding'
    when 'not_proceed' then 'cancelled'
    else v_tx.status
  end;

  update public.property_transactions
  set status = v_new_status, updated_at = now()
  where id = p_transaction_id;

  if v_tx.assigned_agent_id is not null then
    select auth_user_id into v_agent_user_id from public.agents where id = v_tx.assigned_agent_id;
    perform public.create_workflow_notification(
      v_agent_user_id,
      'agent',
      'Client declaration received',
      'A client submitted a declaration on transaction ' || v_tx.transaction_number,
      '/agent/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'status', v_new_status);
end;
$$;

-- ── Agent approval ────────────────────────────────────────────────────────────
create or replace function public.rpc_agent_approve_transaction(
  p_transaction_id uuid,
  p_decision text,
  p_internal_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_agent_id uuid := public.current_agent_id();
  v_client_id uuid;
  v_new_status text;
begin
  if v_agent_id is null then
    return jsonb_build_object('ok', false, 'error', 'Agent access required');
  end if;
  if p_decision not in ('approved', 'rejected', 'need_more_info') then
    return jsonb_build_object('ok', false, 'error', 'Invalid decision');
  end if;

  select * into v_tx
  from public.property_transactions
  where id = p_transaction_id and assigned_agent_id = v_agent_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  insert into public.agent_approvals (transaction_id, agent_id, decision, internal_notes)
  values (p_transaction_id, v_agent_id, p_decision, nullif(trim(coalesce(p_internal_notes, '')), ''));

  v_new_status := case p_decision
    when 'approved' then 'agent_approved'
    when 'rejected' then 'rejected'
    else v_tx.status
  end;

  update public.property_transactions
  set status = v_new_status, updated_at = now()
  where id = p_transaction_id;

  v_client_id := v_tx.client_user_id;
  if v_client_id is not null then
    perform public.create_workflow_notification(
      v_client_id,
      'client',
      case p_decision when 'approved' then 'Application approved' else 'Application update' end,
      'Your agent reviewed transaction ' || v_tx.transaction_number,
      '/account/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'status', v_new_status);
end;
$$;

-- ── Agent viewing status update ─────────────────────────────────────────────────
create or replace function public.rpc_agent_update_viewing(
  p_viewing_id uuid,
  p_status text,
  p_scheduled_date date default null,
  p_scheduled_time time default null,
  p_agent_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewing public.viewing_requests%rowtype;
  v_agent_id uuid := public.current_agent_id();
  v_tx_status text;
begin
  if v_agent_id is null then
    return jsonb_build_object('ok', false, 'error', 'Agent access required');
  end if;
  if p_status not in ('pending', 'scheduled', 'completed', 'cancelled', 'no_show') then
    return jsonb_build_object('ok', false, 'error', 'Invalid status');
  end if;

  select * into v_viewing
  from public.viewing_requests
  where id = p_viewing_id and assigned_agent_id = v_agent_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Viewing not found');
  end if;

  update public.viewing_requests
  set
    status = p_status,
    scheduled_date = coalesce(p_scheduled_date, scheduled_date),
    scheduled_time = coalesce(p_scheduled_time, scheduled_time),
    agent_notes = coalesce(nullif(trim(coalesce(p_agent_notes, '')), ''), agent_notes),
    updated_at = now()
  where id = p_viewing_id;

  v_tx_status := case p_status
    when 'scheduled' then 'viewing_scheduled'
    when 'completed' then 'viewing_completed'
    else null
  end;

  if v_tx_status is not null and v_viewing.transaction_id is not null then
    update public.property_transactions
    set status = v_tx_status, updated_at = now()
    where id = v_viewing.transaction_id;
  end if;

  if v_viewing.client_user_id is not null then
    perform public.create_workflow_notification(
      v_viewing.client_user_id,
      'client',
      'Viewing update',
      'Your viewing status is now: ' || p_status,
      '/account/viewings',
      v_viewing.transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'status', p_status);
end;
$$;

-- ── Client contract request ─────────────────────────────────────────────────────
create or replace function public.rpc_client_request_contract(p_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_uid uuid := auth.uid();
  v_agent_user_id uuid;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Sign in required');
  end if;

  select * into v_tx
  from public.property_transactions
  where id = p_transaction_id and client_user_id = v_uid;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;
  if v_tx.status not in ('agent_approved', 'contract_requested') then
    return jsonb_build_object('ok', false, 'error', 'Contract cannot be requested at this stage');
  end if;

  insert into public.contract_requests (transaction_id, status)
  values (p_transaction_id, 'requested');

  update public.property_transactions
  set status = 'contract_requested', updated_at = now()
  where id = p_transaction_id;

  if v_tx.assigned_agent_id is not null then
    select auth_user_id into v_agent_user_id from public.agents where id = v_tx.assigned_agent_id;
    perform public.create_workflow_notification(
      v_agent_user_id,
      'agent',
      'Contract requested',
      'Client requested a contract for ' || v_tx.transaction_number,
      '/agent/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'status', 'contract_requested');
end;
$$;

-- ── Agent generate contract record ──────────────────────────────────────────────
create or replace function public.rpc_agent_generate_contract(
  p_transaction_id uuid,
  p_contract_data jsonb default '{}'::jsonb,
  p_file_url text default null,
  p_file_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_agent_id uuid := public.current_agent_id();
  v_contract_id uuid;
  v_client_id uuid;
begin
  if v_agent_id is null then
    return jsonb_build_object('ok', false, 'error', 'Agent access required');
  end if;

  select * into v_tx
  from public.property_transactions
  where id = p_transaction_id and assigned_agent_id = v_agent_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  insert into public.generated_contracts (transaction_id, agent_id, file_url, file_name, contract_data)
  values (p_transaction_id, v_agent_id, p_file_url, p_file_name, coalesce(p_contract_data, '{}'::jsonb))
  returning id into v_contract_id;

  update public.property_transactions
  set status = 'contract_generated', updated_at = now()
  where id = p_transaction_id;

  v_client_id := v_tx.client_user_id;
  if v_client_id is not null then
    perform public.create_workflow_notification(
      v_client_id,
      'client',
      'Contract ready',
      'Your contract for ' || v_tx.transaction_number || ' is ready to download.',
      '/account/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'contract_id', v_contract_id, 'status', 'contract_generated');
end;
$$;

-- ── Agent review uploaded contract ──────────────────────────────────────────────
create or replace function public.rpc_agent_review_contract(
  p_upload_id uuid,
  p_decision text,
  p_review_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_upload public.uploaded_contracts%rowtype;
  v_agent_id uuid := public.current_agent_id();
  v_new_status text;
begin
  if v_agent_id is null then
    return jsonb_build_object('ok', false, 'error', 'Agent access required');
  end if;
  if p_decision not in ('approved', 'rejected', 'reupload_requested') then
    return jsonb_build_object('ok', false, 'error', 'Invalid decision');
  end if;

  select uc.* into v_upload
  from public.uploaded_contracts uc
  join public.property_transactions pt on pt.id = uc.transaction_id
  where uc.id = p_upload_id and pt.assigned_agent_id = v_agent_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Upload not found');
  end if;

  update public.uploaded_contracts
  set review_status = p_decision, review_notes = nullif(trim(coalesce(p_review_notes, '')), ''), reviewed_at = now()
  where id = p_upload_id;

  v_new_status := case p_decision
    when 'approved' then 'contract_approved'
    when 'rejected' then 'rejected'
    else 'contract_under_review'
  end;

  update public.property_transactions
  set status = v_new_status, updated_at = now()
  where id = v_upload.transaction_id;

  if p_decision = 'approved' then
    update public.property_transactions
    set status = 'payment_pending', updated_at = now()
    where id = v_upload.transaction_id;
    v_new_status := 'payment_pending';
  end if;

  if v_upload.client_user_id is not null then
    perform public.create_workflow_notification(
      v_upload.client_user_id,
      'client',
      'Contract review update',
      'Your signed contract was ' || p_decision,
      '/account/transactions/' || v_upload.transaction_id::text,
      v_upload.transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'status', v_new_status);
end;
$$;

-- ── Build default payment breakdown from property ───────────────────────────────
create or replace function public.rpc_build_payment_breakdown(p_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_property public.products%rowtype;
  v_commission numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
begin
  if not (public.is_admin() or public.is_agent()) then
    return jsonb_build_object('ok', false, 'error', 'Not authorized');
  end if;

  select * into v_tx from public.property_transactions where id = p_transaction_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  select * into v_property from public.products where id = v_tx.property_id;

  if v_property.agent_commission_type = 'percent' and v_property.agent_commission_value is not null then
    v_commission := round(v_property.price * v_property.agent_commission_value / 100, 2);
  elsif v_property.agent_commission_value is not null then
    v_commission := v_property.agent_commission_value;
  end if;

  v_total := coalesce(v_property.price, 0)
    + coalesce(v_property.security_deposit, 0)
    + coalesce(v_property.other_charges, 0)
    + v_commission;

  delete from public.payment_breakdowns where transaction_id = p_transaction_id;

  insert into public.payment_breakdowns (transaction_id, label, amount, sort_order) values
    (p_transaction_id, case when v_tx.listing_type = 'rent' then 'Annual rent' else 'Sale price' end, coalesce(v_property.price, 0), 0),
    (p_transaction_id, 'Security deposit', coalesce(v_property.security_deposit, 0), 1),
    (p_transaction_id, 'Agent commission', v_commission, 2),
    (p_transaction_id, 'Other charges', coalesce(v_property.other_charges, 0), 3);

  update public.property_transactions
  set status = 'payment_pending', updated_at = now()
  where id = p_transaction_id;

  return jsonb_build_object('ok', true, 'total', v_total);
end;
$$;

-- ── List client transactions ────────────────────────────────────────────────────
create or replace function public.rpc_list_client_transactions()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_items jsonb;
begin
  if v_uid is null and v_email = '' then
    return jsonb_build_object('ok', false, 'error', 'Sign in required');
  end if;

  select coalesce(jsonb_agg(row_to_json(t) order by t.created_at desc), '[]'::jsonb)
  into v_items
  from (
    select
      pt.id,
      pt.transaction_number,
      pt.status,
      pt.listing_type,
      pt.created_at,
      pt.updated_at,
      p.name as property_name,
      p.slug as property_slug,
      p.image_url as property_image_url,
      p.price as property_price
    from public.property_transactions pt
    join public.products p on p.id = pt.property_id
    where pt.client_user_id = v_uid
       or (v_email <> '' and lower(pt.client_email) = v_email)
  ) t;

  return jsonb_build_object('ok', true, 'items', v_items);
end;
$$;

grant execute on function public.rpc_submit_property_inquiry(uuid, text, text, text, text, date, time, text, boolean) to anon, authenticated;
grant execute on function public.rpc_submit_client_declaration(uuid, uuid, text, text) to authenticated;
grant execute on function public.rpc_agent_approve_transaction(uuid, text, text) to authenticated;
grant execute on function public.rpc_agent_update_viewing(uuid, text, date, time, text) to authenticated;
grant execute on function public.rpc_client_request_contract(uuid) to authenticated;
grant execute on function public.rpc_agent_generate_contract(uuid, jsonb, text, text) to authenticated;
grant execute on function public.rpc_agent_review_contract(uuid, text, text) to authenticated;
grant execute on function public.rpc_build_payment_breakdown(uuid) to authenticated;
grant execute on function public.rpc_list_client_transactions() to authenticated;
