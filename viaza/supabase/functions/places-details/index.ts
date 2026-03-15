import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';
import { requireAuth } from '../_shared/premium.ts';

type Body = {
  place_id: string;
  language?: string;
};

function pickCountryCode(components: Array<{ short_name: string; types: string[] }>): string | null {
  const country = components.find((c) => c.types.includes('country'));
  return country?.short_name ?? null;
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const authed = await requireAuth(req);
    if (authed instanceof Response) return authed;

    const { place_id, language = 'es' } = (await req.json()) as Body;
    if (!place_id) return jsonResponse({ ok: false, error: 'place_id is required' }, { status: 400 });

    const key = requireEnv('GOOGLE_MAPS_API_KEY');
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', place_id);
    url.searchParams.set('key', key);
    url.searchParams.set('language', language);
    url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,address_component');

    const res = await fetch(url);
    const data = await res.json() as {
      status?: string;
      error_message?: string;
      result?: {
        place_id: string;
        name: string;
        formatted_address?: string;
        geometry?: { location?: { lat?: number; lng?: number } };
        address_components?: Array<{ short_name: string; long_name: string; types: string[] }>;
      };
    };

    if (!res.ok || (data.status && data.status !== 'OK')) {
      return jsonResponse(
        { ok: false, error: data.error_message ?? `Places error (${data.status ?? res.status})` },
        { status: 400 }
      );
    }

    const result = data.result;
    if (!result) return jsonResponse({ ok: false, error: 'No result' }, { status: 404 });

    const lat = result.geometry?.location?.lat ?? null;
    const lon = result.geometry?.location?.lng ?? null;
    const country_code = result.address_components ? pickCountryCode(result.address_components) : null;

    return jsonResponse({
      ok: true,
      place: {
        place_id: result.place_id,
        name: result.name,
        formatted_address: result.formatted_address ?? null,
        lat,
        lon,
        country_code,
      },
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
