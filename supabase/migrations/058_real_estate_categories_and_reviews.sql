-- Replace legacy ecommerce categories with real-estate categories and seed property reviews.
-- Required whenever demo/real-estate seed data is applied (see 056 header).

update public.products set category_id = null;
delete from public.categories;

-- ── Real-estate category tree ─────────────────────────────────────────────────
insert into public.categories (id, name, slug, sort_order, parent_id, is_active) values
  ('c0000001-0000-4000-8000-000000000001', 'Rentals', 'rentals', 0, null, true),
  ('c0000001-0000-4000-8000-000000000002', 'Properties for Sale', 'for-sale', 1, null, true),
  ('c0000001-0000-4000-8000-000000000003', 'Holiday Homes', 'holiday-homes', 2, null, true),
  ('c0000001-0000-4000-8000-000000000004', 'Commercial', 'commercial', 3, null, true),
  ('c0000002-0000-4000-8000-000000000001', 'Apartments for Rent', 'apartments-rent', 0, 'c0000001-0000-4000-8000-000000000001', true),
  ('c0000002-0000-4000-8000-000000000002', 'Villas for Rent', 'villas-rent', 1, 'c0000001-0000-4000-8000-000000000001', true),
  ('c0000002-0000-4000-8000-000000000003', 'Studios for Rent', 'studios-rent', 2, 'c0000001-0000-4000-8000-000000000001', true),
  ('c0000002-0000-4000-8000-000000000004', 'Townhouses for Rent', 'townhouses-rent', 3, 'c0000001-0000-4000-8000-000000000001', true),
  ('c0000002-0000-4000-8000-000000000005', 'Penthouses for Rent', 'penthouses-rent', 4, 'c0000001-0000-4000-8000-000000000001', true),
  ('c0000003-0000-4000-8000-000000000001', 'Apartments for Sale', 'apartments-sale', 0, 'c0000001-0000-4000-8000-000000000002', true),
  ('c0000003-0000-4000-8000-000000000002', 'Villas for Sale', 'villas-sale', 1, 'c0000001-0000-4000-8000-000000000002', true),
  ('c0000003-0000-4000-8000-000000000003', 'Penthouses for Sale', 'penthouses-sale', 2, 'c0000001-0000-4000-8000-000000000002', true),
  ('c0000003-0000-4000-8000-000000000004', 'Townhouses for Sale', 'townhouses-sale', 3, 'c0000001-0000-4000-8000-000000000002', true),
  ('c0000003-0000-4000-8000-000000000005', 'Land & Off-Plan', 'land-off-plan', 4, 'c0000001-0000-4000-8000-000000000002', true),
  ('c0000004-0000-4000-8000-000000000001', 'Short-Stay Rentals', 'short-stay-rentals', 0, 'c0000001-0000-4000-8000-000000000003', true),
  ('c0000004-0000-4000-8000-000000000002', 'Vacation Villas', 'vacation-villas', 1, 'c0000001-0000-4000-8000-000000000003', true),
  ('c0000005-0000-4000-8000-000000000001', 'Office Space', 'office-space', 0, 'c0000001-0000-4000-8000-000000000004', true),
  ('c0000005-0000-4000-8000-000000000002', 'Retail & Warehouse', 'retail-warehouse', 1, 'c0000001-0000-4000-8000-000000000004', true)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  parent_id = excluded.parent_id,
  is_active = excluded.is_active;

-- Assign every published property to a real-estate category
update public.products p
set category_id = c.id
from public.property_types pt,
     public.categories c
where p.property_type_id = pt.id
  and (
    (p.listing_type = 'rent' and pt.slug = 'apartment' and c.slug = 'apartments-rent')
    or (p.listing_type = 'rent' and pt.slug = 'studio' and c.slug = 'studios-rent')
    or (p.listing_type = 'rent' and pt.slug = 'villa' and c.slug = 'villas-rent')
    or (p.listing_type = 'rent' and pt.slug = 'townhouse' and c.slug = 'townhouses-rent')
    or (p.listing_type = 'rent' and pt.slug = 'penthouse' and c.slug = 'penthouses-rent')
    or (p.listing_type = 'rent' and pt.slug = 'office' and c.slug = 'office-space')
    or (p.listing_type = 'sale' and pt.slug = 'apartment' and c.slug = 'apartments-sale')
    or (p.listing_type = 'sale' and pt.slug = 'villa' and c.slug = 'villas-sale')
    or (p.listing_type = 'sale' and pt.slug = 'penthouse' and c.slug = 'penthouses-sale')
    or (p.listing_type = 'sale' and pt.slug = 'townhouse' and c.slug = 'townhouses-sale')
    or (p.listing_type = 'sale' and pt.slug = 'land' and c.slug = 'land-off-plan')
    or (p.listing_type = 'sale' and pt.slug in ('retail-space', 'warehouse') and c.slug = 'retail-warehouse')
  );

-- Featured holiday / vacation listings
update public.products p
set category_id = c.id
from public.categories c
where c.slug = 'vacation-villas'
  and p.slug in (
    'palm-jumeirah-beach-villa',
    'palm-shoreline-4br-villa',
    'jvc-family-villa'
  );

update public.products p
set category_id = c.id
from public.categories c
where c.slug = 'short-stay-rentals'
  and p.is_summer = true
  and p.listing_type = 'rent';

-- ── Real-estate tenant & buyer reviews (8+ approved, 2 pending) ───────────────
delete from public.product_reviews;

insert into public.product_reviews (product_id, user_id, order_id, rating, title, body, status, created_at) values
(
  (select id from public.products where slug = 'marina-view-2br-apartment'),
  'd1111111-1111-1111-1111-111111111101',
  null, 5, 'Marina views exactly as advertised',
  'Signed the lease after one viewing. The apartment matches the listing photos — open kitchen, full marina panorama, and building amenities are well maintained. Move-in handover was smooth and Ejari was handled quickly.',
  'approved', now() - interval '21 days'
),
(
  (select id from public.products where slug = 'downtown-luxury-3br-penthouse'),
  'd1111111-1111-1111-1111-111111111102',
  null, 5, 'Exceptional penthouse viewing experience',
  'Our agent walked us through every detail before we made an offer. Burj Khalifa views from the terrace are unreal. GW Vacation Homes kept us updated through contract review and transfer scheduling.',
  'approved', now() - interval '18 days'
),
(
  (select id from public.products where slug = 'jvc-family-villa'),
  'd1111111-1111-1111-1111-111111111103',
  null, 4, 'Great family rental in JVC',
  'Spacious villa with a private garden — perfect for our kids. Commute to school is easy. Only minor delay on DEWA connection, but the property management team resolved it within 48 hours.',
  'approved', now() - interval '14 days'
),
(
  (select id from public.products where slug = 'business-bay-executive-studio'),
  'd1111111-1111-1111-1111-111111111104',
  null, 5, 'Ideal studio for professionals',
  'Compact, fully furnished, and five minutes from the metro. Rent payment via cheque was straightforward and the tenant portal made maintenance requests simple.',
  'approved', now() - interval '11 days'
),
(
  (select id from public.products where slug = 'palm-jumeirah-beach-villa'),
  'd1111111-1111-1111-1111-111111111105',
  null, 5, 'Dream beachfront property',
  'We booked a holiday stay and extended twice. Private beach access, infinity pool, and concierge support made it feel like a resort. Listing description was accurate down to the bedroom layout.',
  'approved', now() - interval '9 days'
),
(
  (select id from public.products where slug = 'marina-heights-1br-apartment'),
  'e839333b-5e72-419e-90e6-e39e9c6ca557',
  null, 4, 'Solid 1BR rental process',
  'Viewing was arranged within two days of my inquiry. Contract terms were clear, security deposit rules were explained upfront, and keys were ready on the agreed handover date.',
  'approved', now() - interval '7 days'
),
(
  (select id from public.products where slug = 'downtown-boulevard-2br'),
  'd1111111-1111-1111-1111-111111111101',
  null, 5, 'Responsive agents, transparent fees',
  'No hidden agency charges — everything was disclosed before we paid the booking deposit. The 2BR layout works well for remote work with a dedicated study nook.',
  'approved', now() - interval '5 days'
),
(
  (select id from public.products where slug = 'jvc-townhouse-3br'),
  'd1111111-1111-1111-1111-111111111102',
  null, 4, 'Quiet community townhouse',
  'Corner unit with good natural light. Community pool and parking were as described. Would recommend for families wanting more space than an apartment without villa maintenance overhead.',
  'approved', now() - interval '4 days'
),
(
  (select id from public.products where slug = 'palm-shoreline-4br-villa'),
  'd1111111-1111-1111-1111-111111111103',
  null, 5, 'Premium vacation villa rental',
  'Used it for a two-week family holiday. Check-in checklist was thorough, linens and kitchenware were hotel quality, and the shoreline view made every morning worth it.',
  'approved', now() - interval '3 days'
),
(
  (select id from public.products where slug = 'business-bay-canal-view-2br'),
  'd1111111-1111-1111-1111-111111111104',
  null, 5, 'Canal views and smooth tenancy',
  'From viewing to lease activation took under a week. Canal-facing living room is stunning at sunset. Building security and gym access worked flawlessly during our stay.',
  'approved', now() - interval '2 days'
),
(
  (select id from public.products where slug = 'marina-walk-studio'),
  'd1111111-1111-1111-1111-111111111105',
  null, 4, 'Walkable Marina location',
  'Perfect for a short corporate assignment. Restaurants and marina walk are steps away. Waiting on final confirmation of parking allocation — hence 4 stars for now.',
  'pending', now() - interval '1 day'
),
(
  (select id from public.products where slug = 'downtown-creek-1br'),
  'd1111111-1111-1111-1111-111111111102',
  null, 5, 'Creek views worth the premium',
  'Stunning creek outlook and easy access to Downtown attractions. Still finalizing my review after the first month of tenancy.',
  'pending', now() - interval '12 hours'
);
