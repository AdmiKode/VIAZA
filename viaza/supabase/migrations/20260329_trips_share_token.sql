-- Migration: add share_token columns to trips for itinerary sharing
-- Created: 2026-03-29

alter table public.trips
  add column if not exists share_token    text unique,
  add column if not exists share_enabled  boolean not null default false,
  add column if not exists share_updated_at timestamptz;

-- Index for quick lookup by token
create index if not exists trips_share_token_idx
  on public.trips (share_token)
  where share_token is not null;
