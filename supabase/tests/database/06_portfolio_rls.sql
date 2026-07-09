begin;
select plan(9);

select tests.create_master('master1@rls-test.local', 'Master One') as master1_id \gset
select tests.create_master('master2@rls-test.local', 'Master Two') as master2_id \gset

-- portfolio_items table: same tenant-isolation shape as clients/orders.
select tests.authenticate_as(:'master1_id'::uuid);
insert into portfolio_items (master_id, storage_path, title, tags)
values (:'master1_id'::uuid, :'master1_id' || '/photo1.jpg', 'Sleeve', array['realism']);

select is(
  (select count(*) from portfolio_items)::int,
  1,
  'master sees their own portfolio_items row'
);

select throws_like(
  format(
    $$insert into portfolio_items (master_id, storage_path) values (%L, 'x/y.jpg')$$,
    :'master2_id'::uuid
  ),
  '%row-level security%',
  'master cannot insert a portfolio_items row tagged with another master''s id'
);

select tests.authenticate_as(:'master2_id'::uuid);
select is(
  (select count(*) from portfolio_items)::int,
  0,
  'master cannot see another master''s portfolio_items'
);

-- storage.objects: folder-path isolation for the "portfolio" bucket.
-- Real upload paths are always "{masterId}/{uuid}.{ext}".
select tests.authenticate_as(:'master1_id'::uuid);
insert into storage.objects (bucket_id, name, owner)
values ('portfolio', :'master1_id' || '/photo1.jpg', :'master1_id'::uuid);

select is(
  (select count(*) from storage.objects where bucket_id = 'portfolio')::int,
  1,
  'master can insert into their own storage folder'
);

select tests.authenticate_as(:'master2_id'::uuid);
select is(
  (select count(*) from storage.objects where bucket_id = 'portfolio')::int,
  0,
  'master cannot see another master''s storage objects'
);

-- Master 2 cannot upload into master 1's folder path.
select throws_like(
  format(
    $$insert into storage.objects (bucket_id, name, owner) values ('portfolio', %L, %L)$$,
    :'master1_id' || '/sneaky.jpg', :'master2_id'::uuid
  ),
  '%row-level security%',
  'master cannot insert an object into another master''s storage folder'
);

-- Master 2 cannot delete master 1's storage object.
delete from storage.objects where bucket_id = 'portfolio';
select tests.authenticate_as(:'master1_id'::uuid);
select is(
  (select count(*) from storage.objects where bucket_id = 'portfolio')::int,
  1,
  'master cannot delete another master''s storage object'
);

-- Master 1 can delete their own storage object.
delete from storage.objects where bucket_id = 'portfolio';
select is(
  (select count(*) from storage.objects where bucket_id = 'portfolio')::int,
  0,
  'master can delete their own storage object'
);

select tests.authenticate_as_anon();
select is(
  (select count(*) from portfolio_items)::int + (select count(*) from storage.objects)::int,
  0,
  'anonymous request sees no portfolio_items or storage objects'
);

select * from finish();
rollback;
