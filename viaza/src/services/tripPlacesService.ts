import { supabase } from './supabaseClient';
import type { SavedPlace } from '../types/itinerary';

function toRow(place: SavedPlace, userId: string) {
  return {
    id: place.id,
    trip_id: place.tripId,
    user_id: userId,
    name: place.name,
    address: place.address ?? null,
    lat: place.lat,
    lon: place.lon,
    category: place.category,
    status: place.status,
    google_place_id: place.googlePlaceId ?? null,
    photo_url: place.photo ?? null,
    assigned_day_index: place.assignedDayIndex ?? null,
    notes: place.notes ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertTripPlace(place: SavedPlace): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('trip_places')
    .upsert(toRow(place, user.id), { onConflict: 'id' });

  if (error) console.error('[tripPlacesService] upsertTripPlace error:', error.message);
}

export async function deleteTripPlaceRemote(id: string): Promise<void> {
  const { error } = await supabase
    .from('trip_places')
    .delete()
    .eq('id', id);
  if (error) console.error('[tripPlacesService] deleteTripPlaceRemote error:', error.message);
}

export async function fetchTripPlaces(tripId: string): Promise<SavedPlace[]> {
  const { data, error } = await supabase
    .from('trip_places')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[tripPlacesService] fetchTripPlaces error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    name: row.name,
    address: row.address ?? undefined,
    lat: row.lat,
    lon: row.lon,
    category: row.category,
    status: row.status,
    googlePlaceId: row.google_place_id ?? undefined,
    photo: row.photo_url ?? undefined,
    assignedDayIndex: row.assigned_day_index ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }));
}

