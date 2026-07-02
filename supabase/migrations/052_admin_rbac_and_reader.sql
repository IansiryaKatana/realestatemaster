-- Admin RBAC: viewer read-only access + session flags for UI

create or replace function public.is_admin_reader()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au
    where au.auth_user_id = (select auth.uid())
      and au.is_active = true
      and au.role in ('owner', 'admin', 'editor', 'viewer')
  );
$$;

create or replace function public.rpc_get_admin_session()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_role text;
  v_active boolean;
begin
  select au.role, au.is_active
  into v_role, v_active
  from public.admin_users au
  where au.auth_user_id = (select auth.uid())
  limit 1;

  if v_role is null or not coalesce(v_active, false) then
    return jsonb_build_object(
      'ok', true,
      'is_admin', false,
      'can_edit', false,
      'can_manage_users', false,
      'role', null
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'is_admin', v_role in ('owner', 'admin', 'editor', 'viewer'),
    'can_edit', v_role in ('owner', 'admin', 'editor'),
    'can_manage_users', v_role in ('owner', 'admin'),
    'role', v_role
  );
end;
$$;

-- Viewer read-only SELECT on admin-managed tables (OR with existing write policies)
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'collections', 'products', 'hero_slides', 'feature_cards',
    'lifestyle_cards', 'homepage_sections', 'nav_links', 'site_settings', 'cms_media',
    'form_submissions', 'newsletter_subscribers', 'orders', 'order_items',
    'customers', 'coupons', 'checkout_settings', 'email_templates',
    'agents', 'agency_settings', 'property_inquiries', 'viewing_requests',
    'property_transactions', 'client_declarations', 'agent_approvals',
    'contract_requests', 'generated_contracts', 'uploaded_contracts',
    'payment_breakdowns', 'invoices', 'handover_records', 'notifications',
    'client_profiles', 'property_areas', 'property_types', 'furnishing_statuses',
    'property_statuses', 'amenities', 'property_amenities', 'marketing_pages',
    'social_links', 'bundles', 'bundle_items', 'product_reviews'
  ]
  loop
    begin
      execute format(
        'drop policy if exists admin_reader_select_%1$s on public.%1$I',
        t
      );
      execute format(
        'create policy admin_reader_select_%1$s on public.%1$I for select to authenticated using (public.is_admin_reader())',
        t
      );
    exception when undefined_table then
      null;
    end;
  end loop;
end;
$$;

drop policy if exists admin_reader_select_admin_users on public.admin_users;
create policy admin_reader_select_admin_users on public.admin_users
  for select to authenticated using (public.is_admin_reader());

grant execute on function public.is_admin_reader() to authenticated;
