-- FAQ categories and entries for SEO-friendly help centre

create table if not exists public.faq_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.faq_categories(id) on delete cascade,
  slug text unique not null,
  question text not null,
  answer_html text not null,
  meta_description text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_category_id_idx on public.faqs (category_id);
create index if not exists faqs_published_sort_idx on public.faqs (is_published, sort_order);
create index if not exists faq_categories_active_sort_idx on public.faq_categories (is_active, sort_order);

alter table public.faq_categories enable row level security;
alter table public.faqs enable row level security;

create policy "public_read_faq_categories" on public.faq_categories
  for select to anon, authenticated
  using (is_active = true);

create policy "public_read_published_faqs" on public.faqs
  for select to anon, authenticated
  using (is_published = true);

create policy "admin_all_faq_categories" on public.faq_categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_all_faqs" on public.faqs
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.faq_categories to anon, authenticated;
grant select on public.faqs to anon, authenticated;
