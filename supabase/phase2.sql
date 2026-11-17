create table routines (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id),
  client_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'Current plan', created_at timestamptz default now());
create table routine_items (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  position int not null default 0, exercise_name text not null,
  sets int not null default 3, reps int not null default 10, notes text, media_url text);
create table set_logs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references routine_items(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  logged_on date not null default current_date, sets_done int not null default 0,
  unique (item_id, client_id, logged_on));
create table diet_plans (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id),
  client_id uuid not null unique references profiles(id) on delete cascade,
  title text not null default 'Diet plan', content text not null default '', updated_at timestamptz default now());

alter table routines enable row level security;
alter table routine_items enable row level security;
alter table set_logs enable row level security;
alter table diet_plans enable row level security;

create policy "trainer manages routines" on routines for all
  using (trainer_id = auth.uid() or my_role() = 'admin')
  with check (my_role() = 'admin' or (trainer_id = auth.uid() and exists (select 1 from profiles p where p.id = client_id and p.trainer_id = auth.uid())));
create policy "client reads routines" on routines for select using (client_id = auth.uid());
create policy "trainer manages items" on routine_items for all
  using (exists (select 1 from routines r where r.id = routine_id and (r.trainer_id = auth.uid() or my_role() = 'admin')))
  with check (exists (select 1 from routines r where r.id = routine_id and (r.trainer_id = auth.uid() or my_role() = 'admin')));
create policy "client reads items" on routine_items for select using (exists (select 1 from routines r where r.id = routine_id and r.client_id = auth.uid()));
create policy "client logs own sets" on set_logs for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "trainer reads sets" on set_logs for select using (my_role() = 'admin' or exists (select 1 from profiles p where p.id = client_id and p.trainer_id = auth.uid()));
create policy "trainer manages diet" on diet_plans for all
  using (trainer_id = auth.uid() or my_role() = 'admin')
  with check (my_role() = 'admin' or (trainer_id = auth.uid() and exists (select 1 from profiles p where p.id = client_id and p.trainer_id = auth.uid())));
create policy "client reads diet" on diet_plans for select using (client_id = auth.uid());

insert into storage.buckets (id, name, public) values ('exercise-media', 'exercise-media', true) on conflict do nothing;
create policy "trainers upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'exercise-media' and my_role() in ('trainer','admin'));
