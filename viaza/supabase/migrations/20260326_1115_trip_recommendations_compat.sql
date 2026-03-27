-- Compat patch: trip_recommendations legacy schema alignment
-- Fecha: 2026-03-26

create table if not exists public.trip_recommendations (
  id              uuid        primary key default gen_random_uuid(),
  trip_id         uuid        not null references public.trips(id) on delete cascade,
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  place_id        text        not null,
  category        text,
  relevance_score numeric,
  distance_meters integer,
  price_level     integer,
  summary         text,
  raw_json        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (trip_id, place_id)
);

alter table public.trip_recommendations add column if not exists trip_id uuid;
alter table public.trip_recommendations add column if not exists user_id uuid;
alter table public.trip_recommendations add column if not exists place_id text;
alter table public.trip_recommendations add column if not exists category text;
alter table public.trip_recommendations add column if not exists relevance_score numeric;
alter table public.trip_recommendations add column if not exists distance_meters integer;
alter table public.trip_recommendations add column if not exists price_level integer;
alter table public.trip_recommendations add column if not exists summary text;
alter table public.trip_recommendations add column if not exists raw_json jsonb;
alter table public.trip_recommendations add column if not exists created_at timestamptz not null default now();
alter table public.trip_recommendations add column if not exists updated_at timestamptz not null default now();

alter table public.trip_recommendations
  drop constraint if exists trip_recommendations_trip_id_fkey;
alter table public.trip_recommendations
  add constraint trip_recommendations_trip_id_fkey
  foreign key (trip_id) references public.trips(id) on delete cascade;

alter table public.trip_recommendations
  drop constraint if exists trip_recommendations_user_id_fkey;
alter table public.trip_recommendations
  add constraint trip_recommendations_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

create index if not exists trip_recommendations_trip_id_idx on public.trip_recommendations(trip_id);
create index if not exists trip_recommendations_place_id_idx on public.trip_recommendations(place_id);
create index if not exists trip_recommendations_category_idx on public.trip_recommendations(category);

drop trigger if exists trip_recommendations_updated_at on public.trip_recommendations;
create trigger trip_recommendations_updated_at
  before update on public.trip_recommendations
  for each row execute procedure public.set_updated_at();

alter table public.trip_recommendations enable row level security;

drop policy if exists "trip_recommendations: usuario ve los suyos" on public.trip_recommendations;
create policy "trip_recommendations: usuario ve los suyos"
  on public.trip_recommendations for select
  using (auth.uid() = user_id);

drop policy if exists "trip_recommendations: usuario crea recomendaciones" on public.trip_recommendations;
create policy "trip_recommendations: usuario crea recomendaciones"
  on public.trip_recommendations for insert
  with check (auth.uid() = user_id);

drop policy if exists "trip_recommendations: usuario actualiza recomendaciones" on public.trip_recommendations;
create policy "trip_recommendations: usuario actualiza recomendaciones"
  on public.trip_recommendations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trip_recommendations: usuario elimina recomendaciones" on public.trip_recommendations;
create policy "trip_recommendations: usuario elimina recomendaciones"
  on public.trip_recommendations for delete
  using (auth.uid() = user_id);
