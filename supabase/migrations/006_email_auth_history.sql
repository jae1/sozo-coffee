alter table public.member_accounts
  alter column username drop not null,
  alter column pin_hash drop not null,
  alter column recovery_code_hash drop not null,
  add column auth_user_id uuid unique references auth.users(id) on delete cascade,
  add column email text;

create unique index member_accounts_email_unique
  on public.member_accounts (lower(email))
  where email is not null;

alter table public.orders
  add column auth_user_id uuid references auth.users(id) on delete set null;

create index orders_auth_user_ordered_at_idx
  on public.orders (auth_user_id, ordered_at desc)
  where auth_user_id is not null;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  new_member_id uuid;
  requested_name text;
begin
  requested_name := trim(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  insert into public.members (display_name, sort_order)
  values (left(requested_name, 40), 999)
  returning id into new_member_id;

  insert into public.member_accounts (member_id, auth_user_id, email, role)
  values (new_member_id, new.id, lower(new.email), 'customer');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();
