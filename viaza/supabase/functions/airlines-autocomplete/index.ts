import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';
import { requireAuth } from '../_shared/premium.ts';

type Body = { query: string };

type AviationstackAirline = {
  airline_name?: string;
  iata_code?: string;
  icao_code?: string;
};

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const authed = await requireAuth(req);
    if (authed instanceof Response) return authed;

    const { query } = (await req.json()) as Body;
    const q = String(query ?? '').trim();
    if (q.length < 2) return jsonResponse({ ok: true, airlines: [] });

    const key = requireEnv('AVIATIONSTACK_API_KEY');

    const url = new URL('https://api.aviationstack.com/v1/airlines');
    url.searchParams.set('access_key', key);
    url.searchParams.set('airline_name', q);
    url.searchParams.set('limit', '6');

    const res = await fetch(url.toString());
    if (!res.ok) return jsonResponse({ ok: false, error: `Aviationstack ${res.status}` }, { status: 502 });

    const json = (await res.json()) as { data?: AviationstackAirline[]; error?: { message?: string } };
    if (json.error) return jsonResponse({ ok: false, error: json.error.message ?? 'Aviationstack error' }, { status: 400 });

    const airlines = (json.data ?? [])
      .filter((a) => a.airline_name && a.iata_code)
      .map((a) => ({ name: a.airline_name!, iata: a.iata_code!, icao: a.icao_code ?? null }));

    return jsonResponse({ ok: true, airlines });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});

