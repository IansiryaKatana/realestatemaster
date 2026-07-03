-- RPC write layer: admin mutations (matches live — no rpc_save_admin_product).

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
