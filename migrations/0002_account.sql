-- Per-user house account: first-purchase flag, saved shipping, tokenized cards,
-- orders for tracking, and return requests. Never store a full card number or CVC.

create table if not exists account_profiles (
  user_id text primary key,
  first_purchase_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists saved_addresses (
  id text primary key,
  user_id text not null,
  label text not null default 'Home',
  first_name text not null,
  last_name text not null,
  address1 text not null,
  address2 text not null default '',
  city text not null,
  state text not null,
  zip text not null,
  country text not null default 'United States',
  phone text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists saved_addresses_user_id_idx on saved_addresses (user_id);

create table if not exists saved_cards (
  id text primary key,
  user_id text not null,
  brand text not null,
  last4 text not null,
  exp_month text not null,
  exp_year text not null,
  name_on_card text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists saved_cards_user_id_idx on saved_cards (user_id);

create table if not exists account_orders (
  id text primary key,
  user_id text not null,
  number text not null,
  email text not null,
  payload text not null,
  tracking text not null,
  ship_status text not null,
  created_at timestamptz not null default now()
);
create index if not exists account_orders_user_id_idx on account_orders (user_id);

create table if not exists return_requests (
  id text primary key,
  user_id text not null,
  order_id text not null,
  sku text not null default '',
  reason text not null,
  status text not null default 'requested',
  created_at timestamptz not null default now()
);
create index if not exists return_requests_user_id_idx on return_requests (user_id);
