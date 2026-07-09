-- Standalone-Postgres shim for running supabase/tests/database/*.sql
-- WITHOUT the full Supabase/Docker stack (auth server, storage server, etc).
--
-- Real Supabase already provides the auth.*/storage.* schemas, the
-- authenticated/anon/service_role roles, and default grants — this file
-- recreates just enough of that surface for our RLS policies and pgTAP
-- tests to run against a plain `apt install postgresql` instance. It is
-- intentionally NOT one of the supabase/migrations/*.sql files: it must
-- never be applied to a real Supabase project (auth/storage there are
-- managed by Supabase itself and already far more complete than this).
--
-- Usage: see scripts/run-pgtap-tests.sh

create extension if not exists pgtap;
create extension if not exists pgcrypto;

-- Minimal auth.users: just enough columns for our FKs and metadata-driven trigger.
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- auth.uid(): real Supabase reads this from the request's JWT claims via
-- the `request.jwt.claim.sub` GUC set by PostgREST per-request. We fake
-- that GUC ourselves via tests.authenticate_as() below.
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- Minimal storage.objects/buckets + storage.foldername(), matching the
-- real Supabase Storage schema closely enough for our bucket policies.
create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null,
  owner uuid,
  created_at timestamptz not null default now()
);

create or replace function storage.foldername(name text) returns text[]
language plpgsql immutable as $$
declare
  _parts text[];
begin
  select string_to_array(name, '/') into _parts;
  return _parts[1 : array_length(_parts, 1) - 1];
end;
$$;

-- Supabase's three standard API roles. RLS only means anything when the
-- querying role is neither a superuser nor the table owner, so tests
-- must SET ROLE authenticated before touching business tables.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end;
$$;

grant usage on schema public, auth, storage to authenticated, anon, service_role;
grant all on all tables in schema public to authenticated, anon, service_role;
grant all on all tables in schema storage to authenticated, anon, service_role;
grant select on auth.users to authenticated, anon, service_role;
alter default privileges in schema public grant all on tables to authenticated, anon, service_role;

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', false)
on conflict (id) do nothing;
