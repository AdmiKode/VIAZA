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
create or replace function public.ensure_enum_value(enum_name text, enum_value text)
returns void
language plpgsql
as $$
declare
  enum_exists boolean;
begin
  select exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = enum_name
      and t.typtype = 'e'
      and n.nspname = 'public'
  ) into enum_exists;

  if not enum_exists then
    execute format('create type public.%I as enum (%L)', enum_name, enum_value);
  elsif not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = enum_name
      and n.nspname = 'public'
      and e.enumlabel = enum_value
  ) then
    execute format('alter type public.%I add value %L', enum_name, enum_value);
  end if;
end;
$$;

select public.ensure_enum_value('travel_type', 'beach');
select public.ensure_enum_value('travel_type', 'mountain');
select public.ensure_enum_value('travel_type', 'city');
select public.ensure_enum_value('travel_type', 'camping');
select public.ensure_enum_value('travel_type', 'work');
select public.ensure_enum_value('travel_type', 'snow');
select public.ensure_enum_value('travel_type', 'roadtrip');
select public.ensure_enum_value('travel_type', 'adventure');

select public.ensure_enum_value('climate_type', 'hot');
select public.ensure_enum_value('climate_type', 'cold');
select public.ensure_enum_value('climate_type', 'mild');
select public.ensure_enum_value('climate_type', 'rainy');

select public.ensure_enum_value('traveler_group', 'solo');
select public.ensure_enum_value('traveler_group', 'couple');
select public.ensure_enum_value('traveler_group', 'family');
select public.ensure_enum_value('traveler_group', 'family_baby');
select public.ensure_enum_value('traveler_group', 'friends');

select public.ensure_enum_value('laundry_mode', 'none');
select public.ensure_enum_value('laundry_mode', 'washer');
select public.ensure_enum_value('laundry_mode', 'laundry_service');

select public.ensure_enum_value('packing_style', 'light');
select public.ensure_enum_value('packing_style', 'normal');
select public.ensure_enum_value('packing_style', 'heavy');

select public.ensure_enum_value('trip_status', 'planning');
select public.ensure_enum_value('trip_status', 'active');
select public.ensure_enum_value('trip_status', 'completed');

select public.ensure_enum_value('transport_type', 'flight');
select public.ensure_enum_value('transport_type', 'car');
select public.ensure_enum_value('transport_type', 'bus');
select public.ensure_enum_value('transport_type', 'cruise');
select public.ensure_enum_value('transport_type', 'train');

select public.ensure_enum_value('traveler_role', 'adult');
select public.ensure_enum_value('traveler_role', 'kid');
select public.ensure_enum_value('traveler_role', 'baby');

select public.ensure_enum_value('subscription_plan', 'free');
select public.ensure_enum_value('subscription_plan', 'premium');

select public.ensure_enum_value('payment_status', 'pending');
select public.ensure_enum_value('payment_status', 'completed');
select public.ensure_enum_value('payment_status', 'failed');
select public.ensure_enum_value('payment_status', 'refunded');

select public.ensure_enum_value('payment_provider', 'stripe');
select public.ensure_enum_value('payment_provider', 'apple_pay');
select public.ensure_enum_value('payment_provider', 'google_pay');
select public.ensure_enum_value('payment_provider', 'paypal');

select public.ensure_enum_value('luggage_size', 'cabin');
select public.ensure_enum_value('luggage_size', 'medium');
select public.ensure_enum_value('luggage_size', 'large');
select public.ensure_enum_value('luggage_size', 'extra_large');

select public.ensure_enum_value('traveler_profile', 'economic');
select public.ensure_enum_value('traveler_profile', 'balanced');
select public.ensure_enum_value('traveler_profile', 'comfort');
select public.ensure_enum_value('traveler_profile', 'premium');

select public.ensure_enum_value('travel_style', 'backpack_light');
select public.ensure_enum_value('travel_style', 'standard');
select public.ensure_enum_value('travel_style', 'comfort');

-- ============================================================
-- 1. PROFILES
--    Extiende auth.users de Supabase con datos de la app.
--    Se crea automáticamente al registrarse vía trigger.
-- ============================================================
create table if not exists public.profiles (
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

drop trigger if exists on_auth_user_created on auth.users;
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

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "profiles: usuario lee su propio perfil" on public.profiles;
create policy "profiles: usuario lee su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: usuario actualiza su propio perfil" on public.profiles;
create policy "profiles: usuario actualiza su propio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- 2. EMERGENCY_PROFILES
--    Emergency Travel Card del usuario (privada) + token público para QR.
--    La vista pública NO debe leerse directo de la tabla desde el cliente:
--    se expone vía RPC `get_emergency_public_view(token)`.
-- ============================================================
create table if not exists public.emergency_profiles (
  id                          uuid        primary key default uuid_generate_v4(),
  user_id                     uuid        not null references public.profiles(id) on delete cascade,
  trip_id                     uuid, -- FK se agrega después de crear public.trips

  -- Datos personales
  full_name                   text        not null default '',
  date_of_birth               date,
  nationality                 text,
  primary_language            text,
  secondary_language          text,
  photo_url                   text,

  -- Datos médicos
  blood_type                  text,
  allergies                   text,
  medications                 text,
  current_treatments          text,
  current_conditions          text,
  medical_notes               text,

  -- Seguro y médico
  insurance_provider          text,
  insurance_policy_number     text,
  doctor_name                 text,
  doctor_phone                text,

  -- Contactos de emergencia
  emergency_contact_1_name      text,
  emergency_contact_1_relation  text,
  emergency_contact_1_phone     text,
  emergency_contact_2_name      text,
  emergency_contact_2_relation  text,
  emergency_contact_2_phone     text,

  -- Visibilidad pública por bloque
  show_blood_type             boolean     not null default true,
  show_allergies              boolean     not null default true,
  show_conditions             boolean     not null default true,
  show_medications            boolean     not null default true,
  show_contacts               boolean     not null default true,
  show_insurance              boolean     not null default false,
  show_notes                  boolean     not null default false,

  -- Control QR público
  public_token                text        not null unique,
  qr_enabled                  boolean     not null default false,
  consent_public_display      boolean     not null default false,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists emergency_profiles_user_id_idx on public.emergency_profiles(user_id);
create index if not exists emergency_profiles_trip_id_idx on public.emergency_profiles(trip_id);
create index if not exists emergency_profiles_public_token_idx on public.emergency_profiles(public_token);

drop trigger if exists emergency_profiles_updated_at on public.emergency_profiles;
create trigger emergency_profiles_updated_at
  before update on public.emergency_profiles
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.emergency_profiles enable row level security;

drop policy if exists "emergency_profiles: usuario ve el suyo" on public.emergency_profiles;
create policy "emergency_profiles: usuario ve el suyo"
  on public.emergency_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "emergency_profiles: usuario crea el suyo" on public.emergency_profiles;
create policy "emergency_profiles: usuario crea el suyo"
  on public.emergency_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "emergency_profiles: usuario actualiza el suyo" on public.emergency_profiles;
create policy "emergency_profiles: usuario actualiza el suyo"
  on public.emergency_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "emergency_profiles: usuario elimina el suyo" on public.emergency_profiles;
create policy "emergency_profiles: usuario elimina el suyo"
  on public.emergency_profiles for delete
  using (auth.uid() = user_id);

-- RPC pública para QR: devuelve SOLO campos consentidos y solo si QR está activo
create or replace function public.get_emergency_public_view(token text)
returns table (
  full_name text,
  photo_url text,
  nationality text,
  primary_language text,
  secondary_language text,
  blood_type text,
  allergies text,
  current_conditions text,
  medications text,
  medical_notes text,
  insurance_provider text,
  insurance_policy_number text,
  emergency_contact_1_name text,
  emergency_contact_1_relation text,
  emergency_contact_1_phone text,
  emergency_contact_2_name text,
  emergency_contact_2_relation text,
  emergency_contact_2_phone text
)
language sql
security definer
set search_path = public
as $$
  select
    ep.full_name,
    ep.photo_url,
    ep.nationality,
    ep.primary_language,
    ep.secondary_language,
    case when ep.show_blood_type  then ep.blood_type           else null end as blood_type,
    case when ep.show_allergies   then ep.allergies            else null end as allergies,
    case when ep.show_conditions  then ep.current_conditions   else null end as current_conditions,
    case when ep.show_medications then ep.medications          else null end as medications,
    case when ep.show_notes       then ep.medical_notes        else null end as medical_notes,
    case when ep.show_insurance   then ep.insurance_provider   else null end as insurance_provider,
    case when ep.show_insurance   then ep.insurance_policy_number else null end as insurance_policy_number,
    case when ep.show_contacts    then ep.emergency_contact_1_name else null end as emergency_contact_1_name,
    case when ep.show_contacts    then ep.emergency_contact_1_relation else null end as emergency_contact_1_relation,
    case when ep.show_contacts    then ep.emergency_contact_1_phone else null end as emergency_contact_1_phone,
    case when ep.show_contacts    then ep.emergency_contact_2_name else null end as emergency_contact_2_name,
    case when ep.show_contacts    then ep.emergency_contact_2_relation else null end as emergency_contact_2_relation,
    case when ep.show_contacts    then ep.emergency_contact_2_phone else null end as emergency_contact_2_phone
  from public.emergency_profiles ep
  where
    ep.public_token = token
    and ep.qr_enabled = true
    and ep.consent_public_display = true
  limit 1;
$$;

revoke all on function public.get_emergency_public_view(text) from public;
grant execute on function public.get_emergency_public_view(text) to anon, authenticated;

-- Logs de acceso público al QR (sin almacenar token plano)
create table if not exists public.emergency_qr_access_logs (
  id                  bigserial   primary key,
  emergency_profile_id uuid       not null references public.emergency_profiles(id) on delete cascade,
  access_type         text        not null default 'public_view' check (access_type in ('public_view')),
  source              text,
  client_info         text,
  token_fingerprint   text        not null,
  accessed_at         timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index if not exists emergency_qr_access_logs_profile_idx
  on public.emergency_qr_access_logs(emergency_profile_id);

create index if not exists emergency_qr_access_logs_accessed_at_idx
  on public.emergency_qr_access_logs(accessed_at desc);

alter table public.emergency_qr_access_logs enable row level security;

drop policy if exists "emergency_qr_access_logs: owner reads" on public.emergency_qr_access_logs;
create policy "emergency_qr_access_logs: owner reads"
  on public.emergency_qr_access_logs for select
  using (
    exists (
      select 1
      from public.emergency_profiles ep
      where ep.id = emergency_qr_access_logs.emergency_profile_id
        and ep.user_id = auth.uid()
    )
  );

create or replace function public.log_emergency_qr_access(
  token text,
  source text default null,
  client_info text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if token is null or length(trim(token)) = 0 then
    return false;
  end if;

  select ep.id
    into v_profile_id
  from public.emergency_profiles ep
  where ep.public_token = token
    and ep.qr_enabled = true
    and ep.consent_public_display = true
  limit 1;

  if v_profile_id is null then
    return false;
  end if;

  insert into public.emergency_qr_access_logs (
    emergency_profile_id,
    access_type,
    source,
    client_info,
    token_fingerprint
  )
  values (
    v_profile_id,
    'public_view',
    nullif(left(coalesce(source, ''), 120), ''),
    nullif(left(coalesce(client_info, ''), 500), ''),
    encode(digest(token, 'sha256'), 'hex')
  );

  return true;
exception
  when others then
    return false;
end;
$$;

revoke all on function public.log_emergency_qr_access(text, text, text) from public;
grant execute on function public.log_emergency_qr_access(text, text, text) to anon, authenticated;

-- ============================================================
-- 2. TRIPS
--    Un viaje por usuario. Puede tener múltiples viajes
--    (historial). Solo uno puede estar 'active' a la vez.
-- ============================================================
create table if not exists public.trips (
  id                    uuid          primary key default uuid_generate_v4(),
  user_id               uuid          not null references public.profiles(id) on delete cascade,
  title                 text          not null,
  destination           text          not null,  -- nombre display (ej: "Cancún")
  destination_place_id  text,                   -- Google Places place_id
  destination_country   text,                   -- nombre país (ej: "Mexico")
  country_code          text,                   -- ISO (ej: "MX")
  destination_timezone  text,                   -- IANA tz (ej: "America/Cancun")
  lat                   double precision,
  lon                   double precision,
  start_date            date,
  end_date              date,
  duration_days         int           not null default 1,
  travel_type           travel_type   not null,
  climate               climate_type  not null default 'mild',
  traveler_group        traveler_group not null default 'solo',
  traveler_profile      traveler_profile not null default 'balanced',
  travel_style          travel_style     not null default 'standard',
  luggage_strategy      text,                   -- individual/shared/mother_baby/etc
  health_context        jsonb,                  -- alergias/meds/condiciones (alto nivel)
  emergency_context     jsonb,                  -- contexto operativo de emergencia por viaje
  active_modules        text[]        not null default '{}',
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
  weather_forecast      jsonb,         -- WeatherForecast agregado (compat)
  weather_forecast_daily jsonb,        -- forecast por día (mañana/tarde/noche)
  risk_level            text,          -- low|medium|high|critical|unknown
  risk_summary          jsonb,         -- snapshot normalizado del proveedor de riesgo
  risk_updated_at       timestamptz,
  recommendations_state jsonb,         -- cache/estado de recomendaciones por viaje
  translator_state      jsonb,         -- cache/estado del traductor por viaje
  wallet_state          jsonb,         -- estado del wallet (conteos, flags)
  agenda_state          jsonb,         -- estado agenda (conteos, flags)
  itinerary_state       jsonb,         -- estado itinerario (conteos, flags)
  -- Metadatos
  created_at            timestamptz   not null default now(),
  updated_at            timestamptz   not null default now()
);

alter table public.trips add column if not exists risk_level text;
alter table public.trips add column if not exists risk_summary jsonb;
alter table public.trips add column if not exists risk_updated_at timestamptz;

create index if not exists trips_user_id_idx on public.trips(user_id);
create index if not exists trips_status_idx  on public.trips(trip_status);
create index if not exists trips_risk_level_idx on public.trips(risk_level);

drop trigger if exists trips_updated_at on public.trips;
create trigger trips_updated_at
  before update on public.trips
  for each row execute procedure public.set_updated_at();

-- FK opcional: vincular Emergency Card a un viaje específico
alter table public.emergency_profiles
  drop constraint if exists emergency_profiles_trip_id_fkey;

alter table public.emergency_profiles
  add constraint emergency_profiles_trip_id_fkey
  foreign key (trip_id) references public.trips(id) on delete set null;

-- RLS
alter table public.trips enable row level security;

drop policy if exists "trips: usuario ve sus viajes" on public.trips;
create policy "trips: usuario ve sus viajes"
  on public.trips for select
  using (auth.uid() = user_id);

drop policy if exists "trips: usuario crea sus viajes" on public.trips;
create policy "trips: usuario crea sus viajes"
  on public.trips for insert
  with check (auth.uid() = user_id);

drop policy if exists "trips: usuario actualiza sus viajes" on public.trips;
create policy "trips: usuario actualiza sus viajes"
  on public.trips for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trips: usuario elimina sus viajes" on public.trips;
create policy "trips: usuario elimina sus viajes"
  on public.trips for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. TRAVELERS
--    Integrantes del viaje (adultos, niños, bebés).
--    Cada ítem de maleta puede pertenecer a un integrante.
-- ============================================================
create table if not exists public.travelers (
  id           uuid          primary key default uuid_generate_v4(),
  trip_id      uuid          not null references public.trips(id) on delete cascade,
  user_id      uuid          not null references public.profiles(id) on delete cascade,
  name         text          not null,
  role         traveler_role not null default 'adult',
  age          int,
  sort_order   int           not null default 0,
  created_at   timestamptz   not null default now()
);

create index if not exists travelers_trip_id_idx on public.travelers(trip_id);

-- RLS
alter table public.travelers enable row level security;

drop policy if exists "travelers: usuario ve los de sus viajes" on public.travelers;
create policy "travelers: usuario ve los de sus viajes"
  on public.travelers for select
  using (auth.uid() = user_id);

drop policy if exists "travelers: usuario crea integrantes" on public.travelers;
create policy "travelers: usuario crea integrantes"
  on public.travelers for insert
  with check (auth.uid() = user_id);

drop policy if exists "travelers: usuario actualiza integrantes" on public.travelers;
create policy "travelers: usuario actualiza integrantes"
  on public.travelers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "travelers: usuario elimina integrantes" on public.travelers;
create policy "travelers: usuario elimina integrantes"
  on public.travelers for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. PACKING_ITEMS
--    Ítems de la lista de maleta. Pueden pertenecer a un
--    integrante específico (travelerId) o al viaje general.
-- ============================================================
create table if not exists public.packing_items (
  id           uuid        primary key default uuid_generate_v4(),
  trip_id      uuid        not null references public.trips(id) on delete cascade,
  traveler_id  uuid        references public.travelers(id) on delete set null,
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  label_key    text,                  -- clave i18n (opcional) o texto libre
  label        text        not null,   -- texto en idioma del usuario
  category     text        not null default 'general',
  quantity     int         not null default 1,
  checked      boolean     not null default false,
  required     boolean     not null default false,
  source       text        not null default 'generated',  -- 'generated' | 'user_custom' | otros (engine)
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists packing_items_trip_id_idx     on public.packing_items(trip_id);
create index if not exists packing_items_traveler_id_idx on public.packing_items(traveler_id);

drop trigger if exists packing_items_updated_at on public.packing_items;
create trigger packing_items_updated_at
  before update on public.packing_items
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.packing_items enable row level security;

drop policy if exists "packing_items: usuario ve los de sus viajes" on public.packing_items;
create policy "packing_items: usuario ve los de sus viajes"
  on public.packing_items for select
  using (auth.uid() = user_id);

drop policy if exists "packing_items: usuario crea ítems" on public.packing_items;
create policy "packing_items: usuario crea ítems"
  on public.packing_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "packing_items: usuario actualiza ítems" on public.packing_items;
create policy "packing_items: usuario actualiza ítems"
  on public.packing_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "packing_items: usuario elimina ítems" on public.packing_items;
create policy "packing_items: usuario elimina ítems"
  on public.packing_items for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. PACKING_EVIDENCE
--    Fotos de evidencia de que un ítem ya está en la maleta.
--    Las imágenes se guardan en Supabase Storage (bucket: evidence).
-- ============================================================
create table if not exists public.packing_evidence (
  id           uuid        primary key default uuid_generate_v4(),
  item_id      uuid        not null references public.packing_items(id) on delete cascade,
  traveler_id  uuid        references public.travelers(id) on delete set null,
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  photo_url    text        not null,   -- URL pública del Storage
  storage_path text        not null,   -- path interno en el bucket
  taken_at     timestamptz not null default now()
);

create index if not exists packing_evidence_item_id_idx on public.packing_evidence(item_id);

-- RLS
alter table public.packing_evidence enable row level security;

drop policy if exists "packing_evidence: usuario ve sus fotos" on public.packing_evidence;
create policy "packing_evidence: usuario ve sus fotos"
  on public.packing_evidence for select
  using (auth.uid() = user_id);

drop policy if exists "packing_evidence: usuario sube fotos" on public.packing_evidence;
create policy "packing_evidence: usuario sube fotos"
  on public.packing_evidence for insert
  with check (auth.uid() = user_id);

drop policy if exists "packing_evidence: usuario elimina fotos" on public.packing_evidence;
create policy "packing_evidence: usuario elimina fotos"
  on public.packing_evidence for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 6. LUGGAGE_PHOTOS
--    Fotos de la maleta completa para el asistente de acomodo.
--    Incluye la recomendación de la IA y el análisis de zonas.
-- ============================================================
create table if not exists public.luggage_photos (
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

create index if not exists luggage_photos_trip_id_idx on public.luggage_photos(trip_id);

-- RLS
alter table public.luggage_photos enable row level security;

drop policy if exists "luggage_photos: usuario ve sus fotos" on public.luggage_photos;
create policy "luggage_photos: usuario ve sus fotos"
  on public.luggage_photos for select
  using (auth.uid() = user_id);

drop policy if exists "luggage_photos: usuario sube fotos" on public.luggage_photos;
create policy "luggage_photos: usuario sube fotos"
  on public.luggage_photos for insert
  with check (auth.uid() = user_id);

drop policy if exists "luggage_photos: usuario actualiza fotos" on public.luggage_photos;
create policy "luggage_photos: usuario actualiza fotos"
  on public.luggage_photos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "luggage_photos: usuario elimina fotos" on public.luggage_photos;
create policy "luggage_photos: usuario elimina fotos"
  on public.luggage_photos for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 7. SMART PACKING - SCAN/LAYOUT DATA MODEL
--    Base de datos para validación de checklist por escaneo y
--    propuestas estructuradas de acomodo de maleta.
-- ============================================================
create table if not exists public.suitcase_profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  trip_id           uuid not null references public.trips(id) on delete cascade,
  traveler_id       uuid references public.travelers(id) on delete set null,
  name              text not null default 'Maleta principal',
  luggage_type      text not null default 'checked' check (luggage_type in ('carry_on', 'checked', 'backpack', 'auto_trunk', 'other')),
  height_cm         numeric(6,2),
  width_cm          numeric(6,2),
  depth_cm          numeric(6,2),
  weight_limit_kg   numeric(6,2),
  compartments      int not null default 1,
  constraints       jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists suitcase_profiles_user_idx on public.suitcase_profiles(user_id);
create index if not exists suitcase_profiles_trip_idx on public.suitcase_profiles(trip_id);
create index if not exists suitcase_profiles_traveler_idx on public.suitcase_profiles(traveler_id);

drop trigger if exists suitcase_profiles_updated_at on public.suitcase_profiles;
create trigger suitcase_profiles_updated_at
  before update on public.suitcase_profiles
  for each row execute procedure public.set_updated_at();

alter table public.suitcase_profiles enable row level security;

drop policy if exists "suitcase_profiles: usuario ve los suyos" on public.suitcase_profiles;
create policy "suitcase_profiles: usuario ve los suyos"
  on public.suitcase_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "suitcase_profiles: usuario crea perfiles" on public.suitcase_profiles;
create policy "suitcase_profiles: usuario crea perfiles"
  on public.suitcase_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "suitcase_profiles: usuario actualiza perfiles" on public.suitcase_profiles;
create policy "suitcase_profiles: usuario actualiza perfiles"
  on public.suitcase_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "suitcase_profiles: usuario elimina perfiles" on public.suitcase_profiles;
create policy "suitcase_profiles: usuario elimina perfiles"
  on public.suitcase_profiles for delete
  using (auth.uid() = user_id);

create table if not exists public.packing_scan_sessions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  trip_id             uuid not null references public.trips(id) on delete cascade,
  traveler_id         uuid references public.travelers(id) on delete set null,
  suitcase_profile_id uuid references public.suitcase_profiles(id) on delete set null,
  status              text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  confidence_avg      numeric(5,4),
  completion_pct      numeric(5,2),
  missing_count       int not null default 0,
  duplicate_count     int not null default 0,
  uncertain_count     int not null default 0,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists packing_scan_sessions_user_idx on public.packing_scan_sessions(user_id);
create index if not exists packing_scan_sessions_trip_idx on public.packing_scan_sessions(trip_id);
create index if not exists packing_scan_sessions_traveler_idx on public.packing_scan_sessions(traveler_id);
create index if not exists packing_scan_sessions_status_idx on public.packing_scan_sessions(status);

drop trigger if exists packing_scan_sessions_updated_at on public.packing_scan_sessions;
create trigger packing_scan_sessions_updated_at
  before update on public.packing_scan_sessions
  for each row execute procedure public.set_updated_at();

alter table public.packing_scan_sessions enable row level security;

drop policy if exists "packing_scan_sessions: usuario ve las suyas" on public.packing_scan_sessions;
create policy "packing_scan_sessions: usuario ve las suyas"
  on public.packing_scan_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "packing_scan_sessions: usuario crea sesiones" on public.packing_scan_sessions;
create policy "packing_scan_sessions: usuario crea sesiones"
  on public.packing_scan_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "packing_scan_sessions: usuario actualiza sesiones" on public.packing_scan_sessions;
create policy "packing_scan_sessions: usuario actualiza sesiones"
  on public.packing_scan_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "packing_scan_sessions: usuario elimina sesiones" on public.packing_scan_sessions;
create policy "packing_scan_sessions: usuario elimina sesiones"
  on public.packing_scan_sessions for delete
  using (auth.uid() = user_id);

create table if not exists public.packing_scan_detections (
  id                bigserial primary key,
  session_id        uuid not null references public.packing_scan_sessions(id) on delete cascade,
  packing_item_id   uuid references public.packing_items(id) on delete set null,
  detected_label    text not null,
  normalized_label  text,
  confidence        numeric(5,4),
  match_status      text not null check (match_status in ('matched', 'missing', 'duplicate', 'uncertain', 'extra')),
  quantity_detected int not null default 1,
  source            text not null default 'vision',
  bbox              jsonb,
  raw_payload       jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists packing_scan_detections_session_idx on public.packing_scan_detections(session_id);
create index if not exists packing_scan_detections_item_idx on public.packing_scan_detections(packing_item_id);
create index if not exists packing_scan_detections_status_idx on public.packing_scan_detections(match_status);

alter table public.packing_scan_detections enable row level security;

drop policy if exists "packing_scan_detections: usuario ve las suyas" on public.packing_scan_detections;
create policy "packing_scan_detections: usuario ve las suyas"
  on public.packing_scan_detections for select
  using (
    exists (
      select 1
      from public.packing_scan_sessions ps
      where ps.id = packing_scan_detections.session_id
        and ps.user_id = auth.uid()
    )
  );

drop policy if exists "packing_scan_detections: usuario crea detecciones" on public.packing_scan_detections;
create policy "packing_scan_detections: usuario crea detecciones"
  on public.packing_scan_detections for insert
  with check (
    exists (
      select 1
      from public.packing_scan_sessions ps
      where ps.id = packing_scan_detections.session_id
        and ps.user_id = auth.uid()
    )
  );

drop policy if exists "packing_scan_detections: usuario actualiza detecciones" on public.packing_scan_detections;
create policy "packing_scan_detections: usuario actualiza detecciones"
  on public.packing_scan_detections for update
  using (
    exists (
      select 1
      from public.packing_scan_sessions ps
      where ps.id = packing_scan_detections.session_id
        and ps.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.packing_scan_sessions ps
      where ps.id = packing_scan_detections.session_id
        and ps.user_id = auth.uid()
    )
  );

drop policy if exists "packing_scan_detections: usuario elimina detecciones" on public.packing_scan_detections;
create policy "packing_scan_detections: usuario elimina detecciones"
  on public.packing_scan_detections for delete
  using (
    exists (
      select 1
      from public.packing_scan_sessions ps
      where ps.id = packing_scan_detections.session_id
        and ps.user_id = auth.uid()
    )
  );

create table if not exists public.suitcase_layout_plans (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  trip_id             uuid not null references public.trips(id) on delete cascade,
  traveler_id         uuid references public.travelers(id) on delete set null,
  suitcase_profile_id uuid not null references public.suitcase_profiles(id) on delete cascade,
  strategy_version    text not null default 'v1',
  layout              jsonb not null,
  notes               text,
  generated_by        text not null default 'ai_orchestrator',
  status              text not null default 'draft' check (status in ('draft', 'approved', 'applied')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists suitcase_layout_plans_user_idx on public.suitcase_layout_plans(user_id);
create index if not exists suitcase_layout_plans_trip_idx on public.suitcase_layout_plans(trip_id);
create index if not exists suitcase_layout_plans_profile_idx on public.suitcase_layout_plans(suitcase_profile_id);
create index if not exists suitcase_layout_plans_status_idx on public.suitcase_layout_plans(status);

drop trigger if exists suitcase_layout_plans_updated_at on public.suitcase_layout_plans;
create trigger suitcase_layout_plans_updated_at
  before update on public.suitcase_layout_plans
  for each row execute procedure public.set_updated_at();

alter table public.suitcase_layout_plans enable row level security;

drop policy if exists "suitcase_layout_plans: usuario ve planes" on public.suitcase_layout_plans;
create policy "suitcase_layout_plans: usuario ve planes"
  on public.suitcase_layout_plans for select
  using (auth.uid() = user_id);

drop policy if exists "suitcase_layout_plans: usuario crea planes" on public.suitcase_layout_plans;
create policy "suitcase_layout_plans: usuario crea planes"
  on public.suitcase_layout_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "suitcase_layout_plans: usuario actualiza planes" on public.suitcase_layout_plans;
create policy "suitcase_layout_plans: usuario actualiza planes"
  on public.suitcase_layout_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "suitcase_layout_plans: usuario elimina planes" on public.suitcase_layout_plans;
create policy "suitcase_layout_plans: usuario elimina planes"
  on public.suitcase_layout_plans for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 7. TRIP_ACTIVITIES
--    Actividades planificadas para un viaje con contexto real:
--    costo, duración, tips, alertas de compra anticipada.
-- ============================================================
create table if not exists public.trip_activities (
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

create index if not exists trip_activities_trip_id_idx on public.trip_activities(trip_id);

drop trigger if exists trip_activities_updated_at on public.trip_activities;
create trigger trip_activities_updated_at
  before update on public.trip_activities
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.trip_activities enable row level security;

drop policy if exists "trip_activities: usuario ve las de sus viajes" on public.trip_activities;
create policy "trip_activities: usuario ve las de sus viajes"
  on public.trip_activities for select
  using (auth.uid() = user_id);

drop policy if exists "trip_activities: usuario crea actividades" on public.trip_activities;
create policy "trip_activities: usuario crea actividades"
  on public.trip_activities for insert
  with check (auth.uid() = user_id);

drop policy if exists "trip_activities: usuario actualiza actividades" on public.trip_activities;
create policy "trip_activities: usuario actualiza actividades"
  on public.trip_activities for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trip_activities: usuario elimina actividades" on public.trip_activities;
create policy "trip_activities: usuario elimina actividades"
  on public.trip_activities for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 8. DEPARTURE_REMINDERS
--    Recordatorios de salida programados con Capacitor.
--    Se guarda el estado para sincronizar entre dispositivos.
-- ============================================================
create table if not exists public.departure_reminders (
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

create index if not exists departure_reminders_trip_id_idx on public.departure_reminders(trip_id);
create index if not exists departure_reminders_remind_at_idx on public.departure_reminders(remind_at) where is_active = true;

-- RLS
alter table public.departure_reminders enable row level security;

drop policy if exists "departure_reminders: usuario ve los suyos" on public.departure_reminders;
create policy "departure_reminders: usuario ve los suyos"
  on public.departure_reminders for select
  using (auth.uid() = user_id);

drop policy if exists "departure_reminders: usuario crea recordatorios" on public.departure_reminders;
create policy "departure_reminders: usuario crea recordatorios"
  on public.departure_reminders for insert
  with check (auth.uid() = user_id);

drop policy if exists "departure_reminders: usuario actualiza recordatorios" on public.departure_reminders;
create policy "departure_reminders: usuario actualiza recordatorios"
  on public.departure_reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "departure_reminders: usuario elimina recordatorios" on public.departure_reminders;
create policy "departure_reminders: usuario elimina recordatorios"
  on public.departure_reminders for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 9. SPLIT_BILL_SESSIONS
--    Sesiones de división de gastos entre viajeros.
-- ============================================================
create table if not exists public.split_bill_sessions (
  id          uuid        primary key default uuid_generate_v4(),
  trip_id     uuid        references public.trips(id) on delete set null,
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  title       text        not null,
  currency    text        not null default 'USD',
  participants jsonb      not null default '[]',  -- [{ id, name }]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists split_bill_sessions_updated_at on public.split_bill_sessions;
create trigger split_bill_sessions_updated_at
  before update on public.split_bill_sessions
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.split_bill_sessions enable row level security;

drop policy if exists "split_bill_sessions: usuario ve las suyas" on public.split_bill_sessions;
create policy "split_bill_sessions: usuario ve las suyas"
  on public.split_bill_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "split_bill_sessions: usuario crea sesiones" on public.split_bill_sessions;
create policy "split_bill_sessions: usuario crea sesiones"
  on public.split_bill_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "split_bill_sessions: usuario actualiza sesiones" on public.split_bill_sessions;
create policy "split_bill_sessions: usuario actualiza sesiones"
  on public.split_bill_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "split_bill_sessions: usuario elimina sesiones" on public.split_bill_sessions;
create policy "split_bill_sessions: usuario elimina sesiones"
  on public.split_bill_sessions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 10. SPLIT_BILL_EXPENSES
--     Gastos individuales dentro de una sesión.
-- ============================================================
create table if not exists public.split_bill_expenses (
  id           uuid        primary key default uuid_generate_v4(),
  session_id   uuid        not null references public.split_bill_sessions(id) on delete cascade,
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  description  text        not null,
  amount       numeric(12,2) not null,
  paid_by      text        not null,   -- nombre del participante
  split_among  text[]      not null default '{}',  -- nombres de los que dividen
  created_at   timestamptz not null default now()
);

create index if not exists split_bill_expenses_session_id_idx on public.split_bill_expenses(session_id);

-- RLS
alter table public.split_bill_expenses enable row level security;

drop policy if exists "split_bill_expenses: usuario ve los suyos" on public.split_bill_expenses;
create policy "split_bill_expenses: usuario ve los suyos"
  on public.split_bill_expenses for select
  using (auth.uid() = user_id);

drop policy if exists "split_bill_expenses: usuario crea gastos" on public.split_bill_expenses;
create policy "split_bill_expenses: usuario crea gastos"
  on public.split_bill_expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "split_bill_expenses: usuario actualiza gastos" on public.split_bill_expenses;
create policy "split_bill_expenses: usuario actualiza gastos"
  on public.split_bill_expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "split_bill_expenses: usuario elimina gastos" on public.split_bill_expenses;
create policy "split_bill_expenses: usuario elimina gastos"
  on public.split_bill_expenses for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 11. PAYMENTS
--     Registro de pagos para la suscripción PRO.
--     Soporta Stripe, Apple Pay, Google Pay y PayPal.
--     NUNCA almacenes datos de tarjeta aquí — solo IDs externos.
-- ============================================================
create table if not exists public.payments (
  id                  uuid             primary key default uuid_generate_v4(),
  user_id             uuid             not null references public.profiles(id) on delete cascade,
  provider            payment_provider not null,
  provider_payment_id text             not null unique,  -- ID de Stripe/Apple/Google/PayPal
  provider_customer_id text,                             -- Customer ID en el proveedor
  amount              numeric(10,2)    not null,
  currency            text             not null default 'MXN',
  status              payment_status   not null default 'pending',
  plan_purchased      subscription_plan not null default 'premium',
  plan_duration_days  int              not null default 30,  -- mensual por defecto (149 MXN / mes)
  receipt_url         text,
  error_message       text,
  metadata            jsonb,           -- datos adicionales del proveedor
  created_at          timestamptz      not null default now(),
  updated_at          timestamptz      not null default now()
);

create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_provider_payment_id_idx on public.payments(provider_payment_id);
create index if not exists payments_status_idx on public.payments(status);

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.set_updated_at();

-- Trigger: al completar un pago, actualizar el plan del usuario automáticamente
create or replace function public.handle_payment_completed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    if new.status = 'completed' then
      update public.profiles
      set
        plan = new.plan_purchased,
        plan_expires_at = now() + (new.plan_duration_days || ' days')::interval,
        updated_at = now()
      where id = new.user_id;
    end if;
    return new;
  end if;

  if new.status = 'completed' and old.status is distinct from 'completed' then
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

drop trigger if exists on_payment_status_change on public.payments;
create trigger on_payment_status_change
  after update of status on public.payments
  for each row execute procedure public.handle_payment_completed();

drop trigger if exists on_payment_insert on public.payments;
create trigger on_payment_insert
  after insert on public.payments
  for each row execute procedure public.handle_payment_completed();

-- RLS — El usuario solo ve SUS pagos. No puede insertar ni modificar directamente
-- (los pagos los inserta el backend/webhook de Stripe, no el cliente).
alter table public.payments enable row level security;

drop policy if exists "payments: usuario ve sus pagos" on public.payments;
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
    when p.plan_expires_at is null               then true   -- premium sin fecha de expiración
    when p.plan_expires_at > now()               then true
    else false
  end                                            as is_active_premium,
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

-- Bucket para documentos del Travel Wallet (PDF/imagenes)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wallet_docs',
  'wallet_docs',
  false,
  15728640,                       -- 15 MB máximo
  array['application/pdf','image/jpeg','image/png','image/webp','image/heic']
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
drop policy if exists "evidence: usuario sube sus fotos" on storage.objects;
create policy "evidence: usuario sube sus fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "evidence: usuario lee sus fotos" on storage.objects;
create policy "evidence: usuario lee sus fotos"
  on storage.objects for select
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "evidence: usuario elimina sus fotos" on storage.objects;
create policy "evidence: usuario elimina sus fotos"
  on storage.objects for delete
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "luggage: usuario sube sus fotos" on storage.objects;
create policy "luggage: usuario sube sus fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'luggage'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "luggage: usuario lee sus fotos" on storage.objects;
create policy "luggage: usuario lee sus fotos"
  on storage.objects for select
  using (
    bucket_id = 'luggage'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "luggage: usuario elimina sus fotos" on storage.objects;
create policy "luggage: usuario elimina sus fotos"
  on storage.objects for delete
  using (
    bucket_id = 'luggage'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "wallet_docs: usuario sube sus docs" on storage.objects;
create policy "wallet_docs: usuario sube sus docs"
  on storage.objects for insert
  with check (
    bucket_id = 'wallet_docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "wallet_docs: usuario lee sus docs" on storage.objects;
create policy "wallet_docs: usuario lee sus docs"
  on storage.objects for select
  using (
    bucket_id = 'wallet_docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "wallet_docs: usuario elimina sus docs" on storage.objects;
create policy "wallet_docs: usuario elimina sus docs"
  on storage.objects for delete
  using (
    bucket_id = 'wallet_docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars: cualquiera puede leer" on storage.objects;
create policy "avatars: cualquiera puede leer"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars: usuario sube su avatar" on storage.objects;
create policy "avatars: usuario sube su avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars: usuario actualiza su avatar" on storage.objects;
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
create index if not exists trips_user_status_idx
  on public.trips(user_id, trip_status);

create index if not exists packing_items_trip_checked_idx
  on public.packing_items(trip_id, checked);

create index if not exists payments_user_status_idx
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

-- ============================================================
-- GUÍA DE IMPLEMENTACIÓN — VIAZA Supabase
-- Estado: IMPLEMENTADO EN PRODUCCIÓN ✅ (12 de marzo de 2026)
-- ============================================================

-- PASO 1 — Proyecto Supabase
-- Ve a supabase.com, crea un nuevo proyecto y guarda:
--   Project URL  → VITE_SUPABASE_URL
--   anon public key → VITE_SUPABASE_ANON_KEY

-- PASO 2 — Ejecutar schema
-- En el SQL Editor de tu proyecto Supabase, pega y ejecuta
-- el contenido del schema completo (arriba).

-- PASO 3 — .env
--   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
--   VITE_SUPABASE_ANON_KEY=tu-anon-key

-- PASO 4 — Auth
--   Authentication > Providers:
--     - Email/Password: HABILITADO
--     - Google OAuth: opcional (requiere Google Cloud Console)
--     - Apple OAuth: opcional (requiere Apple Developer Account)
--   Authentication > Email Templates:
--     - Personalizar correos de confirmación con marca VIAZA

-- PASO 5 — Storage (se crean automáticamente con el schema)
--   Verificar que existan estos buckets en Storage:
--     - evidence  → privado  (fotos de evidencia de packing)
--     - luggage   → privado  (fotos de maleta)
--     - avatars   → público  (fotos de perfil)

-- PASO 6 — Stripe (pagos PRO)
--   1. Crear cuenta en stripe.com
--   2. Crear producto "VIAZA PRO" — precio $4.99 USD/año
--   3. Crear Edge Function en supabase/functions/stripe-webhook/
--   4. Configurar webhook de Stripe → Edge Function URL
--   5. El trigger on_payment_status_change actualiza plan automáticamente

-- ============================================================
-- DIAGRAMA DE TABLAS
-- ============================================================
--
--   auth.users (Supabase)
--       │
--       ▼
--   profiles ──────────────────────────────────────────────┐
--       │                                                   │
--       ├── trips ──────────────────────────────────────┐  │
--       │       │                                       │  │
--       │       ├── travelers                           │  │
--       │       ├── packing_items ── packing_evidence   │  │
--       │       ├── luggage_photos                      │  │
--       │       ├── trip_activities                     │  │
--       │       └── departure_reminders                 │  │
--       │                                               │  │
--       ├── split_bill_sessions ── split_bill_expenses  │  │
--       │                                               │  │
--       └── payments ───────────────────────────────────┘  │
--               │                                          │
--               └── (trigger) → actualiza plan en profiles ┘

-- ============================================================
-- NOTAS DE SEGURIDAD RLS
-- ============================================================
--
-- Todas las tablas tienen Row Level Security habilitado.
-- Las políticas garantizan que:
--
-- - Cada usuario solo puede leer, crear, actualizar y eliminar
--   sus propios datos.
--
-- - La tabla `payments` NO tiene política de INSERT para el cliente.
--   Los pagos solo los puede insertar el backend (Edge Function /
--   webhook de Stripe). Esto evita que alguien se otorgue el plan
--   PRO sin pagar.
--
-- - El trigger on_payment_status_change actualiza el perfil
--   automáticamente cuando un pago se completa o se reembolsa,
--   sin que el cliente pueda manipular este campo directamente.
--
-- - Los buckets de Storage usan la carpeta {user_id}/... para
--   aislar archivos por usuario.
--
-- ============================================================

-- ============================================================
-- 12. PLACES_CACHE (por usuario)
--     Cache privado de detalles Places para reducir costos.
-- ============================================================
create table if not exists public.places_cache (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  place_id        text        not null unique,
  name            text,
  address         text,
  lat             double precision,
  lon             double precision,
  rating          numeric,
  user_ratings_total integer,
  types           text[],
  photo_reference text,
  summary         text,
  raw_json        jsonb,
  fetched_at      timestamptz not null default now(),
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists places_cache_user_id_idx on public.places_cache(user_id);
create index if not exists places_cache_place_id_idx on public.places_cache(place_id);
create index if not exists places_cache_location_idx on public.places_cache(lat, lon);
create index if not exists places_cache_types_idx on public.places_cache using gin(types);

drop trigger if exists places_cache_updated_at on public.places_cache;
create trigger places_cache_updated_at
  before update on public.places_cache
  for each row execute procedure public.set_updated_at();

alter table public.places_cache enable row level security;

drop policy if exists "places_cache: usuario ve su cache" on public.places_cache;
create policy "places_cache: usuario ve su cache"
  on public.places_cache for select
  using (auth.uid() = user_id);

drop policy if exists "places_cache: usuario escribe su cache" on public.places_cache;
create policy "places_cache: usuario escribe su cache"
  on public.places_cache for insert
  with check (auth.uid() = user_id);

drop policy if exists "places_cache: usuario actualiza su cache" on public.places_cache;
create policy "places_cache: usuario actualiza su cache"
  on public.places_cache for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "places_cache: usuario elimina su cache" on public.places_cache;
create policy "places_cache: usuario elimina su cache"
  on public.places_cache for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 13. TRIP_PLACES (lugares guardados por viaje)
-- ============================================================
create table if not exists public.trip_places (
  id                uuid        primary key default uuid_generate_v4(),
  trip_id            uuid        not null references public.trips(id) on delete cascade,
  user_id            uuid        not null references public.profiles(id) on delete cascade,
  name               text        not null,
  address            text,
  lat                double precision not null,
  lon                double precision not null,
  category           text        not null default 'other',
  status             text        not null default 'want_to_go',
  google_place_id    text,
  photo_url          text,
  assigned_day_index int,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists trip_places_trip_id_idx on public.trip_places(trip_id);
create index if not exists trip_places_status_idx on public.trip_places(status);
create index if not exists trip_places_google_place_id_idx on public.trip_places(google_place_id);

drop trigger if exists trip_places_updated_at on public.trip_places;
create trigger trip_places_updated_at
  before update on public.trip_places
  for each row execute procedure public.set_updated_at();

alter table public.trip_places enable row level security;

drop policy if exists "trip_places: usuario ve los suyos" on public.trip_places;
create policy "trip_places: usuario ve los suyos"
  on public.trip_places for select
  using (auth.uid() = user_id);

drop policy if exists "trip_places: usuario crea lugares" on public.trip_places;
create policy "trip_places: usuario crea lugares"
  on public.trip_places for insert
  with check (auth.uid() = user_id);

drop policy if exists "trip_places: usuario actualiza lugares" on public.trip_places;
create policy "trip_places: usuario actualiza lugares"
  on public.trip_places for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trip_places: usuario elimina lugares" on public.trip_places;
create policy "trip_places: usuario elimina lugares"
  on public.trip_places for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 14. ITINERARY_EVENTS
-- ============================================================
create table if not exists public.itinerary_events (
  id                uuid        primary key default uuid_generate_v4(),
  trip_id            uuid        not null references public.trips(id) on delete cascade,
  user_id            uuid        not null references public.profiles(id) on delete cascade,
  day_index          int         not null default 0,
  sort_order         int         not null default 0,
  type               text        not null default 'activity',
  title              text        not null,
  description        text,
  start_time         text,
  end_time           text,
  place_id           uuid        references public.trip_places(id) on delete set null,
  confirmation_code  text,
  source             text        not null default 'manual',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists itinerary_events_trip_id_idx on public.itinerary_events(trip_id);
create index if not exists itinerary_events_day_idx on public.itinerary_events(trip_id, day_index);

drop trigger if exists itinerary_events_updated_at on public.itinerary_events;
create trigger itinerary_events_updated_at
  before update on public.itinerary_events
  for each row execute procedure public.set_updated_at();

alter table public.itinerary_events enable row level security;

drop policy if exists "itinerary_events: usuario ve los suyos" on public.itinerary_events;
create policy "itinerary_events: usuario ve los suyos"
  on public.itinerary_events for select
  using (auth.uid() = user_id);

drop policy if exists "itinerary_events: usuario crea eventos" on public.itinerary_events;
create policy "itinerary_events: usuario crea eventos"
  on public.itinerary_events for insert
  with check (auth.uid() = user_id);

drop policy if exists "itinerary_events: usuario actualiza eventos" on public.itinerary_events;
create policy "itinerary_events: usuario actualiza eventos"
  on public.itinerary_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "itinerary_events: usuario elimina eventos" on public.itinerary_events;
create policy "itinerary_events: usuario elimina eventos"
  on public.itinerary_events for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 15. AGENDA_ITEMS
-- ============================================================
create table if not exists public.agenda_items (
  id               uuid        primary key default uuid_generate_v4(),
  trip_id           uuid        not null references public.trips(id) on delete cascade,
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  title             text        not null,
  category          text        not null default 'custom',
  date              date        not null,
  time              text        not null default '09:00',
  recurrence        text        not null default 'none',
  notes             text,
  notification_id   int,
  completed         boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists agenda_items_trip_id_idx on public.agenda_items(trip_id);
create index if not exists agenda_items_date_idx on public.agenda_items(trip_id, date);

drop trigger if exists agenda_items_updated_at on public.agenda_items;
create trigger agenda_items_updated_at
  before update on public.agenda_items
  for each row execute procedure public.set_updated_at();

alter table public.agenda_items enable row level security;

drop policy if exists "agenda_items: usuario ve los suyos" on public.agenda_items;
create policy "agenda_items: usuario ve los suyos"
  on public.agenda_items for select
  using (auth.uid() = user_id);

drop policy if exists "agenda_items: usuario crea items" on public.agenda_items;
create policy "agenda_items: usuario crea items"
  on public.agenda_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "agenda_items: usuario actualiza items" on public.agenda_items;
create policy "agenda_items: usuario actualiza items"
  on public.agenda_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "agenda_items: usuario elimina items" on public.agenda_items;
create policy "agenda_items: usuario elimina items"
  on public.agenda_items for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 16. WALLET_DOCS
-- ============================================================
create table if not exists public.wallet_docs (
  id               uuid        primary key default uuid_generate_v4(),
  trip_id           uuid        not null references public.trips(id) on delete cascade,
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  doc_type          text        not null default 'document',
  file_name         text,
  mime_type         text,
  storage_path      text        not null,
  public_url        text,
  parsed_data       jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists wallet_docs_trip_id_idx on public.wallet_docs(trip_id);

drop trigger if exists wallet_docs_updated_at on public.wallet_docs;
create trigger wallet_docs_updated_at
  before update on public.wallet_docs
  for each row execute procedure public.set_updated_at();

alter table public.wallet_docs enable row level security;

drop policy if exists "wallet_docs: usuario ve los suyos" on public.wallet_docs;
create policy "wallet_docs: usuario ve los suyos"
  on public.wallet_docs for select
  using (auth.uid() = user_id);

drop policy if exists "wallet_docs: usuario crea docs" on public.wallet_docs;
create policy "wallet_docs: usuario crea docs"
  on public.wallet_docs for insert
  with check (auth.uid() = user_id);

drop policy if exists "wallet_docs: usuario actualiza docs" on public.wallet_docs;
create policy "wallet_docs: usuario actualiza docs"
  on public.wallet_docs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "wallet_docs: usuario elimina docs" on public.wallet_docs;
create policy "wallet_docs: usuario elimina docs"
  on public.wallet_docs for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 17. TRIP_RECOMMENDATIONS
-- ============================================================
do $$
declare
  v_relkind "char";
  has_trip_id boolean;
  has_user_id boolean;
  has_place_id boolean;
  has_category boolean;
  has_trip_place_duplicates boolean := false;
begin
  select c.relkind
    into v_relkind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'trip_recommendations'
  limit 1;

  -- Si existe como view/materialized view, la reemplazamos por tabla real.
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

  -- Asegurar columnas base antes de constraints.
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
  exception
    when others then
      raise notice 'trip_recommendations not-null warning: %', sqlerrm;
  end;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'trip_recommendations'
      and column_name = 'trip_id'
  ) into has_trip_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'trip_recommendations'
      and column_name = 'user_id'
  ) into has_user_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'trip_recommendations'
      and column_name = 'place_id'
  ) into has_place_id;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'trip_recommendations'
      and column_name = 'category'
  ) into has_category;

  execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_pkey';
  execute 'alter table public.trip_recommendations add constraint trip_recommendations_pkey primary key (id)';

  if has_trip_id then
    execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_trip_id_fkey';
    execute 'alter table public.trip_recommendations add constraint trip_recommendations_trip_id_fkey foreign key (trip_id) references public.trips(id) on delete cascade';
    execute 'create index if not exists trip_recommendations_trip_id_idx on public.trip_recommendations(trip_id)';
  end if;

  if has_user_id then
    execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_user_id_fkey';
    execute 'alter table public.trip_recommendations add constraint trip_recommendations_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade';
  end if;

  if has_trip_id and has_place_id then
    execute $sql$
      select exists (
        select 1
        from public.trip_recommendations
        where trip_id is not null and place_id is not null
        group by trip_id, place_id
        having count(*) > 1
      )
    $sql$
    into has_trip_place_duplicates;

    execute 'alter table public.trip_recommendations drop constraint if exists trip_recommendations_trip_place_unique';
    if not has_trip_place_duplicates then
      execute 'alter table public.trip_recommendations add constraint trip_recommendations_trip_place_unique unique (trip_id, place_id)';
    else
      raise notice 'trip_recommendations_trip_place_unique omitido por duplicados existentes';
    end if;
    execute 'create index if not exists trip_recommendations_place_id_idx on public.trip_recommendations(place_id)';
  end if;

  if has_category then
    execute 'create index if not exists trip_recommendations_category_idx on public.trip_recommendations(category)';
  end if;

  execute 'drop trigger if exists trip_recommendations_updated_at on public.trip_recommendations';
  execute 'create trigger trip_recommendations_updated_at before update on public.trip_recommendations for each row execute procedure public.set_updated_at()';

  execute 'alter table public.trip_recommendations enable row level security';

  if has_user_id then
    execute 'drop policy if exists "trip_recommendations: usuario ve los suyos" on public.trip_recommendations';
    execute 'create policy "trip_recommendations: usuario ve los suyos" on public.trip_recommendations for select using (auth.uid() = user_id)';
    execute 'drop policy if exists "trip_recommendations: usuario crea recomendaciones" on public.trip_recommendations';
    execute 'create policy "trip_recommendations: usuario crea recomendaciones" on public.trip_recommendations for insert with check (auth.uid() = user_id)';
    execute 'drop policy if exists "trip_recommendations: usuario actualiza recomendaciones" on public.trip_recommendations';
    execute 'create policy "trip_recommendations: usuario actualiza recomendaciones" on public.trip_recommendations for update using (auth.uid() = user_id) with check (auth.uid() = user_id)';
    execute 'drop policy if exists "trip_recommendations: usuario elimina recomendaciones" on public.trip_recommendations';
    execute 'create policy "trip_recommendations: usuario elimina recomendaciones" on public.trip_recommendations for delete using (auth.uid() = user_id)';
  end if;
exception
  when others then
    raise notice 'trip_recommendations compat warning: %', sqlerrm;
end $$;
