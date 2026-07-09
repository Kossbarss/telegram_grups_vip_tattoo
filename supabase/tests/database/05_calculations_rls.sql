begin;
select plan(5);

select tests.create_master('master1@rls-test.local', 'Master One') as master1_id \gset
select tests.create_master('master2@rls-test.local', 'Master Two') as master2_id \gset

select tests.authenticate_as(:'master2_id'::uuid);
insert into clients (master_id, full_name) values (:'master2_id'::uuid, 'M2 Client');
select id as m2_client_id from clients where master_id = :'master2_id'::uuid \gset

-- Master 1 can save their own calculation (no client attached).
select tests.authenticate_as(:'master1_id'::uuid);
insert into calculations (master_id, hours, hourly_rate_snapshot, computed_price)
values (:'master1_id'::uuid, 2, 400, 800);
select is(
  (select count(*) from calculations)::int,
  1,
  'master can save their own calculation'
);

-- Master 1 cannot attribute a calculation to master 2.
select throws_like(
  format(
    $$insert into calculations (master_id, hours, hourly_rate_snapshot, computed_price) values (%L, 1, 100, 100)$$,
    :'master2_id'::uuid
  ),
  '%row-level security%',
  'master cannot insert a calculation tagged with another master''s id'
);

-- Master 1 cannot point their own calculation at master 2's client.
select throws_ok(
  format(
    $$insert into calculations (master_id, client_id, hours, hourly_rate_snapshot, computed_price) values (%L, %L, 1, 100, 100)$$,
    :'master1_id'::uuid, :'m2_client_id'::uuid
  ),
  'client_id must belong to the same master as this row'
);

-- Master 2 does not see master 1's calculation.
select tests.authenticate_as(:'master2_id'::uuid);
select is(
  (select count(*) from calculations)::int,
  0,
  'master cannot see another master''s calculations'
);

select tests.authenticate_as_anon();
select is(
  (select count(*) from calculations)::int,
  0,
  'anonymous request sees no calculations'
);

select * from finish();
rollback;
