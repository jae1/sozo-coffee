create table public.member_accounts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.members(id) on delete cascade,
  username text not null check (
    username = lower(username)
    and username ~ '^[a-z0-9_]{3,20}$'
  ),
  pin_hash text not null,
  recovery_code_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index member_accounts_username_unique
  on public.member_accounts (lower(username));

alter table public.member_accounts enable row level security;
revoke all on public.member_accounts from anon, authenticated;
