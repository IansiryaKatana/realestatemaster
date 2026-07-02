-- Cheque count for rental payment transparency on property detail pages

alter table public.products
  add column if not exists rent_payment_cheques int
  check (rent_payment_cheques is null or (rent_payment_cheques >= 1 and rent_payment_cheques <= 12));

comment on column public.products.rent_payment_cheques is
  'Number of post-dated cheques for annual rent (1=single, 12=monthly, etc.)';

update public.products set rent_payment_cheques = 12
where listing_type = 'rent' and rent_payment_cheques is null;

-- Varied plans for seeded rentals
update public.products set rent_payment_cheques = 4 where slug in (
  'marina-view-2br-apartment',
  'downtown-boulevard-2br',
  'business-bay-canal-view-2br',
  'marina-crown-3br-penthouse'
);

update public.products set rent_payment_cheques = 6 where slug in (
  'jvc-family-villa',
  'jvc-townhouse-3br',
  'palm-shoreline-4br-villa'
);

update public.products set rent_payment_cheques = 1 where slug = 'business-bay-executive-studio';
