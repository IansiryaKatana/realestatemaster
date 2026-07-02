-- GW Vacation Homes rebrand, real-estate nav, property content, listing filters

-- ── Branding ──────────────────────────────────────────────────────────────────
insert into public.site_settings (key, value) values
  ('site_name', 'GW Vacation Homes'),
  ('logo_text', 'GW VACATION HOMES'),
  ('store_name', 'GW Vacation Homes'),
  ('footer_tagline', 'Premium vacation homes and properties for rent and sale across Dubai.'),
  ('newsletter_heading', 'Get new listings in your inbox'),
  ('contact_whatsapp_message', 'Hello! I am interested in a property on GW Vacation Homes.'),
  ('quote_notification_email', 'inquiries@gwvachomes.example'),
  ('email_from_name', 'GW Vacation Homes'),
  ('email_footer_text', 'Thank you for choosing GW Vacation Homes.'),
  ('default_delivery_info', '<p>Handover is coordinated by your assigned agent. Keys, access cards, and utility transfer guidance are provided on move-in day. Ejari registration and DEWA connection support are included for rental properties.</p>'),
  ('default_handover_info', '<p>Standard handover includes a walkthrough, key collection, and checklist sign-off. Allow 1–2 hours for villa handovers and 30–45 minutes for apartments.</p>')
on conflict (key) do update set value = excluded.value;

update public.agency_settings set
  agency_name = 'GW Vacation Homes',
  company_email = 'hello@gwvachomes.example',
  updated_at = now()
where agency_name = 'EmirAxis Real Estate' or agency_name ilike '%emiraxis%';

-- Hide legacy ecommerce categories from navigation
update public.categories set is_active = false where is_active = true;

-- Real-estate header / footer nav
update public.nav_links set is_active = false where location = 'header' and label in ('Bundles', 'Properties');
update public.nav_links set
  label = 'Contact',
  href = '/pages/contact',
  location = 'header',
  sort_order = 2,
  is_active = true
where id = (select id from public.nav_links where location = 'header' and label = 'Home' limit 1);

insert into public.nav_links (label, href, location, sort_order, is_active)
select 'Contact', '/pages/contact', 'header', 2, true
where not exists (select 1 from public.nav_links where location = 'header' and href = '/pages/contact');

update public.nav_links set
  label = 'Holiday Rentals',
  href = '/collection/rentals',
  location = 'footer_categories',
  sort_order = 0
where label in ('New Arrivals', 'Properties') and location = 'footer_categories';

update public.hero_slides set
  headline_lines = '["Find Your", "Dream", "Vacation Home"]'::jsonb,
  cta_label = 'Browse Properties',
  cta_url = '/collection/all'
where sort_order = 0;

update public.homepage_sections set
  title = 'Newly Listed Properties',
  subtitle = 'Fresh vacation homes and residences across Dubai.',
  cta_label = 'View All',
  cta_url = '/collection/all'
where section_key = 'newly_dropped';

update public.homepage_sections set
  title = 'Featured Rentals',
  subtitle = 'Hand-picked holiday rentals with flexible move-in dates.',
  cta_label = 'View Rentals',
  cta_url = '/collection/rentals'
where section_key = 'summer_collections';

update public.homepage_sections set
  title = 'Find Your Next Stay With GW Vacation Homes.',
  cta_label = 'Browse Properties',
  cta_url = '/collection/all'
where section_key = 'final_cta';

-- ── Handover text for properties (not ecommerce delivery) ─────────────────────
create or replace function public.resolve_product_delivery_text(p_product_id uuid)
returns text
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_default text;
begin
  select * into v_product from public.products where id = p_product_id;
  if not found then return null; end if;

  if v_product.listing_type is not null then
    if nullif(btrim(coalesce(v_product.contract_terms, '')), '') is not null then
      return v_product.contract_terms;
    end if;
    if not coalesce(v_product.use_default_delivery, true)
      and nullif(btrim(coalesce(v_product.delivery_info, '')), '') is not null then
      return v_product.delivery_info;
    end if;
    select value into v_default from public.site_settings where key = 'default_handover_info' limit 1;
    return v_default;
  end if;

  if coalesce(v_product.use_default_delivery, true) then
    select value into v_default from public.site_settings where key = 'default_delivery_info' limit 1;
    if v_default is not null and btrim(v_default) <> '' then
      return v_default;
    end if;
    return null;
  end if;

  return nullif(btrim(coalesce(v_product.delivery_info, '')), '');
end;
$$;

-- Rent / sale collection filters
create or replace function public.rpc_list_storefront_products(
  p_filter text default 'all',
  p_slug text default null,
  p_limit int default 12,
  p_offset int default 0,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_in_stock_only boolean default false,
  p_sort text default 'default'
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
  v_filter text := lower(coalesce(btrim(p_filter), 'all'));
  v_sort text := lower(coalesce(btrim(p_sort), 'default'));
begin
  select count(*) into v_total
  from public.products p
  where p.published = true
    and (p_min_price is null or p.price >= p_min_price)
    and (p_max_price is null or p.price <= p_max_price)
    and (not p_in_stock_only or p.inventory_count > 0)
    and (
      v_filter = 'all'
      or (v_filter = 'new' and p.is_new = true)
      or (v_filter = 'best' and p.is_featured = true)
      or (v_filter in ('deals', 'summer') and p.is_summer = true)
      or (v_filter = 'rent' and p.listing_type = 'rent')
      or (v_filter = 'sale' and p.listing_type = 'sale')
      or (v_filter = 'collection' and p_slug is not null and exists (
        select 1 from public.collections c where c.id = p.collection_id and c.is_active and c.slug = btrim(p_slug)))
      or (v_filter = 'category' and p_slug is not null and p.category_id in (
        with recursive cat_tree as (
          select c.id from public.categories c where c.slug = btrim(p_slug) and c.is_active
          union all
          select ch.id from public.categories ch inner join cat_tree t on ch.parent_id = t.id where ch.is_active
        ) select id from cat_tree))
    );

  select coalesce(jsonb_agg(to_jsonb(sub)), '[]'::jsonb) into v_items
  from (
    select p.*
    from public.products p
    where p.published = true
      and (p_min_price is null or p.price >= p_min_price)
      and (p_max_price is null or p.price <= p_max_price)
      and (not p_in_stock_only or p.inventory_count > 0)
      and (
        v_filter = 'all' or (v_filter = 'new' and p.is_new = true) or (v_filter = 'best' and p.is_featured = true)
        or (v_filter in ('deals', 'summer') and p.is_summer = true)
        or (v_filter = 'rent' and p.listing_type = 'rent')
        or (v_filter = 'sale' and p.listing_type = 'sale')
        or (v_filter = 'collection' and p_slug is not null and exists (
          select 1 from public.collections c where c.id = p.collection_id and c.is_active and c.slug = btrim(p_slug)))
        or (v_filter = 'category' and p_slug is not null and p.category_id in (
          with recursive cat_tree as (
            select c.id from public.categories c where c.slug = btrim(p_slug) and c.is_active
            union all
            select ch.id from public.categories ch inner join cat_tree t on ch.parent_id = t.id where ch.is_active
          ) select id from cat_tree))
      )
    order by
      case when v_sort = 'price_asc' then p.price end asc nulls last,
      case when v_sort = 'price_desc' then p.price end desc nulls last,
      case when v_sort = 'name' then p.name end asc nulls last,
      p.sort_order asc,
      p.created_at desc
    limit greatest(coalesce(p_limit, 12), 1)
    offset greatest(coalesce(p_offset, 0), 0)
  ) sub;

  return jsonb_build_object('ok', true, 'items', v_items, 'total', v_total);
end;
$$;

grant execute on function public.rpc_list_storefront_products(text, text, int, int, numeric, numeric, boolean, text) to anon, authenticated;

-- ── Enrich all seeded properties with realistic field content ─────────────────
update public.products p set
  sku = coalesce(nullif(btrim(sku), ''), property_reference),
  weight_kg = coalesce(weight_kg, 0),
  inventory_count = greatest(inventory_count, 1),
  use_default_delivery = false,
  description = coalesce(
    nullif(btrim(description), ''),
    p.name || ' is a premium ' || coalesce((select lower(pt.name) from public.property_types pt where pt.id = p.property_type_id), 'property')
      || ' in ' || coalesce((select pa.name from public.property_areas pa where pa.id = p.area_id), 'Dubai')
      || ', managed by GW Vacation Homes. Spacious layout, quality finishes, and full agency support from viewing through handover.'
  ),
  delivery_info = case p.listing_type
    when 'rent' then '<p><strong>Move-in process:</strong> Security deposit and first cheque due before key handover. Ejari registration within 5 business days. DEWA and chiller transfer arranged with building management.</p>'
    when 'sale' then '<p><strong>Completion:</strong> Booking deposit secures the unit. Transfer at Dubai Land Department on agreed date. Snagging visit and NOC clearance coordinated by your agent.</p>'
    else delivery_info
  end,
  contract_terms = coalesce(
    nullif(btrim(contract_terms), ''),
    case p.listing_type
      when 'rent' then '<p>12-month tenancy minimum unless stated otherwise. One month security deposit. Agency commission as per RERA. Handover includes key collection, access cards, and parking remote where applicable.</p>'
      when 'sale' then '<p>Sale subject to owner confirmation and DLD transfer. Agency commission disclosed before offer acceptance. Handover within 30–60 days of full payment unless otherwise agreed.</p>'
      else contract_terms
    end
  ),
  gallery_urls = case
    when gallery_urls is null or gallery_urls = '[]'::jsonb then
      jsonb_build_array(
        coalesce(nullif(image_url, ''), 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'),
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
      )
    else gallery_urls
  end,
  specs = case
    when specs is null or specs = '[]'::jsonb or jsonb_array_length(specs) < 3 then
      jsonb_build_array(
        jsonb_build_object('key', 'Reference', 'value', coalesce(property_reference, 'On request')),
        jsonb_build_object('key', 'Listing', 'value', initcap(coalesce(listing_type, 'property'))),
        jsonb_build_object('key', 'Area', 'value', coalesce((select name from public.property_areas where id = p.area_id), 'Dubai')),
        jsonb_build_object('key', 'Type', 'value', coalesce((select name from public.property_types where id = p.property_type_id), 'Residential')),
        jsonb_build_object('key', 'Furnishing', 'value', coalesce((select name from public.furnishing_statuses where id = p.furnishing_status_id), 'As listed')),
        jsonb_build_object('key', 'Status', 'value', coalesce((select name from public.property_statuses where id = p.property_status_id), 'Available')),
        jsonb_build_object('key', 'Available from', 'value', coalesce(availability_date::text, 'Immediate'))
      )
    else specs
  end,
  updated_at = now()
where p.listing_type is not null;

-- Link amenities to all properties (varied sets)
insert into public.property_amenities (property_id, amenity_id)
select p.id, a.id
from public.products p
cross join public.amenities a
where p.listing_type is not null
  and a.slug in ('swimming-pool', 'parking', 'central-ac', 'security')
on conflict do nothing;

insert into public.property_amenities (property_id, amenity_id)
select p.id, a.id
from public.products p
cross join public.amenities a
where p.listing_type = 'rent'
  and p.bedrooms >= 2
  and a.slug in ('gym', 'balcony', 'built-in-wardrobes')
on conflict do nothing;

insert into public.property_amenities (property_id, amenity_id)
select p.id, a.id
from public.products p
cross join public.amenities a
where p.listing_type = 'sale'
  and p.bedrooms >= 3
  and a.slug in ('garden', 'sea-view', 'maid-room')
on conflict do nothing;
