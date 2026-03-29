/**
 * flightAlertsService — subscribe / unsubscribe flight watches, trigger poll.
 */

import { supabase } from './supabaseClient';

export interface FlightWatch {
  id: string;
  flightNumber: string;
  flightDate: string;
  active: boolean;
  lastSnapshot: Record<string, unknown>;
  lastCheckedAt: string | null;
  tripId: string | null;
}

export interface FlightSnapshot {
  status: string;
  dep_delay_min: number | null;
  arr_delay_min: number | null;
  dep_gate: string | null;
  arr_gate: string | null;
  dep_terminal: string | null;
  arr_terminal: string | null;
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

export async function subscribeFlightAlert(params: {
  flightNumber: string;
  flightDate: string;   // YYYY-MM-DD
  tripId?: string;
}): Promise<{ watchId: string; snapshot: FlightSnapshot | null; already?: boolean }> {
  const { data, error } = await supabase.functions.invoke('flight-alerts', {
    body: {
      flightNumber: params.flightNumber,
      flightDate: params.flightDate,
      tripId: params.tripId,
    },
  });
  if (error) throw error;
  const res = data as { ok: boolean; watchId?: string; snapshot?: FlightSnapshot; already?: boolean; error?: string };
  if (!res.ok) throw new Error(res.error ?? 'Error al suscribir vuelo');
  return { watchId: res.watchId!, snapshot: res.snapshot ?? null, already: res.already };
}

// ─── Unsubscribe ──────────────────────────────────────────────────────────────

export async function unsubscribeFlightAlert(watchId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('flight-alerts', {
    body: { watchId },
    method: 'DELETE',
  } as Parameters<typeof supabase.functions.invoke>[1]);
  if (error) throw error;
  const res = data as { ok: boolean; error?: string };
  if (!res.ok) throw new Error(res.error ?? 'Error al desuscribir vuelo');
}

// ─── List user watches ────────────────────────────────────────────────────────

export async function getMyFlightWatches(tripId?: string): Promise<FlightWatch[]> {
  let query = supabase
    .from('flight_watches')
    .select('id, flight_number, flight_date, active, last_snapshot, last_checked_at, trip_id')
    .eq('active', true)
    .order('flight_date', { ascending: true });

  if (tripId) query = query.eq('trip_id', tripId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    flightNumber: row.flight_number,
    flightDate: row.flight_date,
    active: row.active,
    lastSnapshot: row.last_snapshot ?? {},
    lastCheckedAt: row.last_checked_at ?? null,
    tripId: row.trip_id ?? null,
  }));
}

// ─── Format snapshot for UI ───────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  active: 'En vuelo',
  landed: 'Aterrizó',
  cancelled: 'Cancelado',
  diverted: 'Desviado',
  unknown: 'Desconocido',
};

export function formatFlightStatus(snapshot: FlightSnapshot): string {
  return STATUS_LABELS[snapshot.status] ?? snapshot.status;
}

export function getFlightStatusColor(snapshot: FlightSnapshot): string {
  switch (snapshot.status) {
    case 'cancelled': return '#12212E';
    case 'diverted':  return '#EA9940';
    case 'active':    return '#307082';
    case 'landed':    return '#6CA3A2';
    default:
      if ((snapshot.dep_delay_min ?? 0) >= 60) return '#EA9940';
      if ((snapshot.dep_delay_min ?? 0) >= 15) return '#EA9940';
      return '#12212E';
  }
}
