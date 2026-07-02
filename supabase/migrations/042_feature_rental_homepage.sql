-- Feature rental listings on homepage "Featured Rentals" (summer_collections → is_summer)

update public.products
set is_summer = true, updated_at = now()
where slug in (
  'marina-view-2br-apartment',
  'marina-heights-1br-apartment',
  'downtown-boulevard-2br',
  'jvc-townhouse-3br',
  'business-bay-canal-view-2br',
  'palm-shoreline-4br-villa',
  'marina-walk-studio',
  'marina-crown-3br-penthouse'
)
and listing_type = 'rent';

-- Featured Rentals section: only published rental properties flagged is_summer
create or replace function public.rpc_get_homepage_products(p_section text default 'new')
returns setof public.products
language sql
stable
security invoker
set search_path = public
as $$
  select * from public.products p
  where p.published = true
    and (
      (p_section = 'new' and p.is_new = true)
      or (p_section = 'summer' and p.is_summer = true and p.listing_type = 'rent')
      or (p_section = 'all')
    )
  order by p.sort_order asc, p.created_at desc
  limit 8;
$$;

grant execute on function public.rpc_get_homepage_products(text) to anon, authenticated;
