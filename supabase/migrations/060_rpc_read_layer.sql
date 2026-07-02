-- RPC read layer: tenancy, property lookups, and admin list screens.
-- Moves joins, filtering, and aggregation server-side.

-- ---------------------------------------------------------------------------
-- Property lookups (single round-trip)
-- ---------------------------------------------------------------------------
create or replace function public.rpc_get_property_lookups()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_areas jsonb;
  v_types jsonb;
  v_statuses jsonb;
  v_furnishing jsonb;
  v_agents jsonb;
  v_amenities jsonb;
begin
  if not (public.is_admin_reader() or public.is_agent()) then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  select coalesce(jsonb_object_agg(id, jsonb_build_object(
    'name', name, 'city', city, 'latitude', latitude, 'longitude', longitude
  )), '{}'::jsonb) into v_areas from public.property_areas where is_active = true;

  select coalesce(jsonb_object_agg(id, jsonb_build_object('name', name)), '{}'::jsonb)
  into v_types from public.property_types where is_active = true;

  select coalesce(jsonb_object_agg(id, jsonb_build_object('name', name)), '{}'::jsonb)
  into v_statuses from public.property_statuses where is_active = true;

  select coalesce(jsonb_object_agg(id, jsonb_build_object('name', name)), '{}'::jsonb)
  into v_furnishing from public.furnishing_statuses where is_active = true;

  select coalesce(jsonb_object_agg(id, jsonb_build_object(
    'name', name, 'photoUrl', photo_url, 'email', email, 'phone', phone,
    'whatsapp', whatsapp, 'licenseNumber', license_number
  )), '{}'::jsonb) into v_agents from public.agents where is_active = true;

  select coalesce(jsonb_object_agg(id, jsonb_build_object('name', name, 'icon', icon)), '{}'::jsonb)
  into v_amenities from public.amenities where is_active = true;

  return jsonb_build_object(
    'ok', true,
    'areas', v_areas,
    'types', v_types,
    'statuses', v_statuses,
    'furnishing', v_furnishing,
    'agents', v_agents,
    'amenities', v_amenities
  );
end;
$$;

grant execute on function public.rpc_get_property_lookups() to authenticated;

-- ---------------------------------------------------------------------------
-- Tenancy reads (RLS enforced via security invoker)
-- ---------------------------------------------------------------------------
create or replace function public.rpc_list_leases()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(row))
      from (
        select l.*, jsonb_build_object(
          'name', p.name,
          'slug', p.slug,
          'property_reference', p.property_reference
        ) as products
        from public.leases l
        left join public.products p on p.id = l.product_id
        order by l.created_at desc
      ) row
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_leases() to authenticated;

create or replace function public.rpc_list_rent_installments(p_lease_id uuid default null)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(row))
      from (
        select ri.*, jsonb_build_object(
          'product_id', l.product_id,
          'tenant_user_id', l.tenant_user_id,
          'products', jsonb_build_object('name', p.name)
        ) as leases
        from public.rent_installments ri
        join public.leases l on l.id = ri.lease_id
        left join public.products p on p.id = l.product_id
        where p_lease_id is null or ri.lease_id = p_lease_id
        order by ri.due_date
      ) row
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_rent_installments(uuid) to authenticated;

create or replace function public.rpc_list_pending_rent_payments()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(row))
      from (
        select rp.*, jsonb_build_object(
          'due_date', ri.due_date,
          'amount', ri.amount,
          'lease_id', ri.lease_id,
          'leases', jsonb_build_object(
            'products', jsonb_build_object('name', p.name)
          )
        ) as rent_installments
        from public.rent_payments rp
        join public.rent_installments ri on ri.id = rp.installment_id
        join public.leases l on l.id = ri.lease_id
        left join public.products p on p.id = l.product_id
        where rp.status = 'pending_verification'
        order by rp.created_at desc
      ) row
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_pending_rent_payments() to authenticated;

create or replace function public.rpc_list_service_requests(p_type text default null)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(row))
      from (
        select sr.*, jsonb_build_object('name', p.name) as products
        from public.service_requests sr
        left join public.products p on p.id = sr.product_id
        where p_type is null or btrim(p_type) = '' or sr.request_type = p_type
        order by sr.created_at desc
      ) row
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_service_requests(text) to authenticated;

create or replace function public.rpc_list_property_owners()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(po) order by po.full_name)
      from public.property_owners po
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_property_owners() to authenticated;

create or replace function public.rpc_get_tenant_active_lease()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'lease', (
      select to_jsonb(row)
      from (
        select l.*, jsonb_build_object(
          'name', p.name,
          'slug', p.slug,
          'image_url', p.image_url,
          'property_reference', p.property_reference
        ) as products
        from public.leases l
        left join public.products p on p.id = l.product_id
        where l.tenant_user_id = (select auth.uid())
          and l.status in ('pending', 'active', 'notice')
        order by l.created_at desc
        limit 1
      ) row
    )
  );
$$;

grant execute on function public.rpc_get_tenant_active_lease() to authenticated;

create or replace function public.rpc_list_tenant_installments(p_lease_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(ri) order by ri.due_date)
      from public.rent_installments ri
      where ri.lease_id = p_lease_id
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_tenant_installments(uuid) to authenticated;

create or replace function public.rpc_get_move_in_checklist(p_lease_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'checklist', (
      select to_jsonb(mc)
      from public.move_in_checklists mc
      where mc.lease_id = p_lease_id
      limit 1
    )
  );
$$;

grant execute on function public.rpc_get_move_in_checklist(uuid) to authenticated;

create or replace function public.rpc_list_move_in_checklists()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(row))
      from (
        select mc.*, jsonb_build_object(
          'products', jsonb_build_object('name', p.name, 'property_reference', p.property_reference)
        ) as leases
        from public.move_in_checklists mc
        join public.leases l on l.id = mc.lease_id
        left join public.products p on p.id = l.product_id
        order by mc.created_at desc
      ) row
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_move_in_checklists() to authenticated;

create or replace function public.rpc_list_tenant_documents(p_lease_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(td) order by td.created_at desc)
      from public.tenant_documents td
      where td.lease_id = p_lease_id
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_tenant_documents(uuid) to authenticated;

create or replace function public.rpc_list_landlord_portfolio(p_owner_id uuid default null)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(row))
      from (
        select poa.*, jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'slug', p.slug,
          'image_url', p.image_url,
          'property_reference', p.property_reference,
          'property_status_id', p.property_status_id
        ) as products
        from public.property_owner_assignments poa
        join public.products p on p.id = poa.product_id
        where poa.property_owner_id = coalesce(p_owner_id, public.current_landlord_id())
      ) row
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_landlord_portfolio(uuid) to authenticated;

create or replace function public.rpc_list_landlord_statements(p_owner_id uuid default null)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(os) order by os.period_end desc)
      from public.owner_statements os
      where os.property_owner_id = coalesce(p_owner_id, public.current_landlord_id())
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_landlord_statements(uuid) to authenticated;

create or replace function public.rpc_list_role_notifications(p_role text)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(n))
      from (
        select *
        from public.notifications n
        where n.recipient_role = p_role
        order by n.created_at desc
        limit 50
      ) n
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_role_notifications(text) to authenticated;

create or replace function public.rpc_list_agent_leases(p_agent_id uuid default null)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(row))
      from (
        select l.*, jsonb_build_object(
          'name', p.name,
          'property_reference', p.property_reference
        ) as products
        from public.leases l
        left join public.products p on p.id = l.product_id
        where l.assigned_agent_id = coalesce(p_agent_id, public.current_agent_id())
          and l.status in ('active', 'notice')
        order by l.start_date desc
      ) row
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.rpc_list_agent_leases(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin list reads
-- ---------------------------------------------------------------------------
create or replace function public.rpc_list_admin_reviews(
  p_limit int default 20,
  p_offset int default 0,
  p_status text default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_total bigint;
  v_items jsonb;
begin
  if not public.is_admin_reader() then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  select count(*) into v_total
  from public.product_reviews pr
  where p_status is null or btrim(p_status) = '' or pr.status = p_status;

  select coalesce(jsonb_agg(to_jsonb(row)), '[]'::jsonb) into v_items
  from (
    select pr.*, p.name as product_name
    from public.product_reviews pr
    left join public.products p on p.id = pr.product_id
    where p_status is null or btrim(p_status) = '' or pr.status = p_status
    order by pr.created_at desc
    limit greatest(coalesce(p_limit, 20), 1)
    offset greatest(coalesce(p_offset, 0), 0)
  ) row;

  return jsonb_build_object('ok', true, 'items', v_items, 'total', v_total);
end;
$$;

grant execute on function public.rpc_list_admin_reviews(int, int, text) to authenticated;

create or replace function public.rpc_list_admin_invoices(
  p_limit int default 100,
  p_offset int default 0,
  p_search text default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_total bigint;
  v_items jsonb;
  v_q text := nullif(btrim(p_search), '');
begin
  if not public.is_admin_reader() then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  select count(*) into v_total
  from public.invoices i
  left join public.property_transactions pt on pt.id = i.transaction_id
  where v_q is null
    or i.invoice_number ilike '%' || v_q || '%'
    or i.client_email ilike '%' || v_q || '%'
    or pt.transaction_number ilike '%' || v_q || '%';

  select coalesce(jsonb_agg(to_jsonb(row)), '[]'::jsonb) into v_items
  from (
    select i.*, pt.transaction_number, pt.status as transaction_status
    from public.invoices i
    left join public.property_transactions pt on pt.id = i.transaction_id
    where v_q is null
      or i.invoice_number ilike '%' || v_q || '%'
      or i.client_email ilike '%' || v_q || '%'
      or pt.transaction_number ilike '%' || v_q || '%'
    order by i.issued_at desc
    limit greatest(coalesce(p_limit, 100), 1)
    offset greatest(coalesce(p_offset, 0), 0)
  ) row;

  return jsonb_build_object('ok', true, 'items', v_items, 'total', v_total);
end;
$$;

grant execute on function public.rpc_list_admin_invoices(int, int, text) to authenticated;

-- Generic admin sorted list helper tables
create or replace function public.rpc_list_admin_categories()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(c) order by c.sort_order) from public.categories c), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_categories() to authenticated;

create or replace function public.rpc_list_admin_collections()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(c) order by c.sort_order) from public.collections c), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_collections() to authenticated;

create or replace function public.rpc_list_admin_hero_slides()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(h) order by h.sort_order) from public.hero_slides h), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_hero_slides() to authenticated;

create or replace function public.rpc_list_admin_feature_cards()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(f) order by f.sort_order) from public.feature_cards f), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_feature_cards() to authenticated;

create or replace function public.rpc_list_admin_nav_links()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(n) order by n.sort_order) from public.nav_links n), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_nav_links() to authenticated;

create or replace function public.rpc_list_admin_social_links()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(s) order by s.sort_order) from public.social_links s), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_social_links() to authenticated;

create or replace function public.rpc_list_admin_homepage_sections()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(h) order by h.sort_order) from public.homepage_sections h), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_homepage_sections() to authenticated;

create or replace function public.rpc_list_admin_lifestyle_cards()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(l) order by l.sort_order) from public.lifestyle_cards l), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_lifestyle_cards() to authenticated;

create or replace function public.rpc_list_admin_pages()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(p) order by p.updated_at desc) from public.marketing_pages p), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_pages() to authenticated;

create or replace function public.rpc_list_admin_newsletter()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at desc) from public.newsletter_subscribers n), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_newsletter() to authenticated;

create or replace function public.rpc_list_admin_coupons()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at desc) from public.coupons c), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_coupons() to authenticated;

create or replace function public.rpc_list_admin_users()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(u) order by u.created_at desc) from public.admin_users u), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_users() to authenticated;

create or replace function public.rpc_list_admin_agents()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(a) order by a.name) from public.agents a), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_agents() to authenticated;

create or replace function public.rpc_list_admin_property_inquiries()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.created_at desc) from public.property_inquiries i), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_property_inquiries() to authenticated;

create or replace function public.rpc_list_admin_form_submissions()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(f) order by f.created_at desc) from public.form_submissions f), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_form_submissions() to authenticated;

create or replace function public.rpc_list_admin_site_settings()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(s) order by s.key) from public.site_settings s), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_site_settings() to authenticated;

create or replace function public.rpc_list_admin_bundles()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object('ok', true, 'items', coalesce((select jsonb_agg(to_jsonb(b) order by b.sort_order) from public.product_bundles b), '[]'::jsonb))
  else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_admin_bundles() to authenticated;

create or replace function public.rpc_get_admin_agency_settings()
returns jsonb language sql stable security invoker set search_path = public as $$
  select case when public.is_admin_reader() then jsonb_build_object(
    'ok', true,
    'agency', (select to_jsonb(a) from public.agency_settings a limit 1),
    'favicon_url', (select value from public.site_settings where key = 'favicon_url' limit 1)
  ) else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_get_admin_agency_settings() to authenticated;
