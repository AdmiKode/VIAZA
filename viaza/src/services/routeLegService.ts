// src/services/routeLegService.ts
//
// Servicio de ruteo entre eventos de itinerario.
// Conecta el itinerario diario con la edge function routes-transit (Google Directions).
//
// FLUJO:
//   getDayRoute(events, places) → llama routes-transit con origin + waypoints + destination
//   Cada evento se resuelve como coordenada (lat,lon) o dirección textual desde SavedPlace.
//
// CACHEO:
//   Cachea resultado en localStorage por hasta 6 horas (llave por tripId + dayIndex).
//   Así evitamos llamadas repetidas a Google Directions (cobrables).

import { supabase } from './supabaseClient';
import type { ItineraryEvent, SavedPlace } from '../types/itinerary';

// ─── Tipos de respuesta de routes-transit ───────────────────────────────────

export type TransitStep = {
  type: 'walk' | 'transit' | 'drive';
  instruction: string;
  distance_meters: number | null;
  duration_seconds: number | null;
  transit?: {
    line_name?: string | null;
    line_short_name?: string | null;
    vehicle_type?: string | null;
    headsign?: string | null;
    num_stops?: number | null;
    departure_stop?: string | null;
    arrival_stop?: string | null;
    departure_time_text?: string | null;
    arrival_time_text?: string | null;
  };
};

export type RouteLeg = {
  from: string | null;
  to: string | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  departure_time_text: string | null;
  arrival_time_text: string | null;
  steps: TransitStep[];
};

export type DayRouteResult = {
  legs: RouteLeg[];
  total_distance_meters: number;
  total_duration_seconds: number;
  mode: string;
  cached?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function eventToLocation(event: ItineraryEvent, places: SavedPlace[]): string | null {
  // Si el evento tiene placeId, buscar el SavedPlace con coordenadas reales
  if (event.placeId) {
    const place = places.find((p) => p.id === event.placeId);
    if (place) {
      if (place.lat && place.lon) return `${place.lat},${place.lon}`;
      if (place.address) return place.address;
      if (place.name) return place.name;
    }
  }
  // Fallback: título del evento como texto (Google Geocoding lo resolverá)
  return event.title || null;
}

function cacheKey(tripId: string, dayIndex: number, mode: string): string {
  return `viaza_route_${tripId}_day${dayIndex}_${mode}`;
}

function readCache(key: string): DayRouteResult | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as { data: DayRouteResult; ts: number };
    // Expiración: 6 horas
    if (Date.now() - ts > 6 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return { ...data, cached: true };
  } catch {
    return null;
  }
}

function writeCache(key: string, data: DayRouteResult): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage lleno — ignorar silenciosamente
  }
}

// ─── API principal ────────────────────────────────────────────────────────────

export type GetDayRouteOptions = {
  tripId: string;
  dayIndex: number;
  events: ItineraryEvent[];
  places: SavedPlace[];
  mode?: 'transit' | 'driving' | 'walking';
  language?: string;
  forceRefresh?: boolean;
};

/**
 * Calcula la ruta entre todos los eventos de un día del itinerario.
 * Retorna legs A→B, B→C, C→D, etc. con pasos, distancias y tiempos.
 *
 * @param options.events — Eventos del día, ya ordenados por `order`
 * @param options.places — SavedPlaces del viaje (para resolver coordenadas)
 * @param options.mode — Modo de transporte (default: 'transit')
 */
export async function getDayRoute({
  tripId,
  dayIndex,
  events,
  places,
  mode = 'transit',
  language = 'es',
  forceRefresh = false,
}: GetDayRouteOptions): Promise<DayRouteResult> {
  // Mínimo 2 eventos para calcular ruta
  const ordered = [...events].sort((a, b) => a.order - b.order);
  if (ordered.length < 2) {
    return { legs: [], total_distance_meters: 0, total_duration_seconds: 0, mode };
  }

  // Cache
  const key = cacheKey(tripId, dayIndex, mode);
  if (!forceRefresh) {
    const cached = readCache(key);
    if (cached) return cached;
  }

  // Resolver ubicaciones
  const locations = ordered.map((e) => eventToLocation(e, places)).filter(Boolean) as string[];
  if (locations.length < 2) {
    return { legs: [], total_distance_meters: 0, total_duration_seconds: 0, mode };
  }

  const origin = locations[0];
  const destination = locations[locations.length - 1];
  const waypoints = locations.slice(1, -1); // intermedios

  const { data, error } = await supabase.functions.invoke('routes-transit', {
    body: { origin, destination, waypoints, mode, language },
  });

  if (error) throw new Error(error.message ?? 'routes-transit error');

  const result = data as {
    ok: boolean;
    legs?: RouteLeg[];
    total_distance_meters?: number;
    total_duration_seconds?: number;
    mode?: string;
    error?: string;
  };

  if (!result.ok) throw new Error(result.error ?? 'routes-transit returned ok=false');

  const dayRoute: DayRouteResult = {
    legs: result.legs ?? [],
    total_distance_meters: result.total_distance_meters ?? 0,
    total_duration_seconds: result.total_duration_seconds ?? 0,
    mode: result.mode ?? mode,
  };

  writeCache(key, dayRoute);
  return dayRoute;
}

/**
 * Invalidar caché de un día específico (útil tras editar el itinerario).
 */
export function invalidateDayRouteCache(tripId: string, dayIndex: number, mode?: string): void {
  const modes = mode ? [mode] : ['transit', 'driving', 'walking'];
  modes.forEach((m) => {
    try { localStorage.removeItem(cacheKey(tripId, dayIndex, m)); } catch { /* noop */ }
  });
}

/**
 * Genera deep-link a Google Maps para un tramo específico.
 */
export function buildMapsDeepLink(from: string, to: string, mode: 'transit' | 'driving' | 'walking'): string {
  const modeMap: Record<string, string> = { transit: 'r', driving: 'd', walking: 'w' };
  const d = modeMap[mode] ?? 'r';
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=${d === 'r' ? 'transit' : d === 'd' ? 'driving' : 'walking'}`;
}

/**
 * Genera deep-link a Waze para un tramo.
 */
export function buildWazeDeepLink(to: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(to)}&navigate=yes`;
}

/**
 * Formatea duración en segundos → "1h 23min" / "45min"
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

/**
 * Formatea distancia en metros → "1.2 km" / "850 m"
 */
export function formatDistance(meters: number | null): string {
  if (!meters) return '—';
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}
