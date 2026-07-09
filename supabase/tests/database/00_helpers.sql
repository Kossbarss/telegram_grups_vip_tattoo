-- Shared test helpers for the pgTAP suite in this directory. Safe to run
-- against a real Supabase project too (creates its own `tests` schema,
-- doesn't touch anything Supabase-managed).

create schema if not exists tests;

-- Every test switches into the authenticated/anon role to make RLS
-- actually apply (see tests.authenticate_as below), so those roles need
-- USAGE on this schema to keep calling tests.* helpers afterwards —
-- otherwise the second call in a test file fails with "permission
-- denied for schema tests" once we're no longer the superuser.
grant usage on schema tests to authenticated, anon, service_role;

-- Simulates "logged in as this user, via the authenticated API role" —
-- the same two things that make our RLS policies apply for a real
-- PostgREST request: auth.uid() resolving to a specific user, and the
-- querying role not being a superuser/table owner (which always bypass RLS).
create or replace function tests.authenticate_as(p_user_id uuid) returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

create or replace function tests.authenticate_as_anon() returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('role', 'anon', true);
end;
$$;

create or replace function tests.clear_authentication() returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('role', 'postgres', true);
end;
$$;

-- Inserts an auth.users row with the given role/display_name in its
-- metadata, then returns the new id. On a project with our
-- 0004_trigger_seed.sql migration applied (real Supabase or our own
-- harness + migrations), this fires on_auth_user_created and creates the
-- matching profiles/master_settings/calculator_options rows for free —
-- so these tests double as a check that the trigger itself works.
create or replace function tests.create_master(p_email text, p_display_name text default 'Test Master')
returns uuid language plpgsql as $$
declare
  new_id uuid;
begin
  insert into auth.users (email, raw_user_meta_data)
  values (p_email, jsonb_build_object('role', 'master', 'display_name', p_display_name))
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function tests.create_admin(p_email text, p_display_name text default 'Test Admin')
returns uuid language plpgsql as $$
declare
  new_id uuid;
begin
  insert into auth.users (email, raw_user_meta_data)
  values (p_email, jsonb_build_object('role', 'admin', 'display_name', p_display_name))
  returning id into new_id;
  return new_id;
end;
$$;
