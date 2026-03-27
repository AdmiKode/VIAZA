-- Trip risk zones baseline (TravelRiskAPI)
-- Fecha: 2026-03-26

alter table if exists public.trips
  add column if not exists risk_level text;

alter table if exists public.trips
  add column if not exists risk_summary jsonb;

alter table if exists public.trips
  add column if not exists risk_updated_at timestamptz;

create index if not exists trips_risk_level_idx on public.trips(risk_level);
