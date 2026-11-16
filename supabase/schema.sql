-- Run in Supabase SQL editor. Make yourself admin afterwards:
--   update profiles set role='admin' where email='you@example.com';
-- Make trainers: update profiles set role='trainer' where email='...';
create type user_role as enum ('admin','trainer','client');
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text, full_name text, role user_role not null default 'client',
  trainer_id uuid references profiles(id), created_at timestamptz default now());
create table body_stats (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  logged_on date not null default current_date, weight_kg numeric, waist_cm numeric,
  unique (client_id, logged_on));
create table attendance (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  day date not null default current_date, checked_in_at timestamptz default now(),
  unique (client_id, day));
create table gym_qr (day date primary key default current_date, token text not null default encode(gen_random_bytes(12),'hex'));

create function my_role() returns user_role language sql security definer stable set search_path=public
  as $$ select role from profiles where id = auth.uid() $$;
create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
  begin insert into profiles(id,email,full_name)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1))); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function claim_client(p_email text) returns void language plpgsql security definer set search_path=public as $$
  begin
    if my_role() not in ('trainer','admin') then raise exception 'Only trainers can add clients'; end if;
    update profiles set trainer_id = auth.uid() where lower(email)=lower(p_email) and role='client' and trainer_id is null;
    if not found then raise exception 'No unassigned client found with that email'; end if;
  end $$;
create function get_gym_token() returns text language plpgsql security definer set search_path=public as $$
  declare t text; begin
    if my_role() not in ('trainer','admin') then raise exception 'Not allowed'; end if;
    insert into gym_qr(day) values (current_date) on conflict do nothing;
    select token into t from gym_qr where day = current_date; return t; end $$;
create function check_in(p_token text) returns void language plpgsql security definer set search_path=public as $$
  begin
    if not exists (select 1 from gym_qr where day = current_date and token = p_token) then raise exception 'That QR code is not valid today'; end if;
    insert into attendance(client_id) values (auth.uid()) on conflict do nothing;
  end $$;

alter table profiles enable row level security;
alter table body_stats enable row level security;
alter table attendance enable row level security;
alter table gym_qr enable row level security;
create policy "read profiles" on profiles for select using (id = auth.uid() or trainer_id = auth.uid() or my_role() = 'admin');
create policy "admin manages profiles" on profiles for all using (my_role() = 'admin') with check (my_role() = 'admin');
create policy "own stats" on body_stats for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "trainer reads stats" on body_stats for select using (my_role() = 'admin' or exists (select 1 from profiles p where p.id = client_id and p.trainer_id = auth.uid()));
create policy "own attendance" on attendance for select using (client_id = auth.uid());
create policy "trainer reads attendance" on attendance for select using (my_role() = 'admin' or exists (select 1 from profiles p where p.id = client_id and p.trainer_id = auth.uid()));
