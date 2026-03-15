import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';
import { requirePremium } from '../_shared/premium.ts';

type Body = {
  origin: string;
  destination: string;
  language?: string;
  region?: string;
  departure_time?: number; // unix seconds
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
  type: 'walk' | 'transit';
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

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const premium = await requirePremium(req);
    if (premium instanceof Response) return premium;

    const { origin, destination, language = 'es', region, departure_time } = (await req.json()) as Body;
    if (!origin || !destination) return jsonResponse({ ok: false, error: 'origin and destination are required' }, { status: 400 });

    const key = requireEnv('GOOGLE_MAPS_API_KEY');

    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.set('origin', origin);
    url.searchParams.set('destination', destination);
    url.searchParams.set('mode', 'transit');
    url.searchParams.set('language', language);
    if (region) url.searchParams.set('region', region);
    if (departure_time) url.searchParams.set('departure_time', String(departure_time));
    url.searchParams.set('key', key);

    const res = await fetch(url);
    const json = await res.json() as {
      status?: string;
      error_message?: string;
      routes?: Array<{
        summary?: string;
        legs?: Array<{
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
    const leg = route?.legs?.[0];
    if (!route || !leg) return jsonResponse({ ok: false, error: 'No route found' }, { status: 404 });

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

      return { type: 'walk', instruction, distance_meters, duration_seconds };
    });

    return jsonResponse({
      ok: true,
      route: {
        summary: route.summary ?? null,
        distance_meters: leg.distance?.value ?? null,
        duration_seconds: leg.duration?.value ?? null,
        departure_time_text: leg.departure_time?.text ?? null,
        arrival_time_text: leg.arrival_time?.text ?? null,
        steps,
      },
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
