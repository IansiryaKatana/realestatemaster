-- Real-estate lifestyle cards and recommended collections section copy

insert into public.homepage_sections (section_key, title, subtitle, cta_label, cta_url, sort_order, is_active)
values (
  'recommended_collections',
  'Explore Dubai Living',
  'Curated areas and listing types to help you find your next home or investment.',
  '',
  '',
  2,
  true
)
on conflict (section_key) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

update public.lifestyle_cards set
  title = 'Dubai Marina Rentals',
  cta_label = 'View Rentals',
  cta_url = '/collection/rentals',
  image_url = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
  updated_at = now()
where id = '44444444-4444-4444-4444-444444444401';

update public.lifestyle_cards set
  title = 'Properties For Sale',
  cta_label = 'Browse Sales',
  cta_url = '/collection/sales',
  image_url = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  updated_at = now()
where id = '44444444-4444-4444-4444-444444444402';

update public.lifestyle_cards set
  title = 'Palm Jumeirah Living',
  cta_label = 'Explore',
  cta_url = '/collection/all',
  image_url = 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
  updated_at = now()
where id = '44444444-4444-4444-4444-444444444403';

update public.lifestyle_cards set
  title = 'Homes Across Dubai',
  cta_label = 'View All Properties',
  cta_url = '/collection/all',
  image_url = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
  updated_at = now()
where id = '44444444-4444-4444-4444-444444444404';
