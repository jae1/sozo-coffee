alter table public.members enable row level security;
alter table public.menu_items enable row level security;
alter table public.coffee_sessions enable row level security;
alter table public.orders enable row level security;

create policy "public reads active members" on public.members for select to anon using (is_active);
create policy "public reads active menu" on public.menu_items for select to anon using (is_active);
create policy "public reads sessions" on public.coffee_sessions for select to anon using (true);
create policy "public reads orders" on public.orders for select to anon using (true);

revoke insert, update, delete on public.members from anon;
revoke insert, update, delete on public.menu_items from anon;
revoke insert, update, delete on public.coffee_sessions from anon;
revoke insert, update, delete on public.orders from anon;
