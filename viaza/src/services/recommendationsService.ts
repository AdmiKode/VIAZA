import { supabase } from './supabaseClient';

export type RecommendationCategory =
  | 'restaurant'
  | 'attraction'
  | 'museum'
  | 'park'
  | 'shopping'
  | 'cafe';

export type NearbyPlace = {
  place_id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  types: string[];
  photo_reference: string | null;
};

export async function fetchNearbyPlaces(params: {
  tripId: string;
  category: RecommendationCategory;
  radiusM?: number;
  language?: string;
  openNow?: boolean;
}): Promise<NearbyPlace[]> {
  const { tripId, category, radiusM, language, openNow } = params;
  const { data, error } = await supabase.functions.invoke('places-nearby', {
    body: {
      trip_id: tripId,
      category,
      radius_m: radiusM,
      language,
      open_now: openNow,
    },
  });
  if (error) throw error;
  return (data as { results?: NearbyPlace[] } | null)?.results ?? [];
}

