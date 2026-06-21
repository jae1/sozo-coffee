insert into public.menu_items (id, display_name, uses_dairy_milk, sort_order) values
  ('americano', 'Americano', false, 1),
  ('latte', 'Latte', true, 2),
  ('mocha', 'Mocha', true, 3)
on conflict (id) do update set display_name = excluded.display_name;

insert into public.members (display_name, sort_order) values
  ('치현', 1), ('재원', 2), ('민희', 3),
  ('정', 4), ('예슬', 5), ('민수', 6),
  ('세희', 7), ('빛나', 8), ('인진', 9);
