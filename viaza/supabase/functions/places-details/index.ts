import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/premium.ts';

type Body = {
  place_id: string;
  language?: string;
};

function pickCountryCode(components: Array<{ short_name: string; types: string[] }>): string | null {
  const country = components.find((c) => c.types.includes('country'));
  return country?.short_name ?? null;
}

type OpenMeteoGet = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
};

function isOpenMeteoPlaceId(placeId: string) {
  return placeId.startsWith('om:');
}

function openMeteoIdFromPlaceId(placeId: string): number | null {
  const raw = placeId.replace(/^om:/, '');
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function formatOpenMeteoAddress(p: OpenMeteoGet): string {
  const parts = [p.name, p.admin1, p.country].filter(Boolean);
  return parts.join(' · ');
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const authed = await requireAuth(req);
    if (authed instanceof Response) return authed;

    const { place_id, language = 'es' } = (await req.json()) as Body;
    if (!place_id) return jsonResponse({ ok: false, error: 'place_id is required' }, { status: 400 });

    const googleKey =
      Deno.env.get('GOOGLE_MAPS_SERVER_API_KEY')
      ?? Deno.env.get('GOOGLE_MAPS_API_KEY');

    // Fallback: Open‑Meteo place ids (`om:<id>`) when Google key isn't configured.
    if (!googleKey || isOpenMeteoPlaceId(place_id)) {
      const id = openMeteoIdFromPlaceId(place_id);
      if (!id) return jsonResponse({ ok: false, error: 'Invalid place_id' }, { status: 400 });

      const url = new URL('https://geocoding-api.open-meteo.com/v1/get');
      url.searchParams.set('id', String(id));

      const res = await fetch(url);
      if (!res.ok) return jsonResponse({ ok: false, error: `Geocoding error (${res.status})` }, { status: 502 });
      const p = (await res.json()) as OpenMeteoGet;

      return jsonResponse({
        ok: true,
        place: {
          place_id,
          name: p.name,
          formatted_address: formatOpenMeteoAddress(p),
          lat: p.latitude,
          lon: p.longitude,
          country_code: p.country_code ?? null,
          timezone: p.timezone ?? null,
        },
      });
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', place_id);
    url.searchParams.set('key', googleKey);
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
