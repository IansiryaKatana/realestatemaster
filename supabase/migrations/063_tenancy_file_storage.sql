-- Tenant portal file uploads (rent proofs, documents)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-files',
  'tenant-files',
  true,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "tenant_upload_own_files" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'tenant-files'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "tenant_read_own_files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'tenant-files'
    and (
      (select auth.uid())::text = (storage.foldername(name))[1]
      or public.is_admin()
      or public.is_admin_reader()
      or public.is_agent()
    )
  );

create policy "admin_manage_tenant_files" on storage.objects
  for all to authenticated
  using (bucket_id = 'tenant-files' and public.is_admin())
  with check (bucket_id = 'tenant-files' and public.is_admin());
