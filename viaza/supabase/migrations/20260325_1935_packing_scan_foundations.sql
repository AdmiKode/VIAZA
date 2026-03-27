-- VIAZA: Packing scan foundations (Smart Packing / Maleta inteligente)
-- Date: 2026-03-25 19:35

-- ============================================================
-- 1) SUITCASE PROFILES
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

create trigger suitcase_profiles_updated_at
  before update on public.suitcase_profiles
  for each row execute procedure public.set_updated_at();

alter table public.suitcase_profiles enable row level security;

create policy "suitcase_profiles: usuario ve los suyos"
  on public.suitcase_profiles for select
  using (auth.uid() = user_id);

create policy "suitcase_profiles: usuario crea perfiles"
  on public.suitcase_profiles for insert
  with check (auth.uid() = user_id);

create policy "suitcase_profiles: usuario actualiza perfiles"
  on public.suitcase_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "suitcase_profiles: usuario elimina perfiles"
  on public.suitcase_profiles for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 2) PACKING SCAN SESSIONS
-- ============================================================
create table if not exists public.packing_scan_sessions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  trip_id           uuid not null references public.trips(id) on delete cascade,
  traveler_id       uuid references public.travelers(id) on delete set null,
  suitcase_profile_id uuid references public.suitcase_profiles(id) on delete set null,
  status            text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  confidence_avg    numeric(5,4),
  completion_pct    numeric(5,2),
  missing_count     int not null default 0,
  duplicate_count   int not null default 0,
  uncertain_count   int not null default 0,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists packing_scan_sessions_user_idx on public.packing_scan_sessions(user_id);
create index if not exists packing_scan_sessions_trip_idx on public.packing_scan_sessions(trip_id);
create index if not exists packing_scan_sessions_traveler_idx on public.packing_scan_sessions(traveler_id);
create index if not exists packing_scan_sessions_status_idx on public.packing_scan_sessions(status);

create trigger packing_scan_sessions_updated_at
  before update on public.packing_scan_sessions
  for each row execute procedure public.set_updated_at();

alter table public.packing_scan_sessions enable row level security;

create policy "packing_scan_sessions: usuario ve las suyas"
  on public.packing_scan_sessions for select
  using (auth.uid() = user_id);

create policy "packing_scan_sessions: usuario crea sesiones"
  on public.packing_scan_sessions for insert
  with check (auth.uid() = user_id);

create policy "packing_scan_sessions: usuario actualiza sesiones"
  on public.packing_scan_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "packing_scan_sessions: usuario elimina sesiones"
  on public.packing_scan_sessions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3) PACKING SCAN DETECTIONS
-- ============================================================
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

-- ============================================================
-- 4) SUITCASE LAYOUT PLANS
-- ============================================================
create table if not exists public.suitcase_layout_plans (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  trip_id           uuid not null references public.trips(id) on delete cascade,
  traveler_id       uuid references public.travelers(id) on delete set null,
  suitcase_profile_id uuid not null references public.suitcase_profiles(id) on delete cascade,
  strategy_version  text not null default 'v1',
  layout            jsonb not null,
  notes             text,
  generated_by      text not null default 'ai_orchestrator',
  status            text not null default 'draft' check (status in ('draft', 'approved', 'applied')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists suitcase_layout_plans_user_idx on public.suitcase_layout_plans(user_id);
create index if not exists suitcase_layout_plans_trip_idx on public.suitcase_layout_plans(trip_id);
create index if not exists suitcase_layout_plans_profile_idx on public.suitcase_layout_plans(suitcase_profile_id);
create index if not exists suitcase_layout_plans_status_idx on public.suitcase_layout_plans(status);

create trigger suitcase_layout_plans_updated_at
  before update on public.suitcase_layout_plans
  for each row execute procedure public.set_updated_at();

alter table public.suitcase_layout_plans enable row level security;

create policy "suitcase_layout_plans: usuario ve planes"
  on public.suitcase_layout_plans for select
  using (auth.uid() = user_id);

create policy "suitcase_layout_plans: usuario crea planes"
  on public.suitcase_layout_plans for insert
  with check (auth.uid() = user_id);

create policy "suitcase_layout_plans: usuario actualiza planes"
  on public.suitcase_layout_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "suitcase_layout_plans: usuario elimina planes"
  on public.suitcase_layout_plans for delete
  using (auth.uid() = user_id);
