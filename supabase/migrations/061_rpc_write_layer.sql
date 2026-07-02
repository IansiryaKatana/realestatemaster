-- RPC write layer: admin mutations and product saves (server-side validation).

create or replace function public.rpc_admin_require_edit()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;
end;
$$;

-- Product variants list (used by admin product editor)
create or replace function public.rpc_list_product_variants(p_product_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select case when public.is_admin_reader() then jsonb_build_object(
    'ok', true,
    'items', coalesce((
      select jsonb_agg(to_jsonb(pv) order by pv.sort_order, pv.name)
      from public.product_variants pv
      where pv.product_id = p_product_id
    ), '[]'::jsonb)
  ) else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_product_variants(uuid) to authenticated;

create or replace function public.rpc_list_product_amenity_ids(p_product_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select case when public.is_admin_reader() then jsonb_build_object(
    'ok', true,
    'ids', coalesce((
      select jsonb_agg(pa.amenity_id)
      from public.property_amenities pa
      where pa.property_id = p_product_id
    ), '[]'::jsonb)
  ) else jsonb_build_object('ok', false, 'error', 'Forbidden') end;
$$;
grant execute on function public.rpc_list_product_amenity_ids(uuid) to authenticated;

-- Generic admin delete by entity
create or replace function public.rpc_admin_delete(
  p_entity text,
  p_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.rpc_admin_require_edit();
  case p_entity
    when 'products' then delete from public.products where id = p_id;
    when 'categories' then delete from public.categories where id = p_id;
    when 'collections' then delete from public.collections where id = p_id;
    when 'hero_slides' then delete from public.hero_slides where id = p_id;
    when 'feature_cards' then delete from public.feature_cards where id = p_id;
    when 'nav_links' then delete from public.nav_links where id = p_id;
    when 'social_links' then delete from public.social_links where id = p_id;
    when 'homepage_sections' then delete from public.homepage_sections where id = p_id;
    when 'lifestyle_cards' then delete from public.lifestyle_cards where id = p_id;
    when 'pages' then delete from public.pages where id = p_id;
    when 'newsletter_subscribers' then delete from public.newsletter_subscribers where id = p_id;
    when 'coupons' then delete from public.coupons where id = p_id;
    when 'product_bundles' then delete from public.product_bundles where id = p_id;
    when 'admin_users' then delete from public.admin_users where id = p_id;
    when 'agents' then delete from public.agents where id = p_id;
    when 'product_reviews' then delete from public.product_reviews where id = p_id;
    when 'form_submissions' then delete from public.form_submissions where id = p_id;
    when 'cms_media' then delete from public.cms_media where id = p_id;
    when 'property_owners' then delete from public.property_owners where id = p_id;
    else return jsonb_build_object('ok', false, 'error', 'Unknown entity');
  end case;
  return jsonb_build_object('ok', true);
exception when others then
  return jsonb_build_object('ok', false, 'error', sqlerrm);
end;
$$;
grant execute on function public.rpc_admin_delete(text, uuid) to authenticated;

create or replace function public.rpc_admin_bulk_delete(
  p_entity text,
  p_ids uuid[]
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.rpc_admin_require_edit();
  case p_entity
    when 'products' then delete from public.products where id = any(p_ids);
    when 'categories' then delete from public.categories where id = any(p_ids);
    when 'collections' then delete from public.collections where id = any(p_ids);
    when 'hero_slides' then delete from public.hero_slides where id = any(p_ids);
    when 'feature_cards' then delete from public.feature_cards where id = any(p_ids);
    when 'nav_links' then delete from public.nav_links where id = any(p_ids);
    when 'social_links' then delete from public.social_links where id = any(p_ids);
    when 'homepage_sections' then delete from public.homepage_sections where id = any(p_ids);
    when 'lifestyle_cards' then delete from public.lifestyle_cards where id = any(p_ids);
    when 'newsletter_subscribers' then delete from public.newsletter_subscribers where id = any(p_ids);
    when 'coupons' then delete from public.coupons where id = any(p_ids);
    when 'product_bundles' then delete from public.product_bundles where id = any(p_ids);
    when 'cms_media' then delete from public.cms_media where id = any(p_ids);
    when 'form_submissions' then delete from public.form_submissions where id = any(p_ids);
    else return jsonb_build_object('ok', false, 'error', 'Unknown entity');
  end case;
  return jsonb_build_object('ok', true, 'count', coalesce(array_length(p_ids, 1), 0));
exception when others then
  return jsonb_build_object('ok', false, 'error', sqlerrm);
end;
$$;
grant execute on function public.rpc_admin_bulk_delete(text, uuid[]) to authenticated;

-- Upsert JSON row into whitelisted admin tables
create or replace function public.rpc_admin_upsert(
  p_entity text,
  p_payload jsonb,
  p_id uuid default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  perform public.rpc_admin_require_edit();
  case p_entity
    when 'categories' then
      if p_id is null then
        insert into public.categories select * from jsonb_populate_record(null::public.categories, p_payload) returning id into v_id;
      else
        update public.categories set (name, slug, parent_id, sort_order, is_active, image_url, updated_at) =
          (select name, slug, parent_id, sort_order, is_active, image_url, coalesce(updated_at, now()) from jsonb_populate_record(null::public.categories, p_payload))
        where id = p_id;
        v_id := p_id;
      end if;
    when 'collections' then
      if p_id is null then
        insert into public.collections select * from jsonb_populate_record(null::public.collections, p_payload) returning id into v_id;
      else
        update public.collections c set
          title = (p_payload->>'title'),
          slug = (p_payload->>'slug'),
          description = (p_payload->>'description'),
          cover_image_url = (p_payload->>'cover_image_url'),
          type = (p_payload->>'type'),
          sort_order = coalesce((p_payload->>'sort_order')::int, 0),
          is_active = coalesce((p_payload->>'is_active')::boolean, true),
          updated_at = now()
        where c.id = p_id;
        v_id := p_id;
      end if;
    else
      return jsonb_build_object('ok', false, 'error', 'Entity upsert not implemented: ' || p_entity);
  end case;
  return jsonb_build_object('ok', true, 'id', v_id);
exception when others then
  return jsonb_build_object('ok', false, 'error', sqlerrm);
end;
$$;
grant execute on function public.rpc_admin_upsert(text, jsonb, uuid) to authenticated;

-- Product save with variants sync
create or replace function public.rpc_save_admin_product(
  p_product jsonb,
  p_variants jsonb default '[]'::jsonb,
  p_amenity_ids uuid[] default '{}'::uuid[],
  p_product_id uuid default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_variant jsonb;
  v_kept_ids uuid[] := '{}'::uuid[];
  v_variant_id uuid;
begin
  perform public.rpc_admin_require_edit();

  if p_product_id is null then
    insert into public.products (
      name, slug, overview, description, price, compare_at_price, sku, weight_kg,
      specs, delivery_info, use_default_delivery, image_url, gallery_urls,
      category_id, collection_id, badge, is_featured, is_new, is_summer,
      inventory_count, published, sort_order, updated_at,
      listing_type, property_reference, property_area_id, property_type_id,
      property_status_id, furnishing_status_id, bedrooms, bathrooms, size_sqft,
      parking_spaces, year_built, assigned_agent_id, rent_payment_cheques,
      security_deposit, latitude, longitude, map_embed_url
    )
    select
      p_product->>'name', p_product->>'slug', p_product->>'overview', p_product->>'description',
      (p_product->>'price')::numeric, nullif(p_product->>'compare_at_price', '')::numeric,
      nullif(p_product->>'sku', ''), nullif(p_product->>'weight_kg', '')::numeric,
      coalesce(p_product->'specs', '[]'::jsonb),
      p_product->>'delivery_info', coalesce((p_product->>'use_default_delivery')::boolean, true),
      nullif(p_product->>'image_url', ''), coalesce(p_product->'gallery_urls', '[]'::jsonb),
      nullif(p_product->>'category_id', '')::uuid, nullif(p_product->>'collection_id', '')::uuid,
      nullif(p_product->>'badge', ''),
      coalesce((p_product->>'is_featured')::boolean, false),
      coalesce((p_product->>'is_new')::boolean, false),
      coalesce((p_product->>'is_summer')::boolean, false),
      coalesce((p_product->>'inventory_count')::int, 0),
      coalesce((p_product->>'published')::boolean, true),
      coalesce((p_product->>'sort_order')::int, 0),
      now(),
      nullif(p_product->>'listing_type', ''),
      nullif(p_product->>'property_reference', ''),
      nullif(p_product->>'property_area_id', '')::uuid,
      nullif(p_product->>'property_type_id', '')::uuid,
      nullif(p_product->>'property_status_id', '')::uuid,
      nullif(p_product->>'furnishing_status_id', '')::uuid,
      nullif(p_product->>'bedrooms', '')::int,
      nullif(p_product->>'bathrooms', '')::int,
      nullif(p_product->>'size_sqft', '')::numeric,
      nullif(p_product->>'parking_spaces', '')::int,
      nullif(p_product->>'year_built', '')::int,
      nullif(p_product->>'assigned_agent_id', '')::uuid,
      nullif(p_product->>'rent_payment_cheques', '')::int,
      nullif(p_product->>'security_deposit', '')::numeric,
      nullif(p_product->>'latitude', '')::numeric,
      nullif(p_product->>'longitude', '')::numeric,
      nullif(p_product->>'map_embed_url', '')
    returning id into v_id;
  else
    v_id := p_product_id;
    update public.products set
      name = p_product->>'name',
      slug = p_product->>'slug',
      overview = p_product->>'overview',
      description = p_product->>'description',
      price = (p_product->>'price')::numeric,
      compare_at_price = nullif(p_product->>'compare_at_price', '')::numeric,
      sku = nullif(p_product->>'sku', ''),
      weight_kg = nullif(p_product->>'weight_kg', '')::numeric,
      specs = coalesce(p_product->'specs', '[]'::jsonb),
      delivery_info = p_product->>'delivery_info',
      use_default_delivery = coalesce((p_product->>'use_default_delivery')::boolean, true),
      image_url = nullif(p_product->>'image_url', ''),
      gallery_urls = coalesce(p_product->'gallery_urls', '[]'::jsonb),
      category_id = nullif(p_product->>'category_id', '')::uuid,
      collection_id = nullif(p_product->>'collection_id', '')::uuid,
      badge = nullif(p_product->>'badge', ''),
      is_featured = coalesce((p_product->>'is_featured')::boolean, false),
      is_new = coalesce((p_product->>'is_new')::boolean, false),
      is_summer = coalesce((p_product->>'is_summer')::boolean, false),
      inventory_count = coalesce((p_product->>'inventory_count')::int, 0),
      published = coalesce((p_product->>'published')::boolean, true),
      sort_order = coalesce((p_product->>'sort_order')::int, 0),
      updated_at = now(),
      listing_type = nullif(p_product->>'listing_type', ''),
      property_reference = nullif(p_product->>'property_reference', ''),
      property_area_id = nullif(p_product->>'property_area_id', '')::uuid,
      property_type_id = nullif(p_product->>'property_type_id', '')::uuid,
      property_status_id = nullif(p_product->>'property_status_id', '')::uuid,
      furnishing_status_id = nullif(p_product->>'furnishing_status_id', '')::uuid,
      bedrooms = nullif(p_product->>'bedrooms', '')::int,
      bathrooms = nullif(p_product->>'bathrooms', '')::int,
      size_sqft = nullif(p_product->>'size_sqft', '')::numeric,
      parking_spaces = nullif(p_product->>'parking_spaces', '')::int,
      year_built = nullif(p_product->>'year_built', '')::int,
      assigned_agent_id = nullif(p_product->>'assigned_agent_id', '')::uuid,
      rent_payment_cheques = nullif(p_product->>'rent_payment_cheques', '')::int,
      security_deposit = nullif(p_product->>'security_deposit', '')::numeric,
      latitude = nullif(p_product->>'latitude', '')::numeric,
      longitude = nullif(p_product->>'longitude', '')::numeric,
      map_embed_url = nullif(p_product->>'map_embed_url', '')
    where id = v_id;
  end if;

  for v_variant in select * from jsonb_array_elements(p_variants)
  loop
    v_variant_id := nullif(v_variant->>'id', '')::uuid;
    if v_variant_id is not null then
      v_kept_ids := array_append(v_kept_ids, v_variant_id);
      update public.product_variants set
        name = v_variant->>'name',
        sku = nullif(v_variant->>'sku', ''),
        price = nullif(v_variant->>'price', '')::numeric,
        compare_at_price = nullif(v_variant->>'compare_at_price', '')::numeric,
        inventory_count = coalesce((v_variant->>'inventory_count')::int, 0),
        option_values = coalesce(v_variant->'option_values', '{}'::jsonb),
        image_url = nullif(v_variant->>'image_url', ''),
        sort_order = coalesce((v_variant->>'sort_order')::int, 0),
        is_active = coalesce((v_variant->>'is_active')::boolean, true),
        updated_at = now()
      where id = v_variant_id and product_id = v_id;
    else
      insert into public.product_variants (
        product_id, name, sku, price, compare_at_price, inventory_count,
        option_values, image_url, sort_order, is_active, updated_at
      ) values (
        v_id, v_variant->>'name', nullif(v_variant->>'sku', ''),
        nullif(v_variant->>'price', '')::numeric,
        nullif(v_variant->>'compare_at_price', '')::numeric,
        coalesce((v_variant->>'inventory_count')::int, 0),
        coalesce(v_variant->'option_values', '{}'::jsonb),
        nullif(v_variant->>'image_url', ''),
        coalesce((v_variant->>'sort_order')::int, 0),
        coalesce((v_variant->>'is_active')::boolean, true),
        now()
      );
    end if;
  end loop;

  delete from public.product_variants
  where product_id = v_id
    and (cardinality(v_kept_ids) = 0 or id <> all(v_kept_ids));

  delete from public.property_amenities where property_id = v_id;
  if cardinality(p_amenity_ids) > 0 then
    insert into public.property_amenities (property_id, amenity_id)
    select v_id, unnest(p_amenity_ids);
  end if;

  return jsonb_build_object('ok', true, 'id', v_id);
exception when others then
  return jsonb_build_object('ok', false, 'error', sqlerrm);
end;
$$;
grant execute on function public.rpc_save_admin_product(jsonb, jsonb, uuid[], uuid) to authenticated;

create or replace function public.rpc_admin_bulk_update_products(
  p_ids uuid[],
  p_patch jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.rpc_admin_require_edit();
  update public.products set
    published = coalesce((p_patch->>'published')::boolean, published),
    updated_at = now()
  where id = any(p_ids);
  return jsonb_build_object('ok', true, 'count', coalesce(array_length(p_ids, 1), 0));
end;
$$;
grant execute on function public.rpc_admin_bulk_update_products(uuid[], jsonb) to authenticated;

create or replace function public.rpc_admin_update_review_status(
  p_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.rpc_admin_require_edit();
  update public.product_reviews set status = p_status, updated_at = now() where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.rpc_admin_update_review_status(uuid, text) to authenticated;

create or replace function public.rpc_admin_mark_submission_viewed(p_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare v_viewed timestamptz := now();
begin
  if not public.is_admin_reader() then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;
  update public.form_submissions set admin_viewed_at = v_viewed where id = p_id;
  return jsonb_build_object('ok', true, 'admin_viewed_at', v_viewed);
end;
$$;
grant execute on function public.rpc_admin_mark_submission_viewed(uuid) to authenticated;

create or replace function public.rpc_admin_update_submission_status(p_id uuid, p_status text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform public.rpc_admin_require_edit();
  update public.form_submissions set status = p_status where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.rpc_admin_update_submission_status(uuid, text) to authenticated;
