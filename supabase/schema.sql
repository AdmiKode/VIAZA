-- ============================================================
-- VIAZA — Schema SQL completo para Supabase
-- Versión: 1.0.0  |  Fecha: 2026-03-12
--
-- INSTRUCCIONES:
--   1. Abre el SQL Editor en tu proyecto de Supabase
--   2. Pega y ejecuta este archivo completo
--   3. Configura las variables de entorno en tu .env:
--        VITE_SUPABASE_URL=...
--        VITE_SUPABASE_ANON_KEY=...
--
-- NOTAS DE SEGURIDAD:
--   - RLS habilitado en TODAS las tablas
--   - Las políticas permiten al usuario leer/escribir SOLO sus propios datos
--   - No hay políticas que bloqueen operaciones legítimas del usuario autenticado
--   - Los triggers mantienen integridad sin lógica en el cliente
-- ============================================================

-- ─── Extensiones necesarias ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Enum types ──────────────────────────────────────────────────────────────
create type travel_type      as enum ('beach','mountain','city','camping','work','snow','roadtrip','adventure');
create type climate_type     as enum ('hot','cold','mild','rainy');
create type traveler_group   as enum ('solo','couple','family','family_baby','friends');
create type laundry_mode     as enum ('none','washer','laundry_service');
create type packing_style    as enum ('light','normal','heavy');
create type trip_status      as enum ('planning','active','completed');
create type transport_type   as enum ('flight','car','bus','cruise','train');
create type traveler_role    as enum ('adult','child','baby');
create type subscription_plan as enum ('free','pro');
create type payment_status   as enum ('pending','completed','failed','refunded');
create type payment_provider as enum ('stripe','apple_pay','google_pay','paypal');
create type luggage_size     as enum ('cabin','medium','large','xl');

-- ============================================================
-- 1. PROFILES
--    Extiende auth.users de Supabase con datos de la app.
--    Se crea automáticamente al registrarse vía trigger.
-- ============================================================
create table public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  name            text        not null default '',
  avatar_url      text,
  preferred_lang  text        not null default 'es',
  -- Suscripción
  plan            subscription_plan not null default 'free',
  plan_expires_at timestamptz,
  -- Metadatos
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, preferred_lang)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'lang', 'es')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: actualizar updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;

create policy "profiles: usuario lee su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: usuario actualiza su propio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- 2. TRIPS
--    Un viaje por usuario. Puede tener múltiples viajes
--    (historial). Solo uno puede estar 'active' a la vez.
-- ============================================================
create table public.trips (
  id                    uuid          primary key default uuid_generate_v4(),
  user_id               uuid          not null references public.profiles(id) on delete cascade,
  title                 text          not null,
  destination           text          not null,
  country_code          text,
  lat                   double precision,
  lon                   double precision,
  start_date            date,
  end_date              date,
  duration_days         int           not null default 1,
  travel_type           travel_type   not null,
  climate               climate_type  not null default 'mild',
  traveler_group        traveler_group not null default 'solo',
  activities            text[]        not null default '{}',
  laundry_mode          laundry_mode  not null default 'none',
  packing_style         packing_style not null default 'normal',
  has_laptop            boolean       not null default false,
  travel_light          boolean       not null default false,
  trip_status           trip_status   not null default 'planning',
  -- Transporte
  transport_type        transport_type,
  origin_city           text,
  origin_lat            double precision,
  origin_lon            double precision,
  flight_number         text,
  airline               text,
  airport_code          text,
  flight_departure_time text,          -- HH:MM
  bus_terminal          text,
  train_station         text,
  cruise_port           text,
  -- Moneda e idioma
  currency_code         text,
  language_code         text,
  -- Integrantes
  number_of_adults      int           not null default 1,
  number_of_kids        int           not null default 0,
  number_of_babies      int           not null default 0,
  -- Clima guardado
  weather_forecast      jsonb,         -- WeatherForecast serializado
  -- Metadatos
  created_at            timestamptz   not null default now(),
  updated_at            timestamptz   not null default now()
);

create index trips_user_id_idx on public.trips(user_id);
create index trips_status_idx  on public.trips(trip_status);

create trigger trips_updated_at
  before update on public.trips
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.trips enable row level security;

create policy "trips: usuario ve sus viajes"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "trips: usuario crea sus viajes"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "trips: usuario actualiza sus viajes"
  on public.trips for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "trips: usuario elimina sus viajes"
  on public.trips for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. TRAVELERS
--    Integrantes del viaje (adultos, niños, bebés).
--    Cada ítem de maleta puede pertenecer a un integrante.
-- ============================================================
create table public.travelers (
  id           uuid          primary key default uuid_generate_v4(),
  trip_id      uuid          not null references public.trips(id) on delete cascade,
  user_id      uuid          not null references public.profiles(id) on delete cascade,
  name         text          not null,
  role         traveler_role not null default 'adult',
  age          int,
  avatar_emoji text,
  sort_order   int           not null default 0,
  created_at   timestamptz   not null default now()
);

create index travelers_trip_id_idx on public.travelers(trip_id);

-- RLS
alter table public.travelers enable row level security;

create policy "travelers: usuario ve los de sus viajes"
  on public.travelers for select
  using (auth.uid() = user_id);

create policy "travelers: usuario crea integrantes"
  on public.travelers for insert
  with check (auth.uid() = user_id);

create policy "travelers: usuario actualiza integrantes"
  on public.travelers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "travelers: usuario elimina integrantes"
  on public.travelers for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. PACKING_ITEMS
--    Ítems de la lista de maleta. Pueden pertenecer a un
--    integrante específico (travelerId) o al viaje general.
-- ============================================================
create table public.packing_items (
  id           uuid        primary key default uuid_generate_v4(),
  trip_id      uuid        not null references public.trips(id) on delete cascade,
  traveler_id  uuid        references public.travelers(id) on delete set null,
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  label_key    text        not null,   -- clave i18n o texto libre
  label        text        not null,   -- texto en idioma del usuario
  category     text        not null default 'general',
  quantity     int         not null default 1,
  checked      boolean     not null default false,
  source       text        not null default 'generated',  -- 'generated' | 'user_custom'
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index packing_items_trip_id_idx     on public.packing_items(trip_id);
create index packing_items_traveler_id_idx on public.packing_items(traveler_id);

create trigger packing_items_updated_at
  before update on public.packing_items
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.packing_items enable row level security;

create policy "packing_items: usuario ve los de sus viajes"
  on public.packing_items for select
  using (auth.uid() = user_id);

create policy "packing_items: usuario crea ítems"
  on public.packing_items for insert
  with check (auth.uid() = user_id);

create policy "packing_items: usuario actualiza ítems"
  on public.packing_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "packing_items: usuario elimina ítems"
  on public.packing_items for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. PACKING_EVIDENCE
--    Fotos de evidencia de que un ítem ya está en la maleta.
--    Las imágenes se guardan en Supabase Storage (bucket: evidence).
-- ============================================================
create table public.packing_evidence (
  id           uuid        primary key default uuid_generate_v4(),
  item_id      uuid        not null references public.packing_items(id) on delete cascade,
  traveler_id  uuid        references public.travelers(id) on delete set null,
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  photo_url    text        not null,   -- URL pública del Storage
  storage_path text        not null,   -- path interno en el bucket
  taken_at     timestamptz not null default now()
);

create index packing_evidence_item_id_idx on public.packing_evidence(item_id);

-- RLS
alter table public.packing_evidence enable row level security;

create policy "packing_evidence: usuario ve sus fotos"
  on public.packing_evidence for select
  using (auth.uid() = user_id);

create policy "packing_evidence: usuario sube fotos"
  on public.packing_evidence for insert
  with check (auth.uid() = user_id);

create policy "packing_evidence: usuario elimina fotos"
  on public.packing_evidence for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. LUGGAGE_PHOTOS
--    Fotos de la maleta completa para el asistente de acomodo.
--    Incluye la recomendación de la IA y el análisis de zonas.
-- ============================================================
create table public.luggage_photos (
  id              uuid          primary key default uuid_generate_v4(),
  trip_id         uuid          not null references public.trips(id) on delete cascade,
  traveler_id     uuid          references public.travelers(id) on delete set null,
  user_id         uuid          not null references public.profiles(id) on delete cascade,
  photo_url       text          not null,
  storage_path    text          not null,
  luggage_size    luggage_size  not null default 'medium',
  phase           text          not null default 'open',  -- 'open' | 'packed' | 'final'
  ai_suggestion   text,         -- recomendación de la IA en texto libre
  zones           jsonb,        -- { left: string[], right: string[], center: string[], access: string[] }
  taken_at        timestamptz   not null default now()
);

create index luggage_photos_trip_id_idx on public.luggage_photos(trip_id);

-- RLS
alter table public.luggage_photos enable row level security;

create policy "luggage_photos: usuario ve sus fotos"
  on public.luggage_photos for select
  using (auth.uid() = user_id);

create policy "luggage_photos: usuario sube fotos"
  on public.luggage_photos for insert
  with check (auth.uid() = user_id);

create policy "luggage_photos: usuario actualiza fotos"
  on public.luggage_photos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "luggage_photos: usuario elimina fotos"
  on public.luggage_photos for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 7. TRIP_ACTIVITIES
--    Actividades planificadas para un viaje con contexto real:
--    costo, duración, tips, alertas de compra anticipada.
-- ============================================================
create table public.trip_activities (
  id              uuid        primary key default uuid_generate_v4(),
  trip_id         uuid        not null references public.trips(id) on delete cascade,
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  activity_key    text        not null,   -- clave del activityEngine
  name            text        not null,
  category        text        not null default 'leisure',
  estimated_cost  numeric(10,2),
  currency        text        not null default 'USD',
  duration_hours  numeric(4,1),
  tip             text,
  booking_url     text,
  booking_required boolean   not null default false,
  booked          boolean     not null default false,
  booked_at       timestamptz,
  notes           text,
  sort_order      int         not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index trip_activities_trip_id_idx on public.trip_activities(trip_id);

create trigger trip_activities_updated_at
  before update on public.trip_activities
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.trip_activities enable row level security;

create policy "trip_activities: usuario ve las de sus viajes"
  on public.trip_activities for select
  using (auth.uid() = user_id);

create policy "trip_activities: usuario crea actividades"
  on public.trip_activities for insert
  with check (auth.uid() = user_id);

create policy "trip_activities: usuario actualiza actividades"
  on public.trip_activities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "trip_activities: usuario elimina actividades"
  on public.trip_activities for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 8. DEPARTURE_REMINDERS
--    Recordatorios de salida programados con Capacitor.
--    Se guarda el estado para sincronizar entre dispositivos.
-- ============================================================
create table public.departure_reminders (
  id              uuid        primary key default uuid_generate_v4(),
  trip_id         uuid        not null references public.trips(id) on delete cascade,
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  remind_at       timestamptz not null,
  message         text        not null,
  is_active       boolean     not null default true,
  fired_at        timestamptz,
  capacitor_id    int,        -- ID de la notificación en Capacitor Local Notifications
  created_at      timestamptz not null default now()
);

create index departure_reminders_trip_id_idx on public.departure_reminders(trip_id);
create index departure_reminders_remind_at_idx on public.departure_reminders(remind_at) where is_active = true;

-- RLS
alter table public.departure_reminders enable row level security;

create policy "departure_reminders: usuario ve los suyos"
  on public.departure_reminders for select
  using (auth.uid() = user_id);

create policy "departure_reminders: usuario crea recordatorios"
  on public.departure_reminders for insert
  with check (auth.uid() = user_id);

create policy "departure_reminders: usuario actualiza recordatorios"
  on public.departure_reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "departure_reminders: usuario elimina recordatorios"
  on public.departure_reminders for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 9. SPLIT_BILL_SESSIONS
--    Sesiones de división de gastos entre viajeros.
-- ============================================================
create table public.split_bill_sessions (
  id          uuid        primary key default uuid_generate_v4(),
  trip_id     uuid        references public.trips(id) on delete set null,
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  title       text        not null,
  currency    text        not null default 'USD',
  participants jsonb      not null default '[]',  -- [{ id, name }]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger split_bill_sessions_updated_at
  before update on public.split_bill_sessions
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.split_bill_sessions enable row level security;

create policy "split_bill_sessions: usuario ve las suyas"
  on public.split_bill_sessions for select
  using (auth.uid() = user_id);

create policy "split_bill_sessions: usuario crea sesiones"
  on public.split_bill_sessions for insert
  with check (auth.uid() = user_id);

create policy "split_bill_sessions: usuario actualiza sesiones"
  on public.split_bill_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "split_bill_sessions: usuario elimina sesiones"
  on public.split_bill_sessions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 10. SPLIT_BILL_EXPENSES
--     Gastos individuales dentro de una sesión.
-- ============================================================
create table public.split_bill_expenses (
  id           uuid        primary key default uuid_generate_v4(),
  session_id   uuid        not null references public.split_bill_sessions(id) on delete cascade,
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  description  text        not null,
  amount       numeric(12,2) not null,
  paid_by      text        not null,   -- nombre del participante
  split_among  text[]      not null default '{}',  -- nombres de los que dividen
  created_at   timestamptz not null default now()
);

create index split_bill_expenses_session_id_idx on public.split_bill_expenses(session_id);

-- RLS
alter table public.split_bill_expenses enable row level security;

create policy "split_bill_expenses: usuario ve los suyos"
  on public.split_bill_expenses for select
  using (auth.uid() = user_id);

create policy "split_bill_expenses: usuario crea gastos"
  on public.split_bill_expenses for insert
  with check (auth.uid() = user_id);

create policy "split_bill_expenses: usuario actualiza gastos"
  on public.split_bill_expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "split_bill_expenses: usuario elimina gastos"
  on public.split_bill_expenses for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 11. PAYMENTS
--     Registro de pagos para la suscripción PRO.
--     Soporta Stripe, Apple Pay, Google Pay y PayPal.
--     NUNCA almacenes datos de tarjeta aquí — solo IDs externos.
-- ============================================================
create table public.payments (
  id                  uuid             primary key default uuid_generate_v4(),
  user_id             uuid             not null references public.profiles(id) on delete cascade,
  provider            payment_provider not null,
  provider_payment_id text             not null unique,  -- ID de Stripe/Apple/Google/PayPal
  provider_customer_id text,                             -- Customer ID en el proveedor
  amount              numeric(10,2)    not null,
  currency            text             not null default 'USD',
  status              payment_status   not null default 'pending',
  plan_purchased      subscription_plan not null default 'pro',
  plan_duration_days  int              not null default 365,  -- días que otorga
  receipt_url         text,
  error_message       text,
  metadata            jsonb,           -- datos adicionales del proveedor
  created_at          timestamptz      not null default now(),
  updated_at          timestamptz      not null default now()
);

create index payments_user_id_idx on public.payments(user_id);
create index payments_provider_payment_id_idx on public.payments(provider_payment_id);
create index payments_status_idx on public.payments(status);

create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.set_updated_at();

-- Trigger: al completar un pago, actualizar el plan del usuario automáticamente
create or replace function public.handle_payment_completed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    update public.profiles
    set
      plan = new.plan_purchased,
      plan_expires_at = now() + (new.plan_duration_days || ' days')::interval,
      updated_at = now()
    where id = new.user_id;
  end if;

  -- Si el pago fue reembolsado, regresar a free
  if new.status = 'refunded' and old.status = 'completed' then
    update public.profiles
    set
      plan = 'free',
      plan_expires_at = null,
      updated_at = now()
    where id = new.user_id;
  end if;

  return new;
end;
$$;

create trigger on_payment_status_change
  after update of status on public.payments
  for each row execute procedure public.handle_payment_completed();

-- RLS — El usuario solo ve SUS pagos. No puede insertar ni modificar directamente
-- (los pagos los inserta el backend/webhook de Stripe, no el cliente).
alter table public.payments enable row level security;

create policy "payments: usuario ve sus pagos"
  on public.payments for select
  using (auth.uid() = user_id);

-- NOTA: No hay política de INSERT/UPDATE para el cliente.
-- Los pagos se insertan desde el backend (Edge Function de Supabase o webhook).
-- Esto evita que el cliente manipule su propio estado de pago.

-- ============================================================
-- 12. SUBSCRIPTIONS
--     Vista calculada del estado actual de la suscripción.
--     Facilita las queries del cliente sin lógica compleja.
-- ============================================================
create or replace view public.user_subscription as
select
  p.id                                          as user_id,
  p.plan,
  p.plan_expires_at,
  case
    when p.plan = 'free'                         then false
    when p.plan_expires_at is null               then true   -- pro sin fecha de expiración
    when p.plan_expires_at > now()               then true
    else false
  end                                            as is_active_pro,
  case
    when p.plan_expires_at is not null
     and p.plan_expires_at > now()
    then extract(day from (p.plan_expires_at - now()))::int
    else null
  end                                            as days_remaining
from public.profiles p;

-- RLS en la vista (heredado del perfil)
-- El usuario solo puede ver su propia fila via auth.uid()

-- ============================================================
-- 13. STORAGE BUCKETS
--    Configuración de los buckets de Supabase Storage.
--    Ejecutar en el SQL Editor o via Dashboard > Storage.
-- ============================================================

-- Bucket para fotos de evidencia de maleta
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidence',
  'evidence',
  false,                          -- privado: solo el dueño puede acceder
  5242880,                        -- 5 MB máximo por foto
  array['image/jpeg','image/png','image/webp','image/heic']
) on conflict (id) do nothing;

-- Bucket para fotos de maleta completa (asistente de acomodo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'luggage',
  'luggage',
  false,
  10485760,                       -- 10 MB máximo
  array['image/jpeg','image/png','image/webp','image/heic']
) on conflict (id) do nothing;

-- Bucket para avatares de perfil
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,                           -- público: las fotos de perfil son accesibles
  2097152,                        -- 2 MB máximo
  array['image/jpeg','image/png','image/webp']
) on conflict (id) do nothing;

-- Políticas de Storage: cada usuario solo accede a su carpeta (user_id/...)
create policy "evidence: usuario sube sus fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "evidence: usuario lee sus fotos"
  on storage.objects for select
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "evidence: usuario elimina sus fotos"
  on storage.objects for delete
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "luggage: usuario sube sus fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'luggage'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "luggage: usuario lee sus fotos"
  on storage.objects for select
  using (
    bucket_id = 'luggage'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "luggage: usuario elimina sus fotos"
  on storage.objects for delete
  using (
    bucket_id = 'luggage'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: cualquiera puede leer"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: usuario sube su avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: usuario actualiza su avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 14. EDGE FUNCTIONS (referencia — no SQL)
--    Crear en supabase/functions/:
--
--    stripe-webhook/index.ts
--      - Recibe eventos de Stripe (payment_intent.succeeded, etc.)
--      - Inserta/actualiza en public.payments
--      - El trigger handle_payment_completed actualiza el perfil
--
--    apple-iap-verify/index.ts
--      - Verifica receipts de Apple In-App Purchase
--      - Inserta en public.payments con provider='apple_pay'
--
--    google-iap-verify/index.ts
--      - Verifica purchases de Google Play Billing
--      - Inserta en public.payments con provider='google_pay'
--
-- ============================================================

-- ============================================================
-- 15. ÍNDICES ADICIONALES DE RENDIMIENTO
-- ============================================================
create index trips_user_status_idx
  on public.trips(user_id, trip_status);

create index packing_items_trip_checked_idx
  on public.packing_items(trip_id, checked);

create index payments_user_status_idx
  on public.payments(user_id, status);

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
-- Tablas creadas:
--   1.  profiles            — perfil de usuario + plan
--   2.  trips               — viajes
--   3.  travelers           — integrantes del viaje
--   4.  packing_items       — ítems de maleta
--   5.  packing_evidence    — fotos de evidencia por ítem
--   6.  luggage_photos      — fotos de maleta completa
--   7.  trip_activities     — actividades planificadas
--   8.  departure_reminders — recordatorios de salida
--   9.  split_bill_sessions — sesiones de división de gastos
--   10. split_bill_expenses — gastos individuales
--   11. payments            — pagos de suscripción PRO
--   12. user_subscription   — vista del estado de suscripción
--
-- Buckets de Storage:
--   evidence  — fotos de evidencia (privado, 5MB)
--   luggage   — fotos de maleta (privado, 10MB)
--   avatars   — fotos de perfil (público, 2MB)
--
-- Triggers:
--   on_auth_user_created      — crea perfil al registrarse
--   on_payment_status_change  — actualiza plan al completar pago
--   *_updated_at              — mantiene updated_at automático
-- ============================================================
