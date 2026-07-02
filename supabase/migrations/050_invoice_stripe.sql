-- Stripe checkout fields for property invoices

alter table public.invoices
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text;

create index if not exists invoices_stripe_session_id_idx
  on public.invoices (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists invoices_stripe_payment_intent_id_idx
  on public.invoices (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
