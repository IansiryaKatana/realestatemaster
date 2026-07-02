-- Additional tenancy workflow RPCs (maintenance, owner statements)

create or replace function public.rpc_update_service_request_status(
  p_request_id uuid,
  p_status text,
  p_assigned_agent_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.service_requests%rowtype;
begin
  if not (public.is_admin() or public.is_agent()) then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  select * into v_req from public.service_requests where id = p_request_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Request not found');
  end if;

  if public.is_agent() and v_req.assigned_agent_id is distinct from public.current_agent_id() then
    return jsonb_build_object('ok', false, 'error', 'Not assigned to this request');
  end if;

  update public.service_requests
  set
    status = p_status,
    assigned_agent_id = coalesce(p_assigned_agent_id, assigned_agent_id),
    resolved_at = case when p_status in ('resolved', 'closed') then now() else resolved_at end,
    updated_at = now()
  where id = p_request_id;

  insert into public.notifications (user_id, recipient_role, title, body, link_href)
  values (
    v_req.tenant_user_id, 'tenant',
    'Service request updated',
    'Your ' || v_req.request_type || ' "' || v_req.title || '" is now ' || p_status || '.',
    case when v_req.request_type = 'complaint' then '/tenant/complaints' else '/tenant/maintenance' end
  );

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rpc_generate_owner_statement(
  p_owner_id uuid,
  p_period_start date,
  p_period_end date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gross numeric(12,2) := 0;
  v_fees numeric(12,2) := 0;
  v_net numeric(12,2) := 0;
  v_statement_id uuid;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  select coalesce(sum(ri.amount), 0) into v_gross
  from public.rent_installments ri
  join public.leases l on l.id = ri.lease_id
  join public.property_owner_assignments poa on poa.product_id = l.product_id
  where poa.property_owner_id = p_owner_id
    and ri.status = 'paid'
    and ri.due_date between p_period_start and p_period_end;

  select coalesce(sum(ri.amount * poa.management_fee_pct / 100), 0) into v_fees
  from public.rent_installments ri
  join public.leases l on l.id = ri.lease_id
  join public.property_owner_assignments poa on poa.product_id = l.product_id
  where poa.property_owner_id = p_owner_id
    and ri.status = 'paid'
    and ri.due_date between p_period_start and p_period_end;

  v_net := v_gross - v_fees;

  insert into public.owner_statements (property_owner_id, period_start, period_end, gross_rent, fees, net_payout)
  values (p_owner_id, p_period_start, p_period_end, v_gross, v_fees, v_net)
  returning id into v_statement_id;

  return jsonb_build_object('ok', true, 'statement_id', v_statement_id, 'net_payout', v_net);
end;
$$;

create or replace function public.rpc_toggle_move_in_item(
  p_checklist_id uuid,
  p_item_id text,
  p_done boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
  v_lease_id uuid;
begin
  select lease_id, items into v_lease_id, v_items
  from public.move_in_checklists where id = p_checklist_id;

  if v_lease_id is null then
    return jsonb_build_object('ok', false, 'error', 'Checklist not found');
  end if;

  if not (
    public.is_admin()
    or public.is_agent()
    or exists (select 1 from public.leases where id = v_lease_id and tenant_user_id = auth.uid())
  ) then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  v_items := (
    select jsonb_agg(
      case when elem->>'id' = p_item_id
        then jsonb_set(elem, '{done}', to_jsonb(p_done))
        else elem
      end
    )
    from jsonb_array_elements(v_items) elem
  );

  update public.move_in_checklists set items = v_items, updated_at = now() where id = p_checklist_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.rpc_update_service_request_status(uuid, text, uuid) to authenticated;
grant execute on function public.rpc_generate_owner_statement(uuid, date, date) to authenticated;
grant execute on function public.rpc_toggle_move_in_item(uuid, text, boolean) to authenticated;
