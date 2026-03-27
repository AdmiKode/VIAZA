-- FORCE FIX: reconstruye public.trip_recommendations en formato canónico
-- Fecha: 2026-03-26

begin;

do $$
declare
  v_relkind "char";
  v_legacy_exists boolean := false;
begin
  select c.relkind
    into v_relkind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'trip_recommendations'
  limit 1;

  -- Si existe como view/materialized, se elimina
  if v_relkind = 'v' then
    execute 'drop view if exists public.trip_recommendations cascade';
    v_relkind := null;
  elsif v_relkind = 'm' then
    execute 'drop materialized view if exists public.trip_recommendations cascade';
    v_relkind := null;
  end if;

  -- Si existe como tabla, se renombra como respaldo (una sola vez)
  if v_relkind = 'r' then
    if to_regclass('public.trip_recommendations_legacy_20260326') is null then
      execute 'alter table public.trip_recommendations rename to trip_recommendations_legacy_20260326';
      v_legacy_exists := true;
    end if;
  end if;

  -- Crear tabla canónica
  execute $sql$
    create table if not exists public.trip_recommendations (
      id               uuid primary key default gen_random_uuid(),
      trip_id          uuid,
      user_id          uuid,
      place_id         text,
      category         text,
      relevance_score  numeric,
      distance_meters  integer,
      price_level      integer,
      summary          text,
      raw_json         jsonb,
      created_at       timestamptz not null default now(),
      updated_at       timestamptz not null default now()
    )
  $sql$;

  -- Si se creó respaldo legacy, lo conservamos para revisión manual.
  -- Evitamos migración automática aquí para no romper en esquemas legacy no compatibles.
  if v_legacy_exists then
    raise notice 'trip_recommendations legacy backup preserved at public.trip_recommendations_legacy_20260326';
  end if;

  -- Constraints/FKs
  execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_trip_id_fkey';
  execute 'alter table public.trip_recommendations add constraint trip_recommendations_trip_id_fkey foreign key (trip_id) references public.trips(id) on delete cascade';
  execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_user_id_fkey';
  execute 'alter table public.trip_recommendations add constraint trip_recommendations_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade';
  execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_trip_place_unique';
  execute 'alter table public.trip_recommendations add constraint trip_recommendations_trip_place_unique unique (trip_id, place_id)';

  -- Índices
  execute 'create index if not exists trip_recommendations_trip_id_idx on public.trip_recommendations(trip_id)';
  execute 'create index if not exists trip_recommendations_place_id_idx on public.trip_recommendations(place_id)';
  execute 'create index if not exists trip_recommendations_category_idx on public.trip_recommendations(category)';

  -- Trigger
  execute 'drop trigger if exists trip_recommendations_updated_at on public.trip_recommendations';
  execute 'create trigger trip_recommendations_updated_at before update on public.trip_recommendations for each row execute procedure public.set_updated_at()';

  -- RLS + policies
  execute 'alter table public.trip_recommendations enable row level security';
  execute 'drop policy if exists "trip_recommendations: usuario ve los suyos" on public.trip_recommendations';
  execute 'create policy "trip_recommendations: usuario ve los suyos" on public.trip_recommendations for select using (auth.uid() = user_id)';
  execute 'drop policy if exists "trip_recommendations: usuario crea recomendaciones" on public.trip_recommendations';
  execute 'create policy "trip_recommendations: usuario crea recomendaciones" on public.trip_recommendations for insert with check (auth.uid() = user_id)';
  execute 'drop policy if exists "trip_recommendations: usuario actualiza recomendaciones" on public.trip_recommendations';
  execute 'create policy "trip_recommendations: usuario actualiza recomendaciones" on public.trip_recommendations for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  execute 'drop policy if exists "trip_recommendations: usuario elimina recomendaciones" on public.trip_recommendations';
  execute 'create policy "trip_recommendations: usuario elimina recomendaciones" on public.trip_recommendations for delete using (auth.uid() = user_id)';
end $$;

commit;
