-- Auto-advance transaction when client uploads signed contract
create or replace function public.trg_uploaded_contract_set_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.property_transactions
  set status = 'signed_contract_uploaded', updated_at = now()
  where id = new.transaction_id;
  return new;
end;
$$;

drop trigger if exists uploaded_contracts_set_status on public.uploaded_contracts;
create trigger uploaded_contracts_set_status
  after insert on public.uploaded_contracts
  for each row execute function public.trg_uploaded_contract_set_status();
