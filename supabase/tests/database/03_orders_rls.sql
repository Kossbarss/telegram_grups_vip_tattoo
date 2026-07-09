begin;
select plan(6);

select tests.create_master('master1@rls-test.local', 'Master One') as master1_id \gset
select tests.create_master('master2@rls-test.local', 'Master Two') as master2_id \gset

select tests.authenticate_as(:'master1_id'::uuid);
insert into clients (master_id, full_name) values (:'master1_id'::uuid, 'M1 Client');
select id as m1_client_id from clients where master_id = :'master1_id'::uuid \gset

select tests.authenticate_as(:'master2_id'::uuid);
insert into clients (master_id, full_name) values (:'master2_id'::uuid, 'M2 Client');
select id as m2_client_id from clients where master_id = :'master2_id'::uuid \gset

-- Master 1 can create an order for their own client.
select tests.authenticate_as(:'master1_id'::uuid);
insert into orders (master_id, client_id, title) values (:'master1_id'::uuid, :'m1_client_id'::uuid, 'Sleeve');
select is(
  (select count(*) from orders where master_id = :'master1_id'::uuid)::int,
  1,
  'master can create an order for their own client'
);

-- Master 1 cannot point an order at master 2's client id, even though
-- master_id on the order is correctly their own — this is a
-- cross-tenant referential integrity check, not the tenant-isolation
-- policy itself, so it's expected to be enforced by a trigger/constraint
-- rather than the "master_id = auth.uid()" RLS policy.
select throws_ok(
  format(
    $$insert into orders (master_id, client_id, title) values (%L, %L, 'Cross-tenant order')$$,
    :'master1_id'::uuid, :'m2_client_id'::uuid
  ),
  'client_id must belong to the same master as this row'
);

-- Master 2 does not see master 1's order.
select tests.authenticate_as(:'master2_id'::uuid);
select is(
  (select count(*) from orders)::int,
  0,
  'master cannot see another master''s orders'
);

-- Master 2 cannot update master 1's order's status.
update orders set status = 'paid' where title = 'Sleeve';
select tests.authenticate_as(:'master1_id'::uuid);
select is(
  (select status from orders where title = 'Sleeve'),
  'scheduled',
  'master cannot update another master''s order'
);

-- Master 1 can advance their own order's status, guarded update style.
update orders set status = 'done' where title = 'Sleeve' and status = 'scheduled';
select is(
  (select status from orders where title = 'Sleeve'),
  'done',
  'master can update their own order''s status'
);

select tests.authenticate_as_anon();
select is(
  (select count(*) from orders)::int,
  0,
  'anonymous request sees no orders'
);

select * from finish();
rollback;
