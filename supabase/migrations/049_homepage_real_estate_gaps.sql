-- Homepage real-estate alignment: feature cards, final CTA image, hero slide 2, collections, footer links

update public.feature_cards set
  title = 'Vacation Homes Built For Comfort — Furnished, Serviced, And Ready For Your Stay.',
  cta_label = 'View Rentals',
  cta_url = '/collection/rentals',
  image_url = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  updated_at = now()
where id = '33333333-3333-3333-3333-333333333301';

update public.feature_cards set
  title = 'Investment Properties — Freehold Homes And Apartments With Strong Dubai Yields.',
  cta_label = 'Browse Sales',
  cta_url = '/collection/sales',
  image_url = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  updated_at = now()
where id = '33333333-3333-3333-3333-333333333302';

update public.feature_cards set
  title = 'VILLA COLLECTION',
  cta_label = 'Explore Villas',
  cta_url = '/collection/all',
  image_url = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  updated_at = now()
where id = '33333333-3333-3333-3333-333333333303';

update public.homepage_sections set
  image_url = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80',
  updated_at = now()
where section_key = 'final_cta';

update public.hero_slides set
  headline_lines = '["Luxury Living", "Across", "Dubai"]'::jsonb,
  cta_label = 'Browse Sales',
  cta_url = '/collection/sales',
  image_url = 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
  background_color = '#2d4a3a',
  updated_at = now()
where sort_order = 1;

update public.collections set
  title = 'New Listings',
  description = 'Recently added properties across Dubai.',
  cover_image_url = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
where slug = 'new';

update public.collections set
  title = 'Featured Homes',
  description = 'Hand-picked properties with standout value and prime locations.',
  cover_image_url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
where slug = 'deals';

update public.nav_links set
  label = 'Handover Information'
where location = 'footer_help' and href = '/pages/shipping' and label = 'Shipping';

update public.nav_links set
  label = 'Holiday Rentals',
  href = '/collection/rentals'
where location = 'footer_categories' and label = 'New Arrivals';

update public.nav_links set
  label = 'Properties for Sale',
  href = '/collection/sales'
where location = 'footer_categories' and label = 'Best Sellers';

update public.nav_links set
  label = 'New Listings',
  href = '/collection/new'
where location = 'footer_categories' and label = 'Hot Deals';
