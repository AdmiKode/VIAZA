-- Migration: flight_watches table for flight alert subscriptions
-- Created: 2026-03-29

create table if not exists public.flight_watches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  trip_id       uuid references public.trips(id) on delete set null,
  flight_number text not null,          -- e.g. "AM123"
  flight_date   date not null,          -- YYYY-MM-DD
  last_snapshot jsonb not null default '{}',  -- FlightSnapshot JSON
  last_checked_at timestamptz,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Index for polling active watches by date
create index if not exists flight_watches_active_date_idx
  on public.flight_watches (flight_date, active)
  where active = true;

-- Prevent duplicate watches per user
create unique index if not exists flight_watches_unique_user_flight
  on public.flight_watches (user_id, flight_number, flight_date);

-- RLS
alter table public.flight_watches enable row level security;

-- Users can manage their own watches
drop policy if exists "Users manage own flight watches" on public.flight_watches;
create policy "Users manage own flight watches"
  on public.flight_watches
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
