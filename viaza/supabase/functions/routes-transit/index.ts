import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/premium.ts';

type Body = {
  origin: string;
  destination: string;
  waypoints?: string[];           // ← NUEVO: paradas intermedias (máx 8 en plan estándar)
  mode?: 'transit' | 'driving' | 'walking';  // ← NUEVO: modo de transporte
  language?: string;
  region?: string;
  departure_time?: number;        // unix seconds
};

function stripHtml(input: string) {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

type TransitStep = {
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

type RouteLeg = {
  from: string | null;
  to: string | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  departure_time_text: string | null;
  arrival_time_text: string | null;
  steps: TransitStep[];
};

function parseLeg(leg: {
  start_address?: string;
  end_address?: string;
  distance?: { value?: number };
  duration?: { value?: number };
  departure_time?: { text?: string };
  arrival_time?: { text?: string };
  steps?: Array<{
    travel_mode?: string;
    html_instructions?: string;
    distance?: { value?: number };
    duration?: { value?: number };
    transit_details?: {
      headsign?: string;
      num_stops?: number;
      departure_stop?: { name?: string };
      arrival_stop?: { name?: string };
      departure_time?: { text?: string };
      arrival_time?: { text?: string };
      line?: {
        name?: string;
        short_name?: string;
        vehicle?: { type?: string; name?: string };
      };
    };
  }>;
}): RouteLeg {
  const steps: TransitStep[] = (leg.steps ?? []).map((s) => {
    const mode = (s.travel_mode ?? '').toLowerCase();
    const instruction = stripHtml(s.html_instructions ?? '');
    const distance_meters = s.distance?.value ?? null;
    const duration_seconds = s.duration?.value ?? null;

    if (mode === 'transit' && s.transit_details) {
      const td = s.transit_details;
      return {
        type: 'transit',
        instruction,
        distance_meters,
        duration_seconds,
        transit: {
          line_name: td.line?.name ?? null,
          line_short_name: td.line?.short_name ?? null,
          vehicle_type: td.line?.vehicle?.type ?? td.line?.vehicle?.name ?? null,
          headsign: td.headsign ?? null,
          num_stops: td.num_stops ?? null,
          departure_stop: td.departure_stop?.name ?? null,
          arrival_stop: td.arrival_stop?.name ?? null,
          departure_time_text: td.departure_time?.text ?? null,
          arrival_time_text: td.arrival_time?.text ?? null,
        },
      };
    }

    if (mode === 'driving') {
      return { type: 'drive', instruction, distance_meters, duration_seconds };
    }

    return { type: 'walk', instruction, distance_meters, duration_seconds };
  });

  return {
    from: leg.start_address ?? null,
    to: leg.end_address ?? null,
    distance_meters: leg.distance?.value ?? null,
    duration_seconds: leg.duration?.value ?? null,
    departure_time_text: leg.departure_time?.text ?? null,
    arrival_time_text: leg.arrival_time?.text ?? null,
    steps,
  };
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const authed = await requireAuth(req);
    if (authed instanceof Response) return authed;

    const {
      origin,
      destination,
      waypoints = [],
      mode = 'transit',
      language = 'es',
      region,
      departure_time,
    } = (await req.json()) as Body;

    if (!origin || !destination) {
      return jsonResponse({ ok: false, error: 'origin and destination are required' }, { status: 400 });
    }

    const key =
      Deno.env.get('GOOGLE_MAPS_SERVER_API_KEY')
      ?? Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!key) {
      return jsonResponse({ ok: false, error: 'Missing GOOGLE_MAPS_SERVER_API_KEY / GOOGLE_MAPS_API_KEY' }, { status: 500 });
    }

    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.set('origin', origin);
    url.searchParams.set('destination', destination);
    url.searchParams.set('mode', mode);
    url.searchParams.set('language', language);
    if (region) url.searchParams.set('region', region);
    if (departure_time) url.searchParams.set('departure_time', String(departure_time));
    // Waypoints: Google acepta hasta 8 paradas intermedias en plan estándar
    if (waypoints.length > 0) {
      url.searchParams.set('waypoints', waypoints.slice(0, 8).join('|'));
    }
    url.searchParams.set('key', key);

    const res = await fetch(url);
    const json = await res.json() as {
      status?: string;
      error_message?: string;
      routes?: Array<{
        summary?: string;
        legs?: Array<{
          start_address?: string;
          end_address?: string;
          distance?: { value?: number; text?: string };
          duration?: { value?: number; text?: string };
          departure_time?: { value?: number; text?: string };
          arrival_time?: { value?: number; text?: string };
          steps?: Array<{
            travel_mode?: string;
            html_instructions?: string;
            distance?: { value?: number; text?: string };
            duration?: { value?: number; text?: string };
            transit_details?: {
              headsign?: string;
              num_stops?: number;
              departure_stop?: { name?: string };
              arrival_stop?: { name?: string };
              departure_time?: { text?: string };
              arrival_time?: { text?: string };
              line?: {
                name?: string;
                short_name?: string;
                vehicle?: { type?: string; name?: string };
              };
            };
          }>;
        }>;
      }>;
    };

    if (!res.ok || (json.status && json.status !== 'OK')) {
      return jsonResponse(
        { ok: false, error: json.error_message ?? `Directions error (${json.status ?? res.status})` },
        { status: 400 }
      );
    }

    const route = json.routes?.[0];
    if (!route || !route.legs?.length) {
      return jsonResponse({ ok: false, error: 'No route found' }, { status: 404 });
    }

    // Parsear todos los legs (uno por waypoint + destino final)
    const legs: RouteLeg[] = route.legs.map(parseLeg);

    // Totales acumulados
    const totalDistanceMeters = legs.reduce((acc, l) => acc + (l.distance_meters ?? 0), 0);
    const totalDurationSeconds = legs.reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0);

    // Retrocompatibilidad: si solo hay 1 leg, exponer también el formato anterior
    const singleLeg = legs.length === 1 ? legs[0] : null;

    return jsonResponse({
      ok: true,
      mode,
      legs,
      total_distance_meters: totalDistanceMeters,
      total_duration_seconds: totalDurationSeconds,
      // backwards compat para código que usa route.steps / route.distance_meters directamente
      route: singleLeg
        ? {
            summary: route.summary ?? null,
            distance_meters: singleLeg.distance_meters,
            duration_seconds: singleLeg.duration_seconds,
            departure_time_text: singleLeg.departure_time_text,
            arrival_time_text: singleLeg.arrival_time_text,
            steps: singleLeg.steps,
          }
        : null,
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
