begin;
select plan(8);

select tests.create_master('master1@rls-test.local', 'Master One') as master1_id \gset
select tests.create_master('master2@rls-test.local', 'Master Two') as master2_id \gset

-- master_settings: auto-created by the on_auth_user_created trigger, one
-- row per master. Confirms both the trigger and the RLS policy.
select tests.authenticate_as(:'master1_id'::uuid);
select is(
  (select count(*) from master_settings)::int,
  1,
  'master sees exactly one master_settings row: their own'
);

update master_settings set hourly_rate = 500 where master_id = :'master1_id'::uuid;
select is(
  (select hourly_rate from master_settings where master_id = :'master1_id'::uuid)::int,
  500,
  'master can update their own hourly_rate'
);

select tests.authenticate_as(:'master2_id'::uuid);
update master_settings set hourly_rate = 999 where master_id = :'master1_id'::uuid;
select tests.authenticate_as(:'master1_id'::uuid);
select is(
  (select hourly_rate from master_settings where master_id = :'master1_id'::uuid)::int,
  500,
  'master cannot update another master''s hourly_rate'
);

-- calculator_options: 8 defaults seeded per master by the same trigger.
select is(
  (select count(*) from calculator_options where master_id = :'master1_id'::uuid)::int,
  8,
  'trigger seeds the expected 8 default calculator_options for a new master'
);

select is(
  (select count(*) from calculator_options)::int,
  8,
  'master only sees their own 8 calculator_options, not master 2''s'
);

-- Master 1 cannot insert an option tagged as master 2's.
select throws_like(
  format(
    $$insert into calculator_options (master_id, category, label, multiplier) values (%L, 'size', 'Huge', 2.0)$$,
    :'master2_id'::uuid
  ),
  '%row-level security%',
  'master cannot insert a calculator_option tagged with another master''s id'
);

-- Master 2 cannot delete master 1's calculator_options.
select tests.authenticate_as(:'master2_id'::uuid);
delete from calculator_options;
select tests.authenticate_as(:'master1_id'::uuid);
select is(
  (select count(*) from calculator_options where master_id = :'master1_id'::uuid)::int,
  8,
  'master cannot delete another master''s calculator_options'
);

select tests.authenticate_as_anon();
select is(
  (select count(*) from master_settings)::int + (select count(*) from calculator_options)::int,
  0,
  'anonymous request sees no master_settings or calculator_options'
);

select * from finish();
rollback;
