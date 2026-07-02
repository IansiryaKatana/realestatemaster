-- Real estate seed data (live dummy records for development)

-- ── Lookups ───────────────────────────────────────────────────────────────────
insert into public.property_types (name, slug, sort_order) values
  ('Apartment', 'apartment', 0),
  ('Villa', 'villa', 1),
  ('Townhouse', 'townhouse', 2),
  ('Studio', 'studio', 3),
  ('Penthouse', 'penthouse', 4),
  ('Office', 'office', 5),
  ('Retail Space', 'retail-space', 6),
  ('Warehouse', 'warehouse', 7),
  ('Land', 'land', 8)
on conflict (slug) do nothing;

insert into public.furnishing_statuses (name, slug, sort_order) values
  ('Unfurnished', 'unfurnished', 0),
  ('Semi-Furnished', 'semi-furnished', 1),
  ('Fully Furnished', 'fully-furnished', 2)
on conflict (slug) do nothing;

insert into public.property_statuses (name, slug, sort_order) values
  ('Available', 'available', 0),
  ('Reserved', 'reserved', 1),
  ('Under Offer', 'under-offer', 2),
  ('Rented', 'rented', 3),
  ('Sold', 'sold', 4),
  ('Unpublished', 'unpublished', 5)
on conflict (slug) do nothing;

insert into public.amenities (name, slug, sort_order) values
  ('Swimming Pool', 'swimming-pool', 0),
  ('Gym', 'gym', 1),
  ('Parking', 'parking', 2),
  ('Balcony', 'balcony', 3),
  ('Sea View', 'sea-view', 4),
  ('Garden', 'garden', 5),
  ('Security', 'security', 6),
  ('Central AC', 'central-ac', 7),
  ('Built-in Wardrobes', 'built-in-wardrobes', 8),
  ('Maid Room', 'maid-room', 9)
on conflict (slug) do nothing;

insert into public.payment_charge_types (name, slug, applies_to, sort_order) values
  ('Rent', 'rent', 'rent', 0),
  ('Security Deposit', 'security-deposit', 'rent', 1),
  ('Agency Commission', 'agency-commission', 'both', 2),
  ('Admin Fee', 'admin-fee', 'both', 3),
  ('Ejari Registration', 'ejari-registration', 'rent', 4),
  ('Sale Price', 'sale-price', 'sale', 5),
  ('Booking Deposit', 'booking-deposit', 'sale', 6),
  ('Transfer Fee', 'transfer-fee', 'sale', 7),
  ('VAT', 'vat', 'both', 8),
  ('Other Charges', 'other-charges', 'both', 9)
on conflict (slug) do nothing;

insert into public.property_areas (name, slug, city, latitude, longitude, sort_order) values
  ('Dubai Marina', 'dubai-marina', 'Dubai', 25.0805, 55.1403, 0),
  ('Downtown Dubai', 'downtown-dubai', 'Dubai', 25.1972, 55.2744, 1),
  ('Jumeirah Village Circle', 'jvc', 'Dubai', 25.0563, 55.2088, 2),
  ('Business Bay', 'business-bay', 'Dubai', 25.1850, 55.2716, 3),
  ('Palm Jumeirah', 'palm-jumeirah', 'Dubai', 25.1124, 55.1390, 4)
on conflict (slug) do nothing;

-- ── Agency settings ───────────────────────────────────────────────────────────
insert into public.agency_settings (
  id,
  agency_name, trade_license_number, rera_number, company_email, company_phone,
  company_whatsapp, company_address, signatory_name, signatory_title,
  default_contract_terms, default_payment_terms, default_service_charges,
  default_security_deposit_rules, default_commission_rules
)
select
  'b1111111-1111-1111-1111-111111111101',
  'EmirAxis Real Estate',
  'TRD-2024-88421',
  'RERA-45821',
  'hello@emiraxis.example',
  '+971 4 123 4567',
  '+971 50 123 4567',
  'Business Bay, Dubai, UAE',
  'Ahmed Al Mansoori',
  'Managing Director',
  'Standard UAE tenancy terms apply. Subject to Ejari registration.',
  'Payment due within 5 business days of contract approval.',
  500,
  'Security deposit equal to one month rent unless otherwise stated.',
  'Agency commission as per RERA guidelines, disclosed before payment.'
where not exists (select 1 from public.agency_settings limit 1);

-- ── Sample agents ─────────────────────────────────────────────────────────────
insert into public.agents (id, name, email, phone, whatsapp, license_number, default_commission_type, default_commission_value, is_active) values
  ('a1111111-1111-1111-1111-111111111101', 'Sarah Mitchell', 'sarah.mitchell@emiraxis.example', '+971 50 111 2233', '+971 50 111 2233', 'BRN-48291', 'percent', 5, true),
  ('a1111111-1111-1111-1111-111111111102', 'Omar Hassan', 'omar.hassan@emiraxis.example', '+971 50 444 5566', '+971 50 444 5566', 'BRN-48292', 'percent', 4.5, true)
on conflict (email) do nothing;

-- ── Site branding (real estate) ───────────────────────────────────────────────
insert into public.site_settings (key, value) values
  ('site_name', 'EmirAxis'),
  ('logo_text', 'EMIRAXIS'),
  ('store_name', 'EmirAxis Real Estate'),
  ('currency_code', 'AED'),
  ('currency_locale', 'en-AE'),
  ('footer_tagline', 'Premium properties for rent and sale across Dubai.'),
  ('newsletter_heading', 'Get new listings in your inbox'),
  ('contact_whatsapp_message', 'Hello! I am interested in a property on EmirAxis.'),
  ('checkout_mode', 'quote'),
  ('quote_notification_email', 'inquiries@emiraxis.example')
on conflict (key) do update set value = excluded.value;

-- ── Clear electronics demo products and seed properties ───────────────────────
delete from public.property_amenities;
delete from public.product_reviews;
delete from public.product_variants;
delete from public.product_bundle_items;
delete from public.product_bundles;
delete from public.order_items;
delete from public.orders;
delete from public.products;

insert into public.products (
  id, name, slug, description, price, compare_at_price, image_url, gallery_urls,
  property_reference, listing_type, property_type_id, property_status_id, area_id,
  exact_address, latitude, longitude, bedrooms, bathrooms, size_sqft,
  furnishing_status_id, availability_date, security_deposit,
  agent_commission_type, agent_commission_value, other_charges, assigned_agent_id,
  badge, is_featured, is_new, published, sort_order, overview, specs
) values
(
  'f1111111-1111-1111-1111-111111111101',
  'Marina View 2BR Apartment',
  'marina-view-2br-apartment',
  'Stunning 2-bedroom apartment with full marina views, open-plan living, and premium finishes.',
  145000, null,
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"]'::jsonb,
  'EA-R-1001', 'rent',
  (select id from public.property_types where slug = 'apartment'),
  (select id from public.property_statuses where slug = 'available'),
  (select id from public.property_areas where slug = 'dubai-marina'),
  'Marina Gate Tower, Dubai Marina', 25.0805, 55.1403,
  2, 2, 1250,
  (select id from public.furnishing_statuses where slug = 'fully-furnished'),
  current_date + 14, 145000,
  'percent', 5, 2000,
  'a1111111-1111-1111-1111-111111111101',
  'Featured', true, true, true, 0,
  'Bright corner unit with floor-to-ceiling windows and dedicated parking.',
  '[{"key":"Floor","value":"28"},{"key":"Parking","value":"1 space"}]'::jsonb
),
(
  'f1111111-1111-1111-1111-111111111102',
  'Downtown Luxury 3BR Penthouse',
  'downtown-luxury-3br-penthouse',
  'Exclusive penthouse in the heart of Downtown with Burj Khalifa views.',
  8500000, 9200000,
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
  '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"]'::jsonb,
  'EA-S-2001', 'sale',
  (select id from public.property_types where slug = 'penthouse'),
  (select id from public.property_statuses where slug = 'available'),
  (select id from public.property_areas where slug = 'downtown-dubai'),
  'Boulevard Point, Downtown Dubai', 25.1972, 55.2744,
  3, 4, 3200,
  (select id from public.furnishing_statuses where slug = 'semi-furnished'),
  current_date + 30, null,
  'percent', 4.5, 15000,
  'a1111111-1111-1111-1111-111111111102',
  'Premium', true, true, true, 1,
  'Private terrace, smart home system, and concierge building.',
  '[{"key":"Floor","value":"45"},{"key":"View","value":"Burj Khalifa"}]'::jsonb
),
(
  'f1111111-1111-1111-1111-111111111103',
  'JVC Family Villa',
  'jvc-family-villa',
  'Spacious 4-bedroom villa with private garden, ideal for families.',
  220000, null,
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"]'::jsonb,
  'EA-R-1002', 'rent',
  (select id from public.property_types where slug = 'villa'),
  (select id from public.property_statuses where slug = 'available'),
  (select id from public.property_areas where slug = 'jvc'),
  'District 12, JVC', 25.0563, 55.2088,
  4, 5, 3800,
  (select id from public.furnishing_statuses where slug = 'unfurnished'),
  current_date + 21, 220000,
  'percent', 5, 3000,
  'a1111111-1111-1111-1111-111111111101',
  'New', false, true, true, 2,
  'Quiet community location with easy access to schools and retail.',
  '[{"key":"Plot","value":"Corner"},{"key":"Garden","value":"Private"}]'::jsonb
),
(
  'f1111111-1111-1111-1111-111111111104',
  'Business Bay Executive Studio',
  'business-bay-executive-studio',
  'Compact executive studio perfect for professionals, walking distance to metro.',
  72000, null,
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  '[]'::jsonb,
  'EA-R-1003', 'rent',
  (select id from public.property_types where slug = 'studio'),
  (select id from public.property_statuses where slug = 'available'),
  (select id from public.property_areas where slug = 'business-bay'),
  'Bay Square, Business Bay', 25.1850, 55.2716,
  0, 1, 520,
  (select id from public.furnishing_statuses where slug = 'fully-furnished'),
  current_date + 7, 72000,
  'percent', 5, 1000,
  'a1111111-1111-1111-1111-111111111102',
  null, false, false, true, 3,
  'All-inclusive building with gym and pool access.',
  '[{"key":"Floor","value":"12"}]'::jsonb
),
(
  'f1111111-1111-1111-1111-111111111105',
  'Palm Jumeirah Beach Villa',
  'palm-jumeirah-beach-villa',
  'Signature beachfront villa on Palm Jumeirah with private beach access.',
  25000000, null,
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80',
  '["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80"]'::jsonb,
  'EA-S-2002', 'sale',
  (select id from public.property_types where slug = 'villa'),
  (select id from public.property_statuses where slug = 'available'),
  (select id from public.property_areas where slug = 'palm-jumeirah'),
  'Frond M, Palm Jumeirah', 25.1124, 55.1390,
  6, 7, 8500,
  (select id from public.furnishing_statuses where slug = 'fully-furnished'),
  current_date + 60, null,
  'percent', 4, 50000,
  'a1111111-1111-1111-1111-111111111102',
  'Exclusive', true, false, true, 4,
  'Private beach, infinity pool, and panoramic Gulf views.',
  '[{"key":"Beach","value":"Private"},{"key":"Pool","value":"Infinity"}]'::jsonb
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  listing_type = excluded.listing_type,
  property_reference = excluded.property_reference,
  published = excluded.published;

-- Link amenities
insert into public.property_amenities (property_id, amenity_id)
select p.id, a.id from public.products p
cross join public.amenities a
where p.slug = 'marina-view-2br-apartment'
  and a.slug in ('swimming-pool', 'gym', 'parking', 'balcony', 'sea-view', 'central-ac')
on conflict do nothing;

insert into public.property_amenities (property_id, amenity_id)
select p.id, a.id from public.products p
cross join public.amenities a
where p.slug = 'downtown-luxury-3br-penthouse'
  and a.slug in ('swimming-pool', 'gym', 'parking', 'security', 'central-ac', 'built-in-wardrobes')
on conflict do nothing;

-- ── Homepage & nav (real estate copy) ─────────────────────────────────────────
update public.homepage_sections set
  title = 'Newly Listed Properties',
  subtitle = 'Discover premium apartments, villas, and penthouses across Dubai.',
  cta_label = 'View All',
  cta_url = '/collection/all'
where section_key = 'newly_dropped';

update public.homepage_sections set
  title = 'Featured Rentals',
  subtitle = 'Hand-picked rental properties with flexible move-in dates.',
  cta_label = 'View Rentals',
  cta_url = '/collection/rentals'
where section_key = 'summer_collections';

update public.homepage_sections set
  title = 'Find Your Next Home With EmirAxis.',
  cta_label = 'Browse Properties',
  cta_url = '/collection/all'
where section_key = 'final_cta';

update public.hero_slides set
  headline_lines = '["Find Your", "Dream", "Property"]'::jsonb,
  cta_label = 'View Properties',
  cta_url = '/collection/all',
  image_url = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'
where sort_order = 0;

update public.nav_links set label = 'Properties', href = '/collection/all'
where label = 'Home' and location = 'header';
