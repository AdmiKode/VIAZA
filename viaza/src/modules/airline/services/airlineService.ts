/**
 * airlineService.ts
 * Consulta AviationStack API para obtener info de vuelo en tiempo real.
 * Seguridad:
 * - No se consume Aviationstack desde frontend (cero API keys en cliente).
 * - El frontend llama a una Supabase Edge Function (`flight-info`).
 *
 * Nota: el backend debe tener `AVIATIONSTACK_API_KEY` configurada.
 */

import { supabase } from '../../../services/supabaseClient';

export interface FlightInfo {
  flightNumber: string;
  airline: string;
  status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'diverted' | 'unknown';
  departure: {
    airport: string;
    iata: string;
    terminal?: string;
    gate?: string;
    scheduledLocal: string; // ISO string
    estimatedLocal?: string;
    delayMinutes?: number;
  };
  arrival: {
    airport: string;
    iata: string;
    terminal?: string;
    gate?: string;
    scheduledLocal: string;
    estimatedLocal?: string;
    delayMinutes?: number;
  };
  aircraft?: string;
}

/** Cache en memoria: key = flightNumber, value = { data, fetchedAt } */
const _cache = new Map<string, { data: FlightInfo; fetchedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutos

/**
 * Busca info de un vuelo por número (ej: "AM401", "AA123").
 * Devuelve null si no hay key, el vuelo no existe, o la API falla.
 */
export async function fetchFlightInfo(
  flightNumber: string
): Promise<FlightInfo | null> {
  const cacheKey = flightNumber.toUpperCase();
  const cached = _cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const { data, error } = await supabase.functions.invoke('flight-info', {
      body: { flightNumber: cacheKey },
    });
    if (error) throw error;

    const info = (data as { result?: FlightInfo | null } | null)?.result ?? null;
    if (!info) return null;

    _cache.set(cacheKey, { data: info, fetchedAt: Date.now() });
    return info;
  } catch (err) {
    console.error('[airlineService] fetchFlightInfo failed:', err);
    return null;
  }
}

function normalizeStatus(raw: string): FlightInfo['status'] {
  const map: Record<string, FlightInfo['status']> = {
    scheduled: 'scheduled',
    active: 'active',
    landed: 'landed',
    cancelled: 'cancelled',
    diverted: 'diverted',
  };
  return map[raw?.toLowerCase()] ?? 'unknown';
}

/** Badge de color por status para UI */
export function flightStatusColor(status: FlightInfo['status']): string {
  switch (status) {
    case 'scheduled': return 'var(--viaza-secondary)';
    case 'active':    return 'var(--viaza-soft)';
    case 'landed':    return 'var(--viaza-primary)';
    case 'cancelled': return 'var(--viaza-accent)';
    case 'diverted':  return 'var(--viaza-accent)';
    default:          return 'rgb(var(--viaza-primary-rgb)/0.45)';
  }
}

/** Label localizado para status (español) */
export function flightStatusLabel(status: FlightInfo['status']): string {
  switch (status) {
    case 'scheduled': return 'Programado';
    case 'active':    return 'En vuelo';
    case 'landed':    return 'Aterrizó';
    case 'cancelled': return 'Cancelado';
    case 'diverted':  return 'Desviado';
    default:          return 'Desconocido';
  }
}
