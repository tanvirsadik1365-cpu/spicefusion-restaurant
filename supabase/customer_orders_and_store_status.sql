-- Run this in Supabase before relying on website ordering, account history,
-- order tracking, and live store status.
--
-- This migration is intentionally idempotent. It keeps guest orders valid by
-- allowing customer_auth_user_id to be null, and links signed-in orders to the
-- Supabase auth user when the website sends a bearer token.
--
-- Multi-tenant note: this shared Supabase project uses orders.restaurant_id
-- and restaurant_operations.restaurant_id to isolate each restaurant. The
-- Spice Fusion deployment must set RESTAURANT_ID=spicefusion-restaurant.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers
  add column if not exists email text,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists customers_email_lower_idx
  on public.customers (lower(email));

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id text not null default 'spicefusion-restaurant',
  customer_id uuid references public.customers(id) on delete set null,
  customer_auth_user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique,
  order_status text not null default 'new',
  order_type text not null default 'collection',
  payment_method text not null default 'cash',
  payment_status text not null default 'pending',
  delivery_address text,
  delivery_postcode text,
  discount_pence integer not null default 0,
  notes text,
  prep_time_minutes integer not null default 20,
  reward_title text,
  reward_type text,
  selected_side_dish text,
  subtotal_pence integer not null default 0,
  total_pence integer not null default 0,
  stripe_session_id text,
  stripe_payment_intent_id text,
  accepted_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  auto_accept_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists restaurant_id text not null default 'spicefusion-restaurant',
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists customer_auth_user_id uuid
    references auth.users(id) on delete set null,
  add column if not exists order_number text,
  add column if not exists order_status text not null default 'new',
  add column if not exists order_type text not null default 'collection',
  add column if not exists payment_method text not null default 'cash',
  add column if not exists payment_status text not null default 'pending',
  add column if not exists delivery_address text,
  add column if not exists delivery_postcode text,
  add column if not exists discount_pence integer not null default 0,
  add column if not exists notes text,
  add column if not exists prep_time_minutes integer not null default 20,
  add column if not exists reward_title text,
  add column if not exists reward_type text,
  add column if not exists selected_side_dish text,
  add column if not exists subtotal_pence integer not null default 0,
  add column if not exists total_pence integer not null default 0,
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists accepted_at timestamptz,
  add column if not exists ready_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists auto_accept_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.orders
  alter column auto_accept_at drop not null,
  alter column auto_accept_at drop default;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_order_status_check'
  ) then
    alter table public.orders drop constraint orders_order_status_check;
  end if;

  alter table public.orders
    add constraint orders_order_status_check
    check (
      order_status in (
        'new',
        'pending',
        'accepted',
        'preparing',
        'ready',
        'completed',
        'cancelled'
      )
    );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_payment_status_check'
  ) then
    alter table public.orders drop constraint orders_payment_status_check;
  end if;

  alter table public.orders
    add constraint orders_payment_status_check
    check (
      payment_status in (
        'pending',
        'awaiting_payment',
        'paid',
        'failed',
        'refunded'
      )
    );
exception
  when duplicate_object then null;
end $$;

create unique index if not exists orders_order_number_key
  on public.orders (order_number);

create index if not exists orders_customer_auth_user_created_at_idx
  on public.orders (customer_auth_user_id, created_at desc);

create index if not exists orders_customer_id_created_at_idx
  on public.orders (customer_id, created_at desc);

create index if not exists orders_order_number_idx
  on public.orders (order_number);

create index if not exists orders_restaurant_created_at_idx
  on public.orders (restaurant_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text not null,
  name text not null,
  category text not null,
  quantity integer not null,
  unit_price_pence integer not null default 0,
  line_total_pence integer not null default 0,
  is_reward boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.order_items
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists menu_item_id text,
  add column if not exists name text,
  add column if not exists category text,
  add column if not exists quantity integer not null default 1,
  add column if not exists unit_price_pence integer not null default 0,
  add column if not exists line_total_pence integer not null default 0,
  add column if not exists is_reward boolean not null default false,
  add column if not exists created_at timestamptz not null default now();

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.order_status_events
  add column if not exists order_id uuid references public.orders(id) on delete cascade,
  add column if not exists from_status text,
  add column if not exists to_status text,
  add column if not exists note text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists order_status_events_order_id_created_at_idx
  on public.order_status_events (order_id, created_at desc);

-- Link older website orders to customer accounts when the account email matches
-- the stored customer email. New orders are linked by the website API.
update public.orders
set customer_auth_user_id = auth.users.id
from public.customers, auth.users
where public.orders.customer_id = public.customers.id
  and lower(public.customers.email) = lower(auth.users.email)
  and public.orders.customer_auth_user_id is null;

create table if not exists public.restaurant_operations (
  restaurant_id text primary key,
  store_status text not null default 'open',
  prep_time_minutes integer not null default 20,
  support_phone text not null default '+44 1943 830864',
  updated_at timestamptz not null default now(),
  constraint restaurant_operations_store_status_check
    check (store_status in ('open', 'busy', 'paused', 'closed')),
  constraint restaurant_operations_prep_time_check
    check (prep_time_minutes between 5 and 120)
);

insert into public.restaurant_operations (
  restaurant_id,
  store_status,
  prep_time_minutes,
  support_phone
)
values (
  'spicefusion-restaurant',
  'open',
  20,
  '+44 1943 830864'
)
on conflict (restaurant_id) do nothing;

-- Keep existing merchant settings, but replace the original placeholder phone
-- if this migration is being re-run on an older database.
update public.restaurant_operations
set support_phone = '+44 1943 830864',
    updated_at = now()
where restaurant_id = 'spicefusion-restaurant'
  and support_phone in ('+44 20 7946 0100', '020 7946 0100', '');

-- If an older app changed order_status without creating audit rows, add one
-- current-state event so tracking/admin history is no longer blank.
insert into public.order_status_events (
  order_id,
  from_status,
  to_status,
  note,
  created_at
)
select
  public.orders.id,
  null,
  public.orders.order_status,
  'Backfilled from current order status.',
  coalesce(public.orders.updated_at, public.orders.created_at, now())
from public.orders
where public.orders.order_status not in ('', 'new', 'pending')
  and not exists (
    select 1
    from public.order_status_events
    where public.order_status_events.order_id = public.orders.id
      and public.order_status_events.to_status = public.orders.order_status
  );

-- Orders are accepted manually from the merchant app. Remove the old
-- website timer function if it exists from a previous setup.
drop function if exists public.auto_accept_due_orders(text);

notify pgrst, 'reload schema';
