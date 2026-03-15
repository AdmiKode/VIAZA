// @ts-ignore deno url
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';

type Body = {
  place_id: string;
  language?: string;
};

async function fetchCountryMeta(countryCode: string): Promise<{ currency: string | null; language: string | null; countryName: string | null }> {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(countryCode)}`);
    if (!res.ok) return { currency: null, language: null, countryName: null };
    const json = await res.json() as Array<{
      name?: { common?: string };
      currencies?: Record<string, unknown>;
      languages?: Record<string, string>;
    }>;
    const row = json?.[0];
    const currency = row?.currencies ? Object.keys(row.currencies)[0] ?? null : null;
    const language = row?.languages ? Object.keys(row.languages)[0] ?? null : null;
    const countryName = row?.name?.common ?? null;
    return { currency, language, countryName };
  } catch {
    return { currency: null, language: null, countryName: null };
  }
}

async function fetchTimezone(params: { lat: number; lon: number; key: string }): Promise<string | null> {
  const { lat, lon, key } = params;
  const url = new URL('https://maps.googleapis.com/maps/api/timezone/json');
  url.searchParams.set('location', `${lat},${lon}`);
  url.searchParams.set('timestamp', String(Math.floor(Date.now() / 1000)));
  url.searchParams.set('key', key);
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json() as { status?: string; timeZoneId?: string; errorMessage?: string };
  if (json.status !== 'OK') return null;
  return json.timeZoneId ?? null;
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const { place_id, language = 'es' } = (await req.json()) as Body;
    if (!place_id) return jsonResponse({ ok: false, error: 'place_id is required' }, { status: 400 });

    const key = requireEnv('GOOGLE_MAPS_SERVER_API_KEY');

    // Places API New — GET /v1/places/{place_id}
    const detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(place_id)}?languageCode=${language}`,
      {
        headers: {
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,addressComponents',
        },
      }
    );
    const detailsJson = await detailsRes.json() as {
      error?: { message?: string };
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
      addressComponents?: Array<{ shortText?: string; longText?: string; types?: string[] }>;
    };

    if (!detailsRes.ok || detailsJson.error) {
      return jsonResponse({ ok: false, error: detailsJson.error?.message ?? `Places error (${detailsRes.status})` }, { status: 400 });
    }

    const lat = detailsJson.location?.latitude ?? null;
    const lon = detailsJson.location?.longitude ?? null;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return jsonResponse({ ok: false, error: 'Missing geometry' }, { status: 400 });
    }

    const countryComp = detailsJson.addressComponents?.find((c) => c.types?.includes('country'));
    const countryCode = countryComp?.shortText ?? null;
    const countryNameFromPlaces = countryComp?.longText ?? null;

    const timezone = await fetchTimezone({ lat, lon, key });

    const countryMeta = countryCode ? await fetchCountryMeta(countryCode) : { currency: null, language: null, countryName: null };
    const currency = countryMeta.currency;
    const destinationLanguage = countryMeta.language;
    const countryName = countryMeta.countryName ?? countryNameFromPlaces;

    return jsonResponse({
      ok: true,
      destination: {
        destination_place_id: detailsJson.id ?? place_id,
        destination_name: detailsJson.displayName?.text ?? detailsJson.formattedAddress ?? '',
        destination_country: countryName,
        destination_country_code: countryCode,
        destination_timezone: timezone,
        destination_currency: currency,
        destination_language: destinationLanguage,
        lat,
        lon,
      },
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
