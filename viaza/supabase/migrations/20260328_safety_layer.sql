-- ============================================================
-- MIGRACIÓN: Safety Layer
-- Fecha: 2026-03-28
-- Alcance: safe_walk MVP (foreground/sesión activa solamente)
--
-- IMPORTANTE — SEGURIDAD:
--   Las tablas de safety NO tienen policies públicas genéricas.
--   El acceso del acompañante se resuelve ÚNICAMENTE vía edge function
--   safety-tracking (service_role), que recibe el companion_token y
--   devuelve solo los campos necesarios. La tabla safety_sessions
--   y safety_checkins son privadas al owner en todo momento.
--
-- IMPORTANTE — ALCANCE TÉCNICO:
--   El check-in automático en este MVP asume sesión foreground activa.
--   Background location / foreground service de Android NO está resuelto
--   en Sprint 1 y se documenta como pendiente de Fase 2.
--
-- IMPORTANTE — OFFLINE:
--   La columna offline_queue en Supabase no resuelve pérdida de señal real.
--   La cola local del dispositivo es responsabilidad del cliente en Fase 3.
--   Esta tabla existe para sync post-reconexión, no como sustituto offline.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. SAFETY_SESSIONS
--    Una sesión por caminata/trayecto seguro. Owner = el viajero.
--    El acompañante nunca accede directamente — solo vía edge function.
-- ────────────────────────────────────────────────────────────
create table if not exists public.safety_sessions (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null references auth.users(id) on delete cascade,
  trip_id               uuid        references public.trips(id) on delete set null,
  session_type          text        not null default 'safe_walk'
                                    check (session_type in ('safe_walk', 'safe_return', 'live_share')),
  status                text        not null default 'active'
                                    check (status in ('active', 'completed', 'expired', 'sos_triggered')),
  companion_token       text        not null unique,   -- token opaco, generado por edge function
  companion_name        text,
  companion_phone       text,
  expected_duration_min integer,
  started_at            timestamptz not null default now(),
  expected_end_at       timestamptz,
  ended_at              timestamptz,
  last_checkin_at       timestamptz,
  last_lat              numeric,
  last_lon              numeric,
  last_accuracy         numeric,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
  -- NO hay columna is_public: la policy pública fue eliminada por diseño.
  -- El acceso externo va por service_role en la edge function.
);

drop trigger if exists safety_sessions_updated_at on public.safety_sessions;
create trigger safety_sessions_updated_at
  before update on public.safety_sessions
  for each row execute procedure public.set_updated_at();

alter table public.safety_sessions enable row level security;

-- Solo el owner (viajero) accede a sus propias sesiones.
drop policy if exists "safety_sessions: owner full" on public.safety_sessions;
create policy "safety_sessions: owner full"
  on public.safety_sessions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- NO existe policy pública. El acompañante accede vía edge function con service_role.


-- ────────────────────────────────────────────────────────────
-- 2. SAFETY_CHECKINS
--    Registro periódico de ubicación durante una sesión activa.
--    Solo accesible por el owner. El acompañante recibe los datos
--    filtrados por la edge function, no por RLS directo.
-- ────────────────────────────────────────────────────────────
create table if not exists public.safety_checkins (
  id         uuid        primary key default gen_random_uuid(),
  session_id uuid        not null references public.safety_sessions(id) on delete cascade,
  lat        numeric     not null,
  lon        numeric     not null,
  accuracy   numeric,
  note       text,
  checkin_at timestamptz not null default now()
);

alter table public.safety_checkins enable row level security;

drop policy if exists "safety_checkins: owner read via session" on public.safety_checkins;
create policy "safety_checkins: owner read via session"
  on public.safety_checkins
  using (
    exists (
      select 1 from public.safety_sessions s
      where s.id = session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "safety_checkins: owner insert via session" on public.safety_checkins;
create policy "safety_checkins: owner insert via session"
  on public.safety_checkins
  for insert
  with check (
    exists (
      select 1 from public.safety_sessions s
      where s.id = session_id
        and s.user_id = auth.uid()
    )
  );

-- NO existe policy pública ni de acompañante directo.


-- ────────────────────────────────────────────────────────────
-- 3. SOS_EVENTS
--    Log de cada evento SOS disparado. Solo accesible por el owner.
-- ────────────────────────────────────────────────────────────
create table if not exists public.sos_events (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  trip_id           uuid        references public.trips(id) on delete set null,
  session_id        uuid        references public.safety_sessions(id) on delete set null,
  triggered_at      timestamptz not null default now(),
  lat               numeric,
  lon               numeric,
  accuracy          numeric,
  contact_notified  text,
  contact_phone     text,
  method            text        not null default 'whatsapp'
                                check (method in ('whatsapp', 'sms', 'push', 'manual')),
  status            text        not null default 'sent'
                                check (status in ('sent', 'acknowledged', 'resolved')),
  resolved_at       timestamptz,
  notes             text,
  created_at        timestamptz not null default now()
);

alter table public.sos_events enable row level security;

drop policy if exists "sos_events: owner full" on public.sos_events;
create policy "sos_events: owner full"
  on public.sos_events
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 4. OFFLINE_QUEUE (sync post-reconexión, no sustituto offline real)
--    NOTA: esta tabla recibe eventos cuando el dispositivo recupera señal.
--    NO reemplaza almacenamiento local. La gestión offline real
--    (Capacitor Preferences + cola local) es tarea de Fase 3.
-- ────────────────────────────────────────────────────────────
create table if not exists public.offline_queue (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  event_type   text        not null check (event_type in ('sos', 'checkin', 'location_update')),
  payload      jsonb       not null,
  queued_at    timestamptz not null default now(),
  synced_at    timestamptz,
  is_synced    boolean     not null default false
);

alter table public.offline_queue enable row level security;

drop policy if exists "offline_queue: owner full" on public.offline_queue;
create policy "offline_queue: owner full"
  on public.offline_queue
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- ÍNDICES
-- ────────────────────────────────────────────────────────────
create index if not exists idx_safety_sessions_user_id
  on public.safety_sessions(user_id);

create index if not exists idx_safety_sessions_companion_token
  on public.safety_sessions(companion_token);

create index if not exists idx_safety_sessions_status
  on public.safety_sessions(user_id, status)
  where status = 'active';

create index if not exists idx_safety_checkins_session_id
  on public.safety_checkins(session_id, checkin_at desc);

create index if not exists idx_sos_events_user_id
  on public.sos_events(user_id, triggered_at desc);

create index if not exists idx_offline_queue_user_pending
  on public.offline_queue(user_id, queued_at)
  where is_synced = false;
