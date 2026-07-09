-- The "master_id = auth.uid()" RLS policy only constrains which
-- master_id a row can be written with — it says nothing about which
-- client_id that row is allowed to point at. Without this trigger, a
-- master could successfully insert an order or calculation whose
-- client_id belongs to a *different* master: the foreign key only
-- requires the client to exist, not that it's theirs. Caught by
-- supabase/tests/database/03_orders_rls.sql and 05_calculations_rls.sql.
--
-- This runs as the calling role (not security definer), so the SELECT
-- below is itself subject to clients' own RLS: a foreign client_id is
-- invisible to this master and reads back as NULL, indistinguishable
-- from a client_id that doesn't exist at all. That's intentional — one
-- generic error for both cases avoids leaking whether some other
-- master's client id exists.

create or replace function assert_client_belongs_to_master() returns trigger
language plpgsql as $$
declare
  client_owner uuid;
begin
  if new.client_id is null then
    return new;
  end if;

  select master_id into client_owner from clients where id = new.client_id;

  if client_owner is null or client_owner <> new.master_id then
    raise exception 'client_id must belong to the same master as this row';
  end if;

  return new;
end;
$$;

create trigger orders_client_tenant_check
  before insert or update on orders
  for each row execute function assert_client_belongs_to_master();

create trigger calculations_client_tenant_check
  before insert or update on calculations
  for each row execute function assert_client_belongs_to_master();
