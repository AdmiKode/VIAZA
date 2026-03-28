-- ============================================================
-- MIGRACIÓN: Travel Memory / Bitácora de Viaje
-- Fecha: 2026-03-28
-- Tabla: public.trip_journal_entries
--
-- Permite al viajero registrar momentos durante un viaje:
--   texto libre, fotos (storage bucket), tags, mood, ubicación.
--
-- IDEMPOTENTE: usa IF NOT EXISTS en todos los DDL.
-- ============================================================

-- Tipo mood
do $$ begin
  if not exists (select 1 from pg_type where typname = 'journal_mood') then
    create type public.journal_mood as enum ('great','good','neutral','tired','bad');
  end if;
end $$;

create table if not exists public.trip_journal_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  trip_id           uuid references public.trips(id) on delete set null,

  -- Contenido
  title             text,
  body              text not null,
  mood              public.journal_mood,
  tags              text[] default '{}',

  -- Ubicación opcional
  lat               double precision,
  lon               double precision,
  place_name        text,

  -- Fotos: array de paths dentro del bucket viaza-journal
  photo_paths       text[] default '{}',

  -- Metadatos
  entry_date        date not null default current_date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Trigger updated_at
do $$ begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_trip_journal_entries_updated_at'
  ) then
    create trigger trg_trip_journal_entries_updated_at
      before update on public.trip_journal_entries
      for each row execute function public.update_updated_at_column();
  end if;
end $$;

-- Índices
create index if not exists idx_journal_entries_user_date
  on public.trip_journal_entries(user_id, entry_date desc);

create index if not exists idx_journal_entries_trip
  on public.trip_journal_entries(trip_id)
  where trip_id is not null;

-- RLS
alter table public.trip_journal_entries enable row level security;

drop policy if exists "Users manage own journal entries" on public.trip_journal_entries;
create policy "Users manage own journal entries"
  on public.trip_journal_entries
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Bucket de fotos de bitácora (idempotente vía SQL service_role)
-- Nota: crear el bucket en Supabase Dashboard → Storage → New bucket
--   nombre: viaza-journal   acceso: private
-- Si ya existe, ignorar.

comment on table public.trip_journal_entries is
  'Bitácora de momentos del viajero: texto, fotos, mood, ubicación. Una entrada por momento.';
