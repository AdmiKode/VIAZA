-- Hotfix definitivo: normalización robusta de public.trip_recommendations
-- Fecha: 2026-03-26

do $$
begin
  declare
    v_relkind "char";
  begin
    select c.relkind
      into v_relkind
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'trip_recommendations'
    limit 1;

    if v_relkind = 'v' then
      execute 'drop view if exists public.trip_recommendations cascade';
      v_relkind := null;
    elsif v_relkind = 'm' then
      execute 'drop materialized view if exists public.trip_recommendations cascade';
      v_relkind := null;
    end if;

    if v_relkind is null then
      execute $sql$
        create table public.trip_recommendations (
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
    end if;

    execute 'alter table public.trip_recommendations add column if not exists id uuid';
    execute 'alter table public.trip_recommendations add column if not exists trip_id uuid';
    execute 'alter table public.trip_recommendations add column if not exists user_id uuid';
    execute 'alter table public.trip_recommendations add column if not exists place_id text';
    execute 'alter table public.trip_recommendations add column if not exists category text';
    execute 'alter table public.trip_recommendations add column if not exists relevance_score numeric';
    execute 'alter table public.trip_recommendations add column if not exists distance_meters integer';
    execute 'alter table public.trip_recommendations add column if not exists price_level integer';
    execute 'alter table public.trip_recommendations add column if not exists summary text';
    execute 'alter table public.trip_recommendations add column if not exists raw_json jsonb';
    execute 'alter table public.trip_recommendations add column if not exists created_at timestamptz';
    execute 'alter table public.trip_recommendations add column if not exists updated_at timestamptz';

    execute 'update public.trip_recommendations set id = coalesce(id, gen_random_uuid())';
    execute 'update public.trip_recommendations set created_at = coalesce(created_at, now())';
    execute 'update public.trip_recommendations set updated_at = coalesce(updated_at, now())';
    execute 'alter table public.trip_recommendations alter column id set default gen_random_uuid()';
    execute 'alter table public.trip_recommendations alter column created_at set default now()';
    execute 'alter table public.trip_recommendations alter column updated_at set default now()';

    begin
      execute 'alter table public.trip_recommendations alter column id set not null';
      execute 'alter table public.trip_recommendations alter column created_at set not null';
      execute 'alter table public.trip_recommendations alter column updated_at set not null';
    exception when others then
      raise notice 'trip_recommendations not-null warning: %', sqlerrm;
    end;

    execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_pkey';
    execute 'alter table public.trip_recommendations add constraint trip_recommendations_pkey primary key (id)';
    execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_trip_id_fkey';
    execute 'alter table public.trip_recommendations add constraint trip_recommendations_trip_id_fkey foreign key (trip_id) references public.trips(id) on delete cascade';
    execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_user_id_fkey';
    execute 'alter table public.trip_recommendations add constraint trip_recommendations_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade';
    execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_trip_place_unique';
    execute 'alter table public.trip_recommendations add constraint trip_recommendations_trip_place_unique unique (trip_id, place_id)';

    execute 'create index if not exists trip_recommendations_trip_id_idx on public.trip_recommendations(trip_id)';
    execute 'create index if not exists trip_recommendations_place_id_idx on public.trip_recommendations(place_id)';
    execute 'create index if not exists trip_recommendations_category_idx on public.trip_recommendations(category)';

    execute 'drop trigger if exists trip_recommendations_updated_at on public.trip_recommendations';
    execute 'create trigger trip_recommendations_updated_at before update on public.trip_recommendations for each row execute procedure public.set_updated_at()';

    execute 'alter table public.trip_recommendations enable row level security';
    execute 'drop policy if exists "trip_recommendations: usuario ve los suyos" on public.trip_recommendations';
    execute 'create policy "trip_recommendations: usuario ve los suyos" on public.trip_recommendations for select using (auth.uid() = user_id)';
    execute 'drop policy if exists "trip_recommendations: usuario crea recomendaciones" on public.trip_recommendations';
    execute 'create policy "trip_recommendations: usuario crea recomendaciones" on public.trip_recommendations for insert with check (auth.uid() = user_id)';
    execute 'drop policy if exists "trip_recommendations: usuario actualiza recomendaciones" on public.trip_recommendations';
    execute 'create policy "trip_recommendations: usuario actualiza recomendaciones" on public.trip_recommendations for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
    execute 'drop policy if exists "trip_recommendations: usuario elimina recomendaciones" on public.trip_recommendations';
    execute 'create policy "trip_recommendations: usuario elimina recomendaciones" on public.trip_recommendations for delete using (auth.uid() = user_id)';
  exception
    when others then
      raise exception 'trip_recommendations hard-fix failed: %', sqlerrm;
  end;
end$$;
