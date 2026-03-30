import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requirePremium } from '../_shared/premium.ts';

type Category =
  | 'restaurant'
  | 'attraction'
  | 'museum'
  | 'park'
  | 'shopping'
  | 'cafe';

type Body = {
  trip_id: string;
  category?: Category;
  radius_m?: number;
  language?: string;
  open_now?: boolean;
};

function priceLevelMaxForProfile(profile: string | null): 0 | 1 | 2 | 3 | 4 {
  switch ((profile ?? 'balanced').toLowerCase()) {
    case 'economic': return 1;
    case 'balanced': return 2;
    case 'comfort': return 3;
    case 'premium': return 4;
    default: return 2;
  }
}

function mapCategoryToPlaceType(category: Category): string {
  switch (category) {
    case 'restaurant': return 'restaurant';
    case 'museum': return 'museum';
    case 'park': return 'park';
    case 'shopping': return 'shopping_mall';
    case 'cafe': return 'cafe';
    case 'attraction': return 'tourist_attraction';
  }
}

function mapCategoryToOsmTag(category: Category): { key: string; value: string } {
  switch (category) {
    case 'restaurant': return { key: 'amenity', value: 'restaurant' };
    case 'cafe': return { key: 'amenity', value: 'cafe' };
    case 'museum': return { key: 'tourism', value: 'museum' };
    case 'park': return { key: 'leisure', value: 'park' };
    case 'shopping': return { key: 'shop', value: 'mall' };
    case 'attraction': return { key: 'tourism', value: 'attraction' };
  }
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const { trip_id, category = 'attraction', radius_m = 2500, language = 'es', open_now } = (await req.json()) as Body;
    if (!trip_id) return jsonResponse({ ok: false, error: 'trip_id is required' }, { status: 400 });

    const premium = await requirePremium(req);
    if (premium instanceof Response) return premium;
    const { supabase } = premium;

    const { data: trip, error: tripErr } = await supabase
      .from('trips')
      .select('id,lat,lon,destination,traveler_profile')
      .eq('id', trip_id)
      .maybeSingle();

    if (tripErr) return jsonResponse({ ok: false, error: tripErr.message }, { status: 400 });
    if (!trip) return jsonResponse({ ok: false, error: 'Trip not found' }, { status: 404 });

    let tripLat: number | null = trip.lat ?? null;
    let tripLon: number | null = trip.lon ?? null;

    // Geocoding fallback: si el trip no tiene coordenadas, las obtenemos de Open-Meteo
    if ((!tripLat || !tripLon) && trip.destination) {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trip.destination)}&count=1&language=es&format=json`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json() as { results?: Array<{ latitude: number; longitude: number }> };
          if (geoData.results?.[0]) {
            tripLat = geoData.results[0].latitude;
            tripLon = geoData.results[0].longitude;
          }
        }
      } catch {
        // geocoding falló, continúa sin coords
      }
    }

    if (!tripLat || !tripLon) {
      return jsonResponse({ ok: false, error: 'No se encontraron coordenadas para este destino' }, { status: 400 });
    }

    const key =
      Deno.env.get('GOOGLE_MAPS_SERVER_API_KEY')
      ?? Deno.env.get('GOOGLE_MAPS_API_KEY');

    // Si hay Google Maps key, usamos la API oficial
    if (key) {
      const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      url.searchParams.set('key', key);
      url.searchParams.set('location', `${tripLat},${tripLon}`);
      url.searchParams.set('radius', String(Math.max(500, Math.min(20_000, radius_m))));
      url.searchParams.set('language', language);
      url.searchParams.set('type', mapCategoryToPlaceType(category));
      url.searchParams.set('maxprice', String(priceLevelMaxForProfile(trip.traveler_profile ?? null)));
      url.searchParams.set('minprice', '0');
      if (open_now) url.searchParams.set('opennow', 'true');

      const res = await fetch(url);
      const data = await res.json() as {
        status?: string;
        error_message?: string;
        results?: Array<{
          place_id: string;
          name: string;
          vicinity?: string;
          rating?: number;
          user_ratings_total?: number;
          price_level?: number;
          types?: string[];
          geometry?: { location?: { lat?: number; lng?: number } };
          photos?: Array<{ photo_reference?: string }>;
        }>;
      };

      if (!res.ok || (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS')) {
        return jsonResponse(
          { ok: false, error: data.error_message ?? `Places error (${data.status ?? res.status})` },
          { status: 400 }
        );
      }

      const results = (data.results ?? []).slice(0, 20).map((r) => ({
        place_id: r.place_id,
        name: r.name,
        address: r.vicinity ?? null,
        lat: r.geometry?.location?.lat ?? null,
        lon: r.geometry?.location?.lng ?? null,
        rating: r.rating ?? null,
        user_ratings_total: r.user_ratings_total ?? null,
        price_level: r.price_level ?? null,
        types: r.types ?? [],
        photo_reference: r.photos?.[0]?.photo_reference ?? null,
      }));

      return jsonResponse({ ok: true, results, source: 'google' });
    }

    // Fallback gratuito: Overpass API (OpenStreetMap) — no requiere API key
    const osmTag = mapCategoryToOsmTag(category);
    const radiusClamped = Math.max(500, Math.min(20_000, radius_m));
    const overpassQuery = `[out:json][timeout:10];
(
  node["${osmTag.key}"="${osmTag.value}"](around:${radiusClamped},${tripLat},${tripLon});
  way["${osmTag.key}"="${osmTag.value}"](around:${radiusClamped},${tripLat},${tripLon});
);
out center 20;`;

    const osmRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: overpassQuery,
    });

    if (!osmRes.ok) {
      return jsonResponse({ ok: false, error: 'No se pudieron obtener recomendaciones en este momento' }, { status: 503 });
    }

    const osmData = await osmRes.json() as {
      elements?: Array<{
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }>;
    };

    const results = (osmData.elements ?? []).slice(0, 20).map((el) => {
      const lat = el.lat ?? el.center?.lat ?? null;
      const lon = el.lon ?? el.center?.lon ?? null;
      return {
        place_id: `osm_${el.id}`,
        name: el.tags?.['name'] ?? el.tags?.['name:es'] ?? 'Lugar sin nombre',
        address: [el.tags?.['addr:street'], el.tags?.['addr:housenumber']].filter(Boolean).join(' ') || null,
        lat,
        lon,
        rating: null,
        user_ratings_total: null,
        price_level: null,
        types: [category],
        photo_reference: null,
      };
    }).filter((r) => r.name !== 'Lugar sin nombre' || r.lat != null);

    return jsonResponse({ ok: true, results, source: 'osm' });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
