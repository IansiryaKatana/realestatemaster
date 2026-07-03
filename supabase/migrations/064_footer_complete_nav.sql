-- Footer quick links, guide pages, and expanded nav locations

alter table public.nav_links drop constraint if exists nav_links_location_check;
alter table public.nav_links add constraint nav_links_location_check
  check (location in (
    'header',
    'footer_categories',
    'footer_legal',
    'footer_help',
    'footer_company',
    'footer_resources',
    'footer_account'
  ));

-- Guide & company marketing pages
insert into public.marketing_pages (title, slug, body_html, meta_description, published, sort_order)
values
  (
    'About Us',
    'about',
    '<h2>Who we are</h2><p>GW Vacation Homes is a Dubai-based real estate agency specialising in premium vacation rentals and properties for sale.</p>',
    'Learn about GW Vacation Homes — Dubai real estate for vacation rentals and property sales.',
    true,
    10
  ),
  (
    'FAQs',
    'faq',
    '<h2>Viewings &amp; applications</h2><p>Book a viewing from any property page. Track progress in My Account.</p>',
    'Frequently asked questions about renting and buying property with GW Vacation Homes.',
    true,
    11
  ),
  (
    'How It Works',
    'how-it-works',
    '<h2>Discover</h2><p>Browse listings, book viewings, apply, sign contracts, pay, and collect keys — all tracked in your account.</p>',
    'Step-by-step guide to finding, viewing, and securing a property with GW Vacation Homes.',
    true,
    12
  ),
  (
    'Renting Guide',
    'renting-guide',
    '<h2>Before you apply</h2><p>Prepare ID, visa, and income documents. Review rent, deposit, and Ejari fees in your transaction breakdown.</p>',
    'Guide to renting a property in Dubai with GW Vacation Homes.',
    true,
    13
  ),
  (
    'Buying Guide',
    'buying-guide',
    '<h2>Typical steps</h2><p>View, offer, booking deposit, SPA, DLD transfer, and handover.</p>',
    'Guide to purchasing property in Dubai with GW Vacation Homes.',
    true,
    14
  )
on conflict (slug) do update set
  title = excluded.title,
  meta_description = excluded.meta_description,
  published = excluded.published,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Browse: ensure core property links
insert into public.nav_links (id, label, href, location, sort_order, is_active) values
  ('66666666-6666-6666-6666-666666666601', 'All Listings', '/collection/all', 'footer_categories', 3, true),
  ('66666666-6666-6666-6666-666666666602', 'Search Properties', '/search', 'footer_categories', 4, true),
  ('66666666-6666-6666-6666-666666666603', 'Featured Homes', '/collection/deals', 'footer_categories', 5, true)
on conflict (id) do update set
  label = excluded.label,
  href = excluded.href,
  location = excluded.location,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- Company
insert into public.nav_links (id, label, href, location, sort_order, is_active) values
  ('66666666-6666-6666-6666-666666666611', 'About Us', '/pages/about', 'footer_company', 0, true),
  ('66666666-6666-6666-6666-666666666612', 'How It Works', '/pages/how-it-works', 'footer_company', 1, true),
  ('66666666-6666-6666-6666-666666666613', 'Contact', '/pages/contact', 'footer_company', 2, true)
on conflict (id) do update set
  label = excluded.label,
  href = excluded.href,
  location = excluded.location,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- Guides & FAQs
insert into public.nav_links (id, label, href, location, sort_order, is_active) values
  ('66666666-6666-6666-6666-666666666621', 'FAQs', '/pages/faq', 'footer_resources', 0, true),
  ('66666666-6666-6666-6666-666666666622', 'Renting Guide', '/pages/renting-guide', 'footer_resources', 1, true),
  ('66666666-6666-6666-6666-666666666623', 'Buying Guide', '/pages/buying-guide', 'footer_resources', 2, true),
  ('66666666-6666-6666-6666-666666666624', 'Handover Information', '/pages/shipping', 'footer_resources', 3, true)
on conflict (id) do update set
  label = excluded.label,
  href = excluded.href,
  location = excluded.location,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- My Account
insert into public.nav_links (id, label, href, location, sort_order, is_active) values
  ('66666666-6666-6666-6666-666666666631', 'My Account', '/account', 'footer_account', 0, true),
  ('66666666-6666-6666-6666-666666666632', 'Property Applications', '/account/transactions', 'footer_account', 1, true),
  ('66666666-6666-6666-6666-666666666633', 'Viewing Requests', '/account/viewings', 'footer_account', 2, true),
  ('66666666-6666-6666-6666-666666666634', 'My Profile', '/account/profile', 'footer_account', 3, true),
  ('66666666-6666-6666-6666-666666666635', 'Notifications', '/account/notifications', 'footer_account', 4, true)
on conflict (id) do update set
  label = excluded.label,
  href = excluded.href,
  location = excluded.location,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
