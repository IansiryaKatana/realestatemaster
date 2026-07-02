-- Seed professional headshot URLs for storefront agents
update public.agents
set photo_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&q=80'
where id = 'a1111111-1111-1111-1111-111111111101';

update public.agents
set photo_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&q=80'
where id = 'a1111111-1111-1111-1111-111111111102';
