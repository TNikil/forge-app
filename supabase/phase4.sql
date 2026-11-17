create table set_entries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references routine_items(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  logged_on date not null default current_date,
  set_no int not null, reps int not null, weight_kg numeric not null default 0,
  unique (item_id, client_id, logged_on, set_no));
alter table set_entries enable row level security;
create policy "client logs own entries" on set_entries for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "trainer reads entries" on set_entries for select using (my_role() = 'admin' or exists (select 1 from profiles p where p.id = client_id and p.trainer_id = auth.uid()));
