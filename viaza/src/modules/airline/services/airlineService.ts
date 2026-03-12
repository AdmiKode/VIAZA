/**
 * airlineService.ts
 * Consulta AviationStack API para obtener info de vuelo en tiempo real.
 * Si VITE_AVIATIONSTACK_KEY está vacía, devuelve null y el UI usa datos
 * ingresados manualmente por el usuario en el onboarding.
 *
 * Docs: https://aviationstack.com/documentation
 */

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
  const key = import.meta.env.VITE_AVIATIONSTACK_KEY as string | undefined;

  if (!key) {
    console.info('[airlineService] VITE_AVIATIONSTACK_KEY no configurada — modo manual');
    return null;
  }

  const cacheKey = flightNumber.toUpperCase();
  const cached = _cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.aviationstack.com/v1/flights?access_key=${key}&flight_iata=${encodeURIComponent(cacheKey)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AviationStack ${res.status}`);
    const json = await res.json();

    if (json.error) {
      console.warn('[airlineService] API error:', json.error.message);
      return null;
    }

    const raw = json.data?.[0];
    if (!raw) return null;

    const info: FlightInfo = {
      flightNumber: raw.flight?.iata ?? flightNumber,
      airline: raw.airline?.name ?? '',
      status: normalizeStatus(raw.flight_status),
      departure: {
        airport: raw.departure?.airport ?? '',
        iata: raw.departure?.iata ?? '',
        terminal: raw.departure?.terminal ?? undefined,
        gate: raw.departure?.gate ?? undefined,
        scheduledLocal: raw.departure?.scheduled ?? '',
        estimatedLocal: raw.departure?.estimated ?? undefined,
        delayMinutes: raw.departure?.delay ?? undefined,
      },
      arrival: {
        airport: raw.arrival?.airport ?? '',
        iata: raw.arrival?.iata ?? '',
        terminal: raw.arrival?.terminal ?? undefined,
        gate: raw.arrival?.gate ?? undefined,
        scheduledLocal: raw.arrival?.scheduled ?? '',
        estimatedLocal: raw.arrival?.estimated ?? undefined,
        delayMinutes: raw.arrival?.delay ?? undefined,
      },
      aircraft: raw.aircraft?.registration ?? undefined,
    };

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
    case 'scheduled': return '#307082';
    case 'active':    return '#6CA3A2';
    case 'landed':    return '#12212E';
    case 'cancelled': return '#C0392B';
    case 'diverted':  return '#EA9940';
    default:          return '#999';
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
