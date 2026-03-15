import { supabase } from './supabaseClient';
import type { Traveler } from '../types/traveler';

function toRow(t: Traveler, userId: string) {
  return {
    id: t.id,
    trip_id: t.tripId,
    user_id: userId,
    name: t.name,
    role: t.role,
    sort_order: t.order,
  };
}

export async function saveTravelers(travelers: Traveler[]): Promise<void> {
  if (travelers.length === 0) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const rows = travelers.map((t) => toRow(t, user.id));

  const { error } = await supabase
    .from('travelers')
    .upsert(rows, { onConflict: 'id' });

  if (error) console.error('[travelersService] saveTravelers error:', error.message);
}

export async function upsertTraveler(traveler: Traveler): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from('travelers')
    .upsert(toRow(traveler, user.id), { onConflict: 'id' });
  if (error) console.error('[travelersService] upsertTraveler error:', error.message);
}

export async function deleteTravelerRemote(id: string): Promise<void> {
  const { error } = await supabase
    .from('travelers')
    .delete()
    .eq('id', id);
  if (error) console.error('[travelersService] deleteTravelerRemote error:', error.message);
}

export async function fetchTravelers(tripId: string): Promise<Traveler[]> {
  const { data, error } = await supabase
    .from('travelers')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[travelersService] fetchTravelers error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    name: row.name,
    role: row.role,
    order: row.sort_order ?? 0,
  }));
}
