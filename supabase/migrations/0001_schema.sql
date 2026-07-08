-- Core schema for the tattoo master CRM.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','master')) default 'master',
  display_name text,
  business_name text,
  created_at timestamptz not null default now()
);

create table master_settings (
  master_id uuid primary key references profiles(id) on delete cascade,
  hourly_rate numeric not null default 0,
  currency text not null default 'UAH',
  min_price numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table calculator_options (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references profiles(id) on delete cascade,
  category text not null check (category in ('size','style','color_complexity')),
  label text not null,
  multiplier numeric not null default 1,
  sort_order int not null default 0
);
create index calculator_options_master_idx on calculator_options (master_id, category, sort_order);

create table clients (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references profiles(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  instagram text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clients_master_idx on clients (master_id);

create table portfolio_items (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references profiles(id) on delete cascade,
  storage_path text not null,
  title text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index portfolio_items_master_idx on portfolio_items (master_id);
create index portfolio_items_tags_idx on portfolio_items using gin (tags);

-- Snapshot of a price calculation. Deliberately NOT re-derived from
-- master_settings/calculator_options at read time, so a saved quote
-- stays correct even after the master edits their rates later.
create table calculations (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references profiles(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  hours numeric not null,
  size_label text,
  size_multiplier numeric not null default 1,
  style_label text,
  style_multiplier numeric not null default 1,
  color_label text,
  color_multiplier numeric not null default 1,
  hourly_rate_snapshot numeric not null,
  computed_price numeric not null,
  notes text,
  created_at timestamptz not null default now()
);
create index calculations_master_idx on calculations (master_id);

create table orders (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references profiles(id) on delete cascade,
  client_id uuid not null references clients(id) on delete restrict,
  calculation_id uuid references calculations(id) on delete set null,
  title text not null,
  description text,
  status text not null check (status in ('scheduled','done','paid')) default 'scheduled',
  price numeric,
  scheduled_at timestamptz,
  completed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_master_idx on orders (master_id, status);
