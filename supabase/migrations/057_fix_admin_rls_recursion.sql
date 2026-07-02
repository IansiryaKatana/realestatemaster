-- Fix RLS infinite recursion introduced by is_admin_reader() + admin_reader policies.
-- Root cause: security invoker helpers query admin_users, which re-triggers policies
-- that call the same helpers → "stack depth limit exceeded" (500 on RPC + leases).

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au
    where au.auth_user_id = (select auth.uid())
      and au.is_active = true
      and au.role in ('owner', 'admin', 'editor')
  );
$$;

create or replace function public.is_admin_reader()
returns boolean
language sql
stable
security definer
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
security definer
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

-- Viewers/editors/owners can list admin users without recursive policy checks.
create or replace function public.can_view_all_admin_users()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au
    where au.auth_user_id = (select auth.uid())
      and au.is_active = true
      and au.role in ('owner', 'admin', 'editor', 'viewer')
  );
$$;

drop policy if exists admin_reader_select_admin_users on public.admin_users;
create policy admin_reader_select_admin_users on public.admin_users
  for select to authenticated
  using (public.can_view_all_admin_users());

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin_reader() from public;
revoke all on function public.can_view_all_admin_users() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin_reader() to authenticated;
grant execute on function public.can_view_all_admin_users() to authenticated;
grant execute on function public.rpc_get_admin_session() to authenticated;
