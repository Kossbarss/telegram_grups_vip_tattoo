begin;
select plan(8);

select tests.create_master('master1@rls-test.local', 'Master One') as master1_id \gset
select tests.create_master('master2@rls-test.local', 'Master Two') as master2_id \gset

-- Master 1 creates their own client.
select tests.authenticate_as(:'master1_id'::uuid);
insert into clients (master_id, full_name) values (:'master1_id'::uuid, 'Client A');
select is(
  (select full_name from clients where master_id = :'master1_id'::uuid),
  'Client A',
  'master can insert and read their own client'
);

-- Master 1 cannot spoof another master's tenant on insert — the WITH
-- CHECK clause must reject it, not silently attribute it to master 1.
select throws_like(
  format($$insert into clients (master_id, full_name) values (%L, 'Spoofed Client')$$, :'master2_id'::uuid),
  '%row-level security%',
  'master cannot insert a client tagged with another master''s id'
);

-- Master 2 creates their own client to test cross-tenant visibility against.
select tests.authenticate_as(:'master2_id'::uuid);
insert into clients (master_id, full_name) values (:'master2_id'::uuid, 'Client B');

select is(
  (select count(*) from clients)::int,
  1,
  'master 2 only sees their own client, not master 1''s'
);

-- Master 2 cannot update master 1's client (0 rows affected, no error).
update clients set full_name = 'Hacked' where full_name = 'Client A';
select tests.authenticate_as(:'master1_id'::uuid);
select is(
  (select full_name from clients where master_id = :'master1_id'::uuid),
  'Client A',
  'master cannot update another master''s client'
);

-- Master 2 cannot delete master 1's client either.
select tests.authenticate_as(:'master2_id'::uuid);
delete from clients where full_name = 'Client A';
select tests.authenticate_as(:'master1_id'::uuid);
select is(
  (select count(*) from clients where full_name = 'Client A')::int,
  1,
  'master cannot delete another master''s client'
);

-- Master 1 CAN update and delete their own client.
update clients set notes = 'seen once' where master_id = :'master1_id'::uuid;
select is(
  (select notes from clients where master_id = :'master1_id'::uuid),
  'seen once',
  'master can update their own client'
);

delete from clients where master_id = :'master1_id'::uuid;
select is(
  (select count(*) from clients where master_id = :'master1_id'::uuid)::int,
  0,
  'master can delete their own client'
);

-- Anonymous requests see no clients at all.
select tests.authenticate_as_anon();
select is(
  (select count(*) from clients)::int,
  0,
  'anonymous request sees no clients'
);

select * from finish();
rollback;
