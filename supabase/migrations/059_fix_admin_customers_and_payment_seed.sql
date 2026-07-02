-- Fix rpc_list_admin_customers: CTE "agg" was not visible across separate PL/pgSQL statements.
-- Seed real-estate payment records with Stripe-style IDs (AED).

create or replace function public.rpc_list_admin_customers(
  p_limit int default 25,
  p_offset int default 0,
  p_search text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_items jsonb;
  v_total int;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Forbidden');
  end if;

  with customer_agg as (
    select
      lower(trim(email)) as email,
      max(user_id::text)::uuid as user_id,
      count(*)::int as order_count,
      coalesce(sum(total), 0)::numeric(10,2) as lifetime_value,
      max(created_at) as last_order_at
    from public.orders
    where email is not null and trim(email) <> ''
    group by lower(trim(email))
  ),
  filtered as (
    select *
    from customer_agg
    where p_search is null or email ilike '%' || trim(p_search) || '%'
  ),
  paged as (
    select email, user_id, order_count, lifetime_value, last_order_at
    from filtered
    order by last_order_at desc nulls last
    limit greatest(1, least(p_limit, 100))
    offset greatest(0, p_offset)
  )
  select
    (select count(*)::int from filtered),
    (select coalesce(jsonb_agg(row_to_json(paged.*)), '[]'::jsonb) from paged)
  into v_total, v_items;

  return jsonb_build_object('ok', true, 'items', coalesce(v_items, '[]'::jsonb), 'total', coalesce(v_total, 0));
end;
$$;

grant execute on function public.rpc_list_admin_customers(int, int, text) to authenticated;

-- ── Real-estate payment records (Stripe test-mode style) ─────────────────────
insert into public.orders (
  id, order_number, email, user_id, status, currency, subtotal, total,
  stripe_session_id, stripe_payment_intent_id,
  shipping_address, fulfillment_status, metadata, created_at
) values
(
  'e2000001-0000-0000-0000-000000000001', 'GW-PAY-001',
  'ian.demo@astor.example', 'd1111111-1111-1111-1111-111111111101',
  'paid', 'AED', 145000, 145000,
  'cs_test_a1marina145000sess', 'pi_test_a1marina145000intent',
  '{"line1":"Marina Gate Tower","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'delivered',
  '{"payment_type":"security_deposit","property_reference":"EA-R-1001","listing_type":"rent","stripe_mode":"test"}'::jsonb,
  now() - interval '18 days'
),
(
  'e2000001-0000-0000-0000-000000000002', 'GW-PAY-002',
  'ian.demo@astor.example', 'd1111111-1111-1111-1111-111111111101',
  'paid', 'AED', 36250, 36250,
  'cs_test_a1marina36250rent', 'pi_test_a1marina36250rent',
  '{"line1":"Marina Gate Tower","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'delivered',
  '{"payment_type":"rent_installment","property_reference":"EA-R-1001","listing_type":"rent","stripe_mode":"test"}'::jsonb,
  now() - interval '5 days'
),
(
  'e2000001-0000-0000-0000-000000000003', 'GW-PAY-003',
  'sarah.demo@astor.example', 'd1111111-1111-1111-1111-111111111102',
  'paid', 'AED', 72000, 72000,
  'cs_test_b2studio72000sess', 'pi_test_b2studio72000intent',
  '{"line1":"Bay Square","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'delivered',
  '{"payment_type":"security_deposit","property_reference":"EA-R-1003","listing_type":"rent","stripe_mode":"test"}'::jsonb,
  now() - interval '14 days'
),
(
  'e2000001-0000-0000-0000-000000000004', 'GW-PAY-004',
  'marcus.demo@astor.example', 'd1111111-1111-1111-1111-111111111103',
  'paid', 'AED', 220000, 220000,
  'cs_test_c3villa220000sess', 'pi_test_c3villa220000intent',
  '{"line1":"District 12, JVC","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'processing',
  '{"payment_type":"security_deposit","property_reference":"EA-R-1002","listing_type":"rent","stripe_mode":"test"}'::jsonb,
  now() - interval '10 days'
),
(
  'e2000001-0000-0000-0000-000000000005', 'GW-PAY-005',
  'emma.demo@astor.example', 'd1111111-1111-1111-1111-111111111104',
  'paid', 'AED', 7250, 7250,
  'cs_test_d4comm7250sess', 'pi_test_d4comm7250intent',
  '{"line1":"Downtown Dubai","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'delivered',
  '{"payment_type":"agency_commission","property_reference":"EA-S-2001","listing_type":"sale","stripe_mode":"test"}'::jsonb,
  now() - interval '8 days'
),
(
  'e2000001-0000-0000-0000-000000000006', 'GW-PAY-006',
  'alex.demo@astor.example', 'd1111111-1111-1111-1111-111111111105',
  'paid', 'AED', 50000, 50000,
  'cs_test_e5palm50000sess', 'pi_test_e5palm50000intent',
  '{"line1":"Frond M, Palm Jumeirah","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'delivered',
  '{"payment_type":"booking_deposit","property_reference":"EA-S-2002","listing_type":"sale","stripe_mode":"test"}'::jsonb,
  now() - interval '6 days'
),
(
  'e2000001-0000-0000-0000-000000000007', 'GW-PAY-007',
  'hello@iankatana.com', 'e839333b-5e72-419e-90e6-e39e9c6ca557',
  'paid', 'AED', 165000, 165000,
  'cs_test_f6downtown165k', 'pi_test_f6downtown165k',
  '{"line1":"Boulevard Point","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'delivered',
  '{"payment_type":"rent_installment","property_reference":"EA-R-1007","listing_type":"rent","stripe_mode":"test"}'::jsonb,
  now() - interval '3 days'
),
(
  'e2000001-0000-0000-0000-000000000008', 'GW-PAY-008',
  'emma.demo@astor.example', 'd1111111-1111-1111-1111-111111111104',
  'pending', 'AED', 155000, 155000,
  'cs_test_g7canal155kpend', null,
  '{"line1":"Business Bay","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'unfulfilled',
  '{"payment_type":"security_deposit","property_reference":"EA-R-1009","listing_type":"rent","stripe_mode":"test","stripe_status":"open"}'::jsonb,
  now() - interval '1 day'
),
(
  'e2000001-0000-0000-0000-000000000009', 'GW-PAY-009',
  'marcus.demo@astor.example', 'd1111111-1111-1111-1111-111111111103',
  'quote_requested', 'AED', 8500000, 8500000,
  null, null,
  '{"line1":"Boulevard Point, Downtown","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'unfulfilled',
  '{"payment_type":"sale_offer","property_reference":"EA-S-2001","listing_type":"sale","quote_only":true}'::jsonb,
  now() - interval '2 days'
),
(
  'e2000001-0000-0000-0000-000000000010', 'GW-PAY-010',
  'sarah.demo@astor.example', 'd1111111-1111-1111-1111-111111111102',
  'paid', 'AED', 2000, 2000,
  'cs_test_h8ejari2000sess', 'pi_test_h8ejari2000intent',
  '{"line1":"Marina Walk","city":"Dubai","state":"Dubai","postal_code":"00000","country":"AE"}'::jsonb,
  'delivered',
  '{"payment_type":"ejari_registration","property_reference":"EA-R-1001","listing_type":"rent","stripe_mode":"test"}'::jsonb,
  now() - interval '12 days'
)
on conflict (id) do nothing;

insert into public.order_items (
  order_id, product_id, product_name, product_slug, image_url, unit_price, quantity, line_total
) values
(
  'e2000001-0000-0000-0000-000000000001',
  'f1111111-1111-1111-1111-111111111101',
  'Security deposit — Marina View 2BR', 'marina-view-2br-apartment',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  145000, 1, 145000
),
(
  'e2000001-0000-0000-0000-000000000002',
  'f1111111-1111-1111-1111-111111111101',
  'Rent installment — Marina View 2BR', 'marina-view-2br-apartment',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  36250, 1, 36250
),
(
  'e2000001-0000-0000-0000-000000000003',
  'f1111111-1111-1111-1111-111111111104',
  'Security deposit — Business Bay Studio', 'business-bay-executive-studio',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  72000, 1, 72000
),
(
  'e2000001-0000-0000-0000-000000000004',
  'f1111111-1111-1111-1111-111111111103',
  'Security deposit — JVC Family Villa', 'jvc-family-villa',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  220000, 1, 220000
),
(
  'e2000001-0000-0000-0000-000000000005',
  'f1111111-1111-1111-1111-111111111102',
  'Agency commission — Downtown Penthouse', 'downtown-luxury-3br-penthouse',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
  7250, 1, 7250
),
(
  'e2000001-0000-0000-0000-000000000006',
  'f1111111-1111-1111-1111-111111111105',
  'Booking deposit — Palm Beach Villa', 'palm-jumeirah-beach-villa',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80',
  50000, 1, 50000
),
(
  'e2000001-0000-0000-0000-000000000007',
  'f1111111-1111-1111-1111-111111111107',
  'Rent installment — Downtown Boulevard 2BR', 'downtown-boulevard-2br',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  165000, 1, 165000
),
(
  'e2000001-0000-0000-0000-000000000008',
  'f1111111-1111-1111-1111-111111111109',
  'Security deposit — Business Bay Canal 2BR', 'business-bay-canal-view-2br',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  155000, 1, 155000
),
(
  'e2000001-0000-0000-0000-000000000009',
  'f1111111-1111-1111-1111-111111111102',
  'Sale offer — Downtown Luxury Penthouse', 'downtown-luxury-3br-penthouse',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
  8500000, 1, 8500000
),
(
  'e2000001-0000-0000-0000-000000000010',
  'f1111111-1111-1111-1111-111111111101',
  'Ejari registration fee', 'marina-view-2br-apartment',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  2000, 1, 2000
);
