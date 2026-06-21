create extension if not exists pgcrypto;

create type public.session_status as enum ('open', 'closed');
create type public.order_status as enum ('ordered', 'in_progress', 'ready');
create type public.drink_temperature as enum ('hot', 'iced');
create type public.milk_type as enum ('dairy');

create table public.members (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 40),
  disambiguator text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id text primary key,
  display_name text not null,
  is_active boolean not null default true,
  uses_dairy_milk boolean not null,
  sort_order integer not null default 0
);

create table public.coffee_sessions (
  id uuid primary key default gen_random_uuid(),
  status public.session_status not null default 'open',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((status = 'open' and closed_at is null) or (status = 'closed' and closed_at is not null))
);

create unique index one_open_coffee_session
  on public.coffee_sessions ((status))
  where status = 'open';

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  session_id uuid not null references public.coffee_sessions(id),
  member_id uuid references public.members(id),
  customer_name text not null check (char_length(trim(customer_name)) between 1 and 40),
  is_guest boolean not null,
  menu_item_id text not null references public.menu_items(id),
  temperature public.drink_temperature not null,
  milk public.milk_type,
  note text check (note is null or char_length(note) <= 120),
  status public.order_status not null default 'ordered',
  ordered_at timestamptz not null default now(),
  started_at timestamptz,
  ready_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((is_guest and member_id is null) or (not is_guest and member_id is not null))
);

alter table public.orders replica identity full;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.coffee_sessions;
