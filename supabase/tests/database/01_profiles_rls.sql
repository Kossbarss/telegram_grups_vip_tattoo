begin;
select plan(7);

select tests.create_master('master1@rls-test.local', 'Master One') as master1_id \gset
select tests.create_master('master2@rls-test.local', 'Master Two') as master2_id \gset
select tests.create_admin('admin@rls-test.local', 'The Admin') as admin_id \gset

-- Master 1 can see their own profile.
select tests.authenticate_as(:'master1_id'::uuid);
select is(
  (select display_name from profiles where id = :'master1_id'::uuid),
  'Master One',
  'master can select their own profile'
);

-- Master 1 cannot see Master 2's profile row at all (RLS filters it out,
-- it doesn't error) — not "admin reads all profiles" territory.
select is(
  (select count(*) from profiles where id = :'master2_id'::uuid)::int,
  0,
  'master cannot select another master''s profile'
);

-- Master 1 can update their own display_name.
update profiles set display_name = 'Master One Updated' where id = :'master1_id'::uuid;
select is(
  (select display_name from profiles where id = :'master1_id'::uuid),
  'Master One Updated',
  'master can update their own profile'
);

-- Master 1's attempt to update Master 2's profile silently affects 0 rows.
update profiles set display_name = 'Hacked' where id = :'master2_id'::uuid;
select tests.authenticate_as(:'admin_id'::uuid);
select is(
  (select display_name from profiles where id = :'master2_id'::uuid),
  'Master Two',
  'master cannot update another master''s profile'
);

-- Admin can see every profile, not just their own.
select is(
  (select count(*) from profiles)::int,
  3,
  'admin can select all profiles'
);

select ok(
  (select count(*) from profiles where id = :'master1_id'::uuid) = 1,
  'admin sees master 1 specifically'
);

-- An unauthenticated (anon) request sees nothing.
select tests.authenticate_as_anon();
select is(
  (select count(*) from profiles)::int,
  0,
  'anonymous request sees no profiles'
);

select * from finish();
rollback;
