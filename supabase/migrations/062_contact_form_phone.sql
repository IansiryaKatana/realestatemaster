-- Contact form: phone field in submission payload
drop function if exists public.rpc_submit_contact_form(text, text, text);

create or replace function public.rpc_submit_contact_form(
  p_name text,
  p_email text,
  p_message text,
  p_phone text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_phone text := nullif(trim(p_phone), '');
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_message), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Name and message are required');
  end if;
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'error', 'Invalid email address');
  end if;

  insert into public.form_submissions (form_type, payload, status)
  values (
    'contact',
    jsonb_build_object(
      'name', trim(p_name),
      'email', v_email,
      'phone', v_phone,
      'message', trim(p_message)
    ),
    'new'
  );

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.rpc_submit_contact_form(text, text, text, text) to anon, authenticated;
