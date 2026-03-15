import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';
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
      .select('id,lat,lon,traveler_profile')
      .eq('id', trip_id)
      .maybeSingle();

    if (tripErr) return jsonResponse({ ok: false, error: tripErr.message }, { status: 400 });
    if (!trip || trip.lat == null || trip.lon == null) return jsonResponse({ ok: false, error: 'Trip missing lat/lon' }, { status: 400 });

    const key = requireEnv('GOOGLE_MAPS_API_KEY');
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('key', key);
    url.searchParams.set('location', `${trip.lat},${trip.lon}`);
    url.searchParams.set('radius', String(Math.max(500, Math.min(20_000, radius_m))));
    url.searchParams.set('language', language);
    url.searchParams.set('type', mapCategoryToPlaceType(category));

    // Presupuesto: limitar nivel de precio máximo según traveler_profile
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

    return jsonResponse({ ok: true, results });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
