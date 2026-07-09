-- Real Supabase already ships storage.objects with RLS enabled by
-- default — this statement is normally a no-op there. It's added
-- explicitly (rather than relied on implicitly) because our pgTAP test
-- harness creates its own storage.objects table for standalone-Postgres
-- test runs, and without this the folder-isolation policies in
-- 0003_storage.sql are defined but silently never enforced.
alter table storage.objects enable row level security;
