import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';

type Body = { flightNumber: string };

function normalizeStatus(raw: string): 'scheduled' | 'active' | 'landed' | 'cancelled' | 'diverted' | 'unknown' {
  const map: Record<string, 'scheduled' | 'active' | 'landed' | 'cancelled' | 'diverted'> = {
    scheduled: 'scheduled',
    active: 'active',
    landed: 'landed',
    cancelled: 'cancelled',
    diverted: 'diverted',
  };
  return map[raw?.toLowerCase()] ?? 'unknown';
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const { flightNumber } = (await req.json()) as Body;
    if (!flightNumber) return jsonResponse({ ok: false, error: 'flightNumber is required' }, { status: 400 });

    const key = requireEnv('AVIATIONSTACK_API_KEY');
    const cacheKey = flightNumber.toUpperCase().replace(/\s+/g, '');

    const url = new URL('https://api.aviationstack.com/v1/flights');
    url.searchParams.set('access_key', key);
    url.searchParams.set('flight_iata', cacheKey);
    url.searchParams.set('limit', '1');

    const res = await fetch(url);
    if (!res.ok) return jsonResponse({ ok: false, error: `Aviationstack ${res.status}` }, { status: 502 });
    const json = await res.json() as { data?: any[]; error?: { message?: string } };
    if (json.error) return jsonResponse({ ok: false, error: json.error.message ?? 'Aviationstack error' }, { status: 400 });

    const raw = json.data?.[0];
    if (!raw) return jsonResponse({ ok: true, result: null });

    const info = {
      flightNumber: raw.flight?.iata ?? cacheKey,
      airline: raw.airline?.name ?? '',
      status: normalizeStatus(raw.flight_status),
      departure: {
        airport: raw.departure?.airport ?? '',
        iata: raw.departure?.iata ?? '',
        terminal: raw.departure?.terminal ?? null,
        gate: raw.departure?.gate ?? null,
        scheduledLocal: raw.departure?.scheduled ?? '',
        estimatedLocal: raw.departure?.estimated ?? null,
        delayMinutes: raw.departure?.delay ?? null,
      },
      arrival: {
        airport: raw.arrival?.airport ?? '',
        iata: raw.arrival?.iata ?? '',
        terminal: raw.arrival?.terminal ?? null,
        gate: raw.arrival?.gate ?? null,
        scheduledLocal: raw.arrival?.scheduled ?? '',
        estimatedLocal: raw.arrival?.estimated ?? null,
        delayMinutes: raw.arrival?.delay ?? null,
      },
      aircraft: raw.aircraft?.registration ?? null,
    };

    return jsonResponse({ ok: true, result: info });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});

