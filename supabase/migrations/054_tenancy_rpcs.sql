-- Tenancy RPCs: lease activation, rent verification, dashboards

create or replace function public.rpc_activate_lease_from_transaction(p_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.property_transactions%rowtype;
  v_product public.products%rowtype;
  v_lease_id uuid;
  v_cheque_count int;
  v_i int;
  v_due date;
  v_handover public.handover_records%rowtype;
  v_rented_status_id uuid;
begin
  if not (public.is_admin() or public.is_agent()) then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  select * into v_tx from public.property_transactions where id = p_transaction_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Transaction not found');
  end if;

  if v_tx.listing_type <> 'rent' then
    return jsonb_build_object('ok', false, 'error', 'Only rental transactions can become leases');
  end if;

  if v_tx.status not in ('handover_completed', 'transaction_completed', 'handover_scheduled', 'handover_pending') then
    return jsonb_build_object('ok', false, 'error', 'Transaction is not ready for lease activation');
  end if;

  if v_tx.client_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'Transaction has no linked client account');
  end if;

  select * into v_product from public.products where id = v_tx.property_id;

  insert into public.leases (
    property_transaction_id, product_id, tenant_user_id, assigned_agent_id,
    start_date, rent_amount, payment_frequency, cheque_count, security_deposit, status
  ) values (
    v_tx.id, v_tx.property_id, v_tx.client_user_id, v_tx.assigned_agent_id,
    coalesce(current_date, current_date), coalesce(v_product.price, 0),
    case when coalesce(v_product.rent_payment_cheques, 1) > 1 then 'cheque' else 'monthly' end,
    coalesce(v_product.rent_payment_cheques, 12),
    v_product.security_deposit, 'active'
  )
  returning id into v_lease_id;

  v_cheque_count := greatest(coalesce(v_product.rent_payment_cheques, 12), 1);
  v_due := current_date;

  for v_i in 1..v_cheque_count loop
    insert into public.rent_installments (lease_id, due_date, amount, installment_type, status)
    values (
      v_lease_id,
      v_due + ((v_i - 1) * interval '1 month'),
      round(coalesce(v_product.price, 0) / v_cheque_count, 2),
      'rent',
      case when v_i = 1 then 'due' else 'scheduled' end
    );
  end loop;

  if v_product.security_deposit is not null and v_product.security_deposit > 0 then
    insert into public.rent_installments (lease_id, due_date, amount, installment_type, status)
    values (v_lease_id, current_date, v_product.security_deposit, 'deposit', 'due');
  end if;

  select * into v_handover from public.handover_records where transaction_id = v_tx.id limit 1;
  if found then
    insert into public.move_in_checklists (lease_id, handover_record_id, items)
    values (
      v_lease_id,
      v_handover.id,
      jsonb_build_array(
        jsonb_build_object('id', 'keys', 'label', 'Collect keys', 'done', false),
        jsonb_build_object('id', 'ejari', 'label', 'Ejari registration', 'done', false),
        jsonb_build_object('id', 'dewa', 'label', 'DEWA connection', 'done', false),
        jsonb_build_object('id', 'inspection', 'label', 'Move-in inspection', 'done', false)
      )
    );
  end if;

  select id into v_rented_status_id from public.property_statuses where lower(name) = 'rented' limit 1;
  if v_rented_status_id is not null then
    update public.products set property_status_id = v_rented_status_id where id = v_product.id;
  end if;

  update public.property_transactions
  set status = 'transaction_completed', updated_at = now()
  where id = v_tx.id;

  insert into public.notifications (user_id, recipient_role, title, body, link_href, transaction_id)
  values (
    v_tx.client_user_id, 'tenant',
    'Welcome — your tenancy is active',
    'Your lease is now active. Open the Tenant Portal to view rent schedule and move-in checklist.',
    '/tenant', v_tx.id
  );

  return jsonb_build_object('ok', true, 'lease_id', v_lease_id);
end;
$$;

create or replace function public.rpc_verify_rent_payment(
  p_payment_id uuid,
  p_approve boolean,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.rent_payments%rowtype;
  v_installment public.rent_installments%rowtype;
  v_lease public.leases%rowtype;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  select * into v_payment from public.rent_payments where id = p_payment_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Payment not found');
  end if;

  select * into v_installment from public.rent_installments where id = v_payment.installment_id;
  select * into v_lease from public.leases where id = v_installment.lease_id;

  update public.rent_payments
  set
    status = case when p_approve then 'approved' else 'rejected' end,
    verified_by = auth.uid(),
    verified_at = now(),
    admin_notes = coalesce(p_notes, admin_notes)
  where id = p_payment_id;

  if p_approve then
    update public.rent_installments set status = 'paid', updated_at = now() where id = v_installment.id;
  end if;

  insert into public.notifications (user_id, recipient_role, title, body, link_href)
  values (
    v_lease.tenant_user_id, 'tenant',
    case when p_approve then 'Rent payment confirmed' else 'Rent payment needs attention' end,
    case when p_approve then 'Your rent payment has been verified.' else coalesce(p_notes, 'Please review your payment submission.') end,
    '/tenant/rent'
  );

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rpc_submit_rent_payment_proof(
  p_installment_id uuid,
  p_amount numeric,
  p_method text,
  p_proof_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lease_id uuid;
  v_payment_id uuid;
begin
  select l.id into v_lease_id
  from public.rent_installments ri
  join public.leases l on l.id = ri.lease_id
  where ri.id = p_installment_id and l.tenant_user_id = auth.uid();

  if v_lease_id is null then
    return jsonb_build_object('ok', false, 'error', 'Installment not found');
  end if;

  insert into public.rent_payments (installment_id, amount, payment_method, proof_url, submitted_by, status)
  values (p_installment_id, p_amount, p_method, p_proof_url, auth.uid(), 'pending_verification')
  returning id into v_payment_id;

  update public.rent_installments set status = 'pending_verification', updated_at = now()
  where id = p_installment_id;

  return jsonb_build_object('ok', true, 'payment_id', v_payment_id);
end;
$$;

create or replace function public.rpc_create_service_request(
  p_lease_id uuid,
  p_type text,
  p_category text,
  p_priority text,
  p_title text,
  p_description text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lease public.leases%rowtype;
  v_id uuid;
begin
  select * into v_lease from public.leases where id = p_lease_id and tenant_user_id = auth.uid();
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Lease not found');
  end if;

  insert into public.service_requests (
    lease_id, product_id, tenant_user_id, request_type, category, priority, title, description,
    assigned_agent_id, sla_due_at
  ) values (
    v_lease.id, v_lease.product_id, auth.uid(), p_type, p_category, p_priority, p_title, p_description,
    v_lease.assigned_agent_id,
    now() + interval '3 days'
  )
  returning id into v_id;

  return jsonb_build_object('ok', true, 'request_id', v_id);
end;
$$;

create or replace function public.rpc_get_tenancy_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin_reader() then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  return jsonb_build_object(
    'ok', true,
    'counts', jsonb_build_object(
      'active_leases', (select count(*) from public.leases where status = 'active'),
      'overdue_rent', (
        select count(*) from public.rent_installments
        where status in ('due', 'overdue') and due_date < current_date
      ),
      'pending_verification', (
        select count(*) from public.rent_payments where status = 'pending_verification'
      ),
      'open_complaints', (
        select count(*) from public.service_requests
        where request_type = 'complaint' and status in ('open', 'in_progress')
      ),
      'open_maintenance', (
        select count(*) from public.service_requests
        where request_type = 'maintenance' and status in ('open', 'in_progress')
      ),
      'landlords', (select count(*) from public.property_owners where is_active)
    )
  );
end;
$$;

grant execute on function public.rpc_activate_lease_from_transaction(uuid) to authenticated;
grant execute on function public.rpc_verify_rent_payment(uuid, boolean, text) to authenticated;
grant execute on function public.rpc_submit_rent_payment_proof(uuid, numeric, text, text) to authenticated;
grant execute on function public.rpc_create_service_request(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.rpc_get_tenancy_dashboard() to authenticated;
