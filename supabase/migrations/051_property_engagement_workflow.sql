-- Short homepage feature titles, viewing for guests, callback RPC

update public.feature_cards set
  title = 'VACATION RENTALS',
  updated_at = now()
where id = '33333333-3333-3333-3333-333333333301';

update public.feature_cards set
  title = 'INVESTMENT SALES',
  updated_at = now()
where id = '33333333-3333-3333-3333-333333333302';

update public.feature_cards set
  title = 'VILLA COLLECTION',
  updated_at = now()
where id = '33333333-3333-3333-3333-333333333303';

-- Guest contact on viewing requests (for non-authenticated bookings)
alter table public.viewing_requests
  add column if not exists client_full_name text,
  add column if not exists client_email text,
  add column if not exists client_phone text;

create or replace function public.rpc_submit_property_callback(
  p_property_id uuid,
  p_full_name text,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.products%rowtype;
  v_submission_id uuid;
begin
  if coalesce(trim(p_full_name), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Full name is required');
  end if;
  if coalesce(trim(p_phone), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Phone number is required');
  end if;

  select * into v_property
  from public.products
  where id = p_property_id and published = true;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Property not found');
  end if;

  insert into public.form_submissions (form_type, payload, status)
  values (
    'callback_request',
    jsonb_build_object(
      'property_id', p_property_id,
      'property_name', v_property.name,
      'property_reference', v_property.property_reference,
      'property_slug', v_property.slug,
      'assigned_agent_id', v_property.assigned_agent_id,
      'full_name', trim(p_full_name),
      'phone', trim(p_phone)
    ),
    'new'
  )
  returning id into v_submission_id;

  return jsonb_build_object('ok', true, 'submission_id', v_submission_id);
end;
$$;

grant execute on function public.rpc_submit_property_callback(uuid, text, text) to anon, authenticated;

-- Allow viewing requests for guests (not only signed-in clients)
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

  if p_request_viewing then
    insert into public.viewing_requests (
      property_id,
      transaction_id,
      client_user_id,
      assigned_agent_id,
      preferred_date,
      preferred_time,
      client_full_name,
      client_email,
      client_phone,
      status
    ) values (
      p_property_id,
      v_tx_id,
      v_uid,
      v_property.assigned_agent_id,
      p_preferred_viewing_date,
      p_preferred_viewing_time,
      trim(p_full_name),
      lower(trim(p_email)),
      nullif(trim(coalesce(p_phone, '')), ''),
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
      case when p_request_viewing then 'New viewing request' else 'New property inquiry' end,
      trim(p_full_name) || ' requested ' || v_property.name,
      '/agent/viewings',
      v_tx_id
    );
  end if;

  if v_uid is not null then
    perform public.create_workflow_notification(
      v_uid,
      'client',
      case when p_request_viewing then 'Viewing request submitted' else 'Inquiry submitted' end,
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

