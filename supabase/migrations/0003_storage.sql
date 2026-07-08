-- Private storage bucket for portfolio photos. Upload path convention:
-- "{masterId}/{uuid}.{ext}" — the policy enforces that the first path
-- segment matches the uploading master's auth uid, so one master can
-- never read or overwrite another master's folder.

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', false)
on conflict (id) do nothing;

create policy "tenant folder isolation select" on storage.objects for select
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "tenant folder isolation insert" on storage.objects for insert
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "tenant folder isolation update" on storage.objects for update
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "tenant folder isolation delete" on storage.objects for delete
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
