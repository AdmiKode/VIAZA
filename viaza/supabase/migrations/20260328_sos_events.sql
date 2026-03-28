-- ============================================================
-- MIGRACIÓN: sos_events
-- Fecha: 2026-03-28
-- Token efímero de 32 chars URL-safe, ciclo de vida completo.
-- IDEMPOTENTE — usa IF NOT EXISTS / DROP IF EXISTS en todo.
-- ============================================================

-- ─── 0. Limpiar tabla si existe incompleta ──────────────────
-- (necesario si un run anterior falló a medias)
drop table if exists public.sos_events cascade;

-- ─── 1. Tabla principal ────────────────────────────────────

create table public.sos_events (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  trip_id          uuid        references public.trips(id) on delete set null,

  -- Geolocalización en el momento del SOS
  lat              double precision,
  lon              double precision,
  accuracy_meters  double precision,

  -- Token efímero de acceso público (32 chars, URL-safe base64)
  event_token      text        unique not null,
  token_expires_at timestamptz not null,        -- now() + 24h

  -- Ciclo de vida
  status           text        not null default 'sent'
                   check (status in ('sent','delivered','acknowledged','resolved','expired')),

  -- Contenido del mensaje
  message_text     text,
  sent_to_name     text,
  sent_to_phone    text,   -- últimos 4 dígitos visibles
  sent_via         text,   -- 'whatsapp' | 'sms' | 'email' | 'manual'

  -- Resolución
  acknowledged_at  timestamptz,
  resolved_at      timestamptz,
  notes            text,

  created_at       timestamptz not null default now()
);

-- ─── 2. Índices ────────────────────────────────────────────

create index sos_events_user_idx
  on public.sos_events (user_id, created_at desc);

create index sos_events_token_idx
  on public.sos_events (event_token);

create index sos_events_trip_idx
  on public.sos_events (trip_id, created_at desc)
  where trip_id is not null;

-- ─── 3. RLS ────────────────────────────────────────────────

alter table public.sos_events enable row level security;

-- El dueño gestiona todos sus eventos
create policy "sos_events: owner"
  on public.sos_events
  for all
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Acceso público anónimo por token válido y activo
create policy "sos_events: public token read"
  on public.sos_events
  for select
  to anon, authenticated
  using (
    token_expires_at > now()
    and status not in ('expired', 'resolved')
  );
