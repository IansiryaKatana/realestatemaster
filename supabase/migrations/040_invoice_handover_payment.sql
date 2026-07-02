-- Invoice, handover, payment completion, and improved payment breakdown

create or replace function public.next_property_invoice_number()
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_seq bigint;
begin
  select coalesce(max((regexp_replace(invoice_number, '\D', '', 'g'))::bigint), 0) + 1
  into v_seq
  from public.invoices
  where invoice_number ~ '^INV-[0-9]+$';
  return 'INV-' || lpad(v_seq::text, 6, '0');
end;
$$;

-- Rebuild payment breakdown using payment_charge_types + property values
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
  v_sort int := 0;
  v_charge record;
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

  delete from public.payment_breakdowns where transaction_id = p_transaction_id;

  insert into public.payment_breakdowns (transaction_id, label, amount, sort_order)
  values (
    p_transaction_id,
    case when v_tx.listing_type = 'rent' then 'Annual rent' else 'Sale price' end,
    coalesce(v_property.price, 0),
    v_sort
  );
  v_total := v_total + coalesce(v_property.price, 0);
  v_sort := v_sort + 1;

  if coalesce(v_property.security_deposit, 0) > 0 then
    insert into public.payment_breakdowns (transaction_id, label, amount, sort_order)
    values (p_transaction_id, 'Security deposit', v_property.security_deposit, v_sort);
    v_total := v_total + v_property.security_deposit;
    v_sort := v_sort + 1;
  end if;

  if v_commission > 0 then
    insert into public.payment_breakdowns (transaction_id, label, amount, sort_order)
    values (p_transaction_id, 'Agent commission', v_commission, v_sort);
    v_total := v_total + v_commission;
    v_sort := v_sort + 1;
  end if;

  if coalesce(v_property.other_charges, 0) > 0 then
    insert into public.payment_breakdowns (transaction_id, label, amount, sort_order)
    values (p_transaction_id, 'Other charges', v_property.other_charges, v_sort);
    v_total := v_total + v_property.other_charges;
    v_sort := v_sort + 1;
  end if;

  for v_charge in
    select pct.id, pct.name, pct.slug
    from public.payment_charge_types pct
    where pct.is_active = true
      and (pct.applies_to = 'both' or pct.applies_to = v_tx.listing_type)
    order by pct.sort_order
  loop
    if v_charge.slug in ('admin-fee', 'admin_fee') then
      insert into public.payment_breakdowns (transaction_id, charge_type_id, label, amount, sort_order)
      select p_transaction_id, v_charge.id, v_charge.name, coalesce(ags.default_service_charges, 0), v_sort
      from public.agency_settings ags limit 1;
      v_total := v_total + coalesce((select default_service_charges from public.agency_settings limit 1), 0);
      v_sort := v_sort + 1;
    elsif v_charge.slug in ('ejari-fee', 'ejari_fee', 'registration-fee') and v_tx.listing_type = 'rent' then
      insert into public.payment_breakdowns (transaction_id, charge_type_id, label, amount, sort_order)
      values (p_transaction_id, v_charge.id, v_charge.name, 220, v_sort);
      v_total := v_total + 220;
      v_sort := v_sort + 1;
    elsif v_charge.slug in ('vat', 'vat-5') then
      insert into public.payment_breakdowns (transaction_id, charge_type_id, label, amount, sort_order)
      values (p_transaction_id, v_charge.id, v_charge.name, round(v_total * 0.05, 2), v_sort);
      v_total := v_total + round(v_total * 0.05, 2);
      v_sort := v_sort + 1;
    end if;
  end loop;

  update public.property_transactions
  set status = 'payment_pending', updated_at = now()
  where id = p_transaction_id;

  return jsonb_build_object('ok', true, 'total', v_total);
end;
$$;

create or replace function public.rpc_create_property_invoice(p_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_total numeric(12,2) := 0;
  v_invoice_id uuid;
  v_invoice_number text;
  v_uid uuid := auth.uid();
  v_breakdown jsonb;
begin
  select * into v_tx from public.property_transactions where id = p_transaction_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  if v_uid is not null and v_tx.client_user_id is distinct from v_uid
     and not public.is_admin() and not public.is_agent() then
    return jsonb_build_object('ok', false, 'error', 'Not authorized');
  end if;

  select coalesce(sum(amount), 0) into v_total
  from public.payment_breakdowns
  where transaction_id = p_transaction_id;

  if v_total <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Payment breakdown is required before invoicing');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('label', label, 'amount', amount) order by sort_order), '[]'::jsonb)
  into v_breakdown
  from public.payment_breakdowns
  where transaction_id = p_transaction_id;

  v_invoice_number := public.next_property_invoice_number();

  insert into public.invoices (transaction_id, invoice_number, client_email, total_amount, currency, payment_status, metadata)
  values (
    p_transaction_id,
    v_invoice_number,
    v_tx.client_email,
    v_total,
    'AED',
    'pending',
    jsonb_build_object('breakdown', v_breakdown, 'transaction_number', v_tx.transaction_number)
  )
  returning id into v_invoice_id;

  if v_tx.client_user_id is not null then
    perform public.create_workflow_notification(
      v_tx.client_user_id,
      'client',
      'Invoice ready',
      'Invoice ' || v_invoice_number || ' is ready for payment.',
      '/account/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'invoice_id', v_invoice_id, 'invoice_number', v_invoice_number, 'total', v_total);
end;
$$;

create or replace function public.rpc_record_property_payment(p_transaction_id uuid, p_invoice_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_uid uuid := auth.uid();
begin
  select * into v_tx from public.property_transactions where id = p_transaction_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  if v_uid is not null and v_tx.client_user_id is distinct from v_uid
     and not public.is_admin() and not public.is_agent() then
    return jsonb_build_object('ok', false, 'error', 'Not authorized');
  end if;

  if v_tx.status not in ('payment_pending', 'contract_approved') then
    return jsonb_build_object('ok', false, 'error', 'Payment cannot be recorded at this stage');
  end if;

  if p_invoice_id is not null then
    update public.invoices
    set payment_status = 'paid'
    where id = p_invoice_id and transaction_id = p_transaction_id;
  else
    update public.invoices
    set payment_status = 'paid'
    where transaction_id = p_transaction_id and payment_status = 'pending';
  end if;

  update public.property_transactions
  set status = 'payment_completed', updated_at = now()
  where id = p_transaction_id;

  if v_tx.assigned_agent_id is not null then
    perform public.create_workflow_notification(
      (select auth_user_id from public.agents where id = v_tx.assigned_agent_id),
      'agent',
      'Payment received',
      'Payment recorded for ' || v_tx.transaction_number,
      '/agent/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  if v_tx.client_user_id is not null then
    perform public.create_workflow_notification(
      v_tx.client_user_id,
      'client',
      'Payment confirmed',
      'Your payment for ' || v_tx.transaction_number || ' has been received.',
      '/account/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'status', 'payment_completed');
end;
$$;

create or replace function public.rpc_schedule_handover(
  p_transaction_id uuid,
  p_handover_date date,
  p_handover_time time default null,
  p_meeting_location text default null,
  p_agent_notes text default null,
  p_required_documents text default null,
  p_key_collection_details text default null,
  p_possession_instructions text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_handover_id uuid;
  v_agent_id uuid := public.current_agent_id();
begin
  if v_agent_id is null and not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Agent access required');
  end if;

  select * into v_tx from public.property_transactions where id = p_transaction_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  if public.is_agent() and v_tx.assigned_agent_id is distinct from v_agent_id then
    return jsonb_build_object('ok', false, 'error', 'Not assigned to this transaction');
  end if;

  select id into v_handover_id from public.handover_records where transaction_id = p_transaction_id limit 1;

  if v_handover_id is null then
    insert into public.handover_records (
      transaction_id,
      handover_date,
      handover_time,
      meeting_location,
      agent_notes,
      required_documents,
      key_collection_details,
      possession_instructions,
      status
    ) values (
      p_transaction_id,
      p_handover_date,
      p_handover_time,
      nullif(trim(coalesce(p_meeting_location, '')), ''),
      nullif(trim(coalesce(p_agent_notes, '')), ''),
      nullif(trim(coalesce(p_required_documents, '')), ''),
      nullif(trim(coalesce(p_key_collection_details, '')), ''),
      nullif(trim(coalesce(p_possession_instructions, '')), ''),
      'scheduled'
    )
    returning id into v_handover_id;
  else
    update public.handover_records
    set
      handover_date = p_handover_date,
      handover_time = coalesce(p_handover_time, handover_time),
      meeting_location = coalesce(nullif(trim(coalesce(p_meeting_location, '')), ''), meeting_location),
      agent_notes = coalesce(nullif(trim(coalesce(p_agent_notes, '')), ''), agent_notes),
      required_documents = coalesce(nullif(trim(coalesce(p_required_documents, '')), ''), required_documents),
      key_collection_details = coalesce(nullif(trim(coalesce(p_key_collection_details, '')), ''), key_collection_details),
      possession_instructions = coalesce(nullif(trim(coalesce(p_possession_instructions, '')), ''), possession_instructions),
      status = 'scheduled',
      updated_at = now()
    where transaction_id = p_transaction_id;
  end if;

  update public.property_transactions
  set status = 'handover_scheduled', updated_at = now()
  where id = p_transaction_id;

  if v_tx.client_user_id is not null then
    perform public.create_workflow_notification(
      v_tx.client_user_id,
      'client',
      'Handover scheduled',
      'Your property handover has been scheduled for ' || p_handover_date::text,
      '/account/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'handover_id', v_handover_id, 'status', 'handover_scheduled');
end;
$$;

create or replace function public.rpc_complete_handover(p_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_agent_id uuid := public.current_agent_id();
begin
  if v_agent_id is null and not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Agent access required');
  end if;

  select * into v_tx from public.property_transactions where id = p_transaction_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  update public.handover_records
  set status = 'completed', updated_at = now()
  where transaction_id = p_transaction_id;

  update public.property_transactions
  set status = 'transaction_completed', updated_at = now()
  where id = p_transaction_id;

  if v_tx.client_user_id is not null then
    perform public.create_workflow_notification(
      v_tx.client_user_id,
      'client',
      'Transaction completed',
      'Your property transaction ' || v_tx.transaction_number || ' is complete.',
      '/account/transactions/' || p_transaction_id::text,
      p_transaction_id
    );
  end if;

  return jsonb_build_object('ok', true, 'status', 'transaction_completed');
end;
$$;

create or replace function public.rpc_get_contract_data(p_transaction_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_property public.products%rowtype;
  v_agency public.agency_settings%rowtype;
  v_agent public.agents%rowtype;
  v_client public.client_profiles%rowtype;
begin
  select * into v_tx from public.property_transactions where id = p_transaction_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  select * into v_property from public.products where id = v_tx.property_id;
  select * into v_agency from public.agency_settings limit 1;
  if v_tx.assigned_agent_id is not null then
    select * into v_agent from public.agents where id = v_tx.assigned_agent_id;
  end if;
  if v_tx.client_user_id is not null then
    select * into v_client from public.client_profiles where user_id = v_tx.client_user_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'transaction', row_to_json(v_tx),
    'property', row_to_json(v_property),
    'agency', row_to_json(v_agency),
    'agent', row_to_json(v_agent),
    'client', row_to_json(v_client)
  );
end;
$$;

grant execute on function public.rpc_create_property_invoice(uuid) to authenticated;
grant execute on function public.rpc_record_property_payment(uuid, uuid) to authenticated;
grant execute on function public.rpc_schedule_handover(uuid, date, time, text, text, text, text, text) to authenticated;
grant execute on function public.rpc_complete_handover(uuid) to authenticated;
grant execute on function public.rpc_get_contract_data(uuid) to authenticated;
