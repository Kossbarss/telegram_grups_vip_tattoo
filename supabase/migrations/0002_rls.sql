-- Row Level Security: strict per-master tenant isolation.
-- Admin gets read access to `profiles` only (for the provisioning
-- list) and never bypasses RLS on business data — admin actions on
-- auth.users go through a service-role client instead, outside RLS.

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

alter table profiles enable row level security;
create policy "own profile select" on profiles for select using (id = auth.uid());
create policy "admin reads all profiles" on profiles for select using (is_admin());
create policy "own profile update" on profiles for update using (id = auth.uid()) with check (id = auth.uid());

alter table master_settings enable row level security;
create policy "tenant isolation" on master_settings for all
  using (master_id = auth.uid()) with check (master_id = auth.uid());

alter table calculator_options enable row level security;
create policy "tenant isolation" on calculator_options for all
  using (master_id = auth.uid()) with check (master_id = auth.uid());

alter table clients enable row level security;
create policy "tenant isolation" on clients for all
  using (master_id = auth.uid()) with check (master_id = auth.uid());

alter table portfolio_items enable row level security;
create policy "tenant isolation" on portfolio_items for all
  using (master_id = auth.uid()) with check (master_id = auth.uid());

alter table calculations enable row level security;
create policy "tenant isolation" on calculations for all
  using (master_id = auth.uid()) with check (master_id = auth.uid());

alter table orders enable row level security;
create policy "tenant isolation" on orders for all
  using (master_id = auth.uid()) with check (master_id = auth.uid());
