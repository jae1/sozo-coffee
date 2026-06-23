alter table public.member_accounts
  add column role text not null default 'customer'
  check (role in ('customer', 'barista', 'admin'));

update public.member_accounts
set role = 'admin', updated_at = now()
where username = 'herojae1';
