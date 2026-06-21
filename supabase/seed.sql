insert into public.menu_items (id, display_name, uses_dairy_milk, sort_order) values
  ('americano', 'Americano', false, 1),
  ('latte', 'Latte', true, 2),
  ('mocha', 'Mocha', true, 3)
on conflict (id) do update set display_name = excluded.display_name;

insert into public.members (display_name, sort_order) values
  ('Member 1', 1), ('Member 2', 2), ('Member 3', 3),
  ('Member 4', 4), ('Member 5', 5), ('Member 6', 6),
  ('Member 7', 7), ('Member 8', 8), ('Member 9', 9);
