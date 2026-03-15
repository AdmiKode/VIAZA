import { supabase } from './supabaseClient';
import type { ItineraryEvent } from '../types/itinerary';

function toRow(event: ItineraryEvent, userId: string) {
  return {
    id: event.id,
    trip_id: event.tripId,
    user_id: userId,
    day_index: event.dayIndex,
    sort_order: event.order,
    type: event.type,
    title: event.title,
    description: event.description ?? null,
    start_time: event.startTime ?? null,
    end_time: event.endTime ?? null,
    confirmation_code: event.confirmationCode ?? null,
    source: event.source,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertItineraryEvent(event: ItineraryEvent): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('itinerary_events')
    .upsert(toRow(event, user.id), { onConflict: 'id' });

  if (error) console.error('[itineraryService] upsertItineraryEvent error:', error.message);
}

export async function deleteItineraryEventRemote(id: string): Promise<void> {
  const { error } = await supabase
    .from('itinerary_events')
    .delete()
    .eq('id', id);
  if (error) console.error('[itineraryService] deleteItineraryEventRemote error:', error.message);
}

export async function fetchItineraryEvents(tripId: string): Promise<ItineraryEvent[]> {
  const { data, error } = await supabase
    .from('itinerary_events')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_index', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[itineraryService] fetchItineraryEvents error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    dayIndex: row.day_index ?? 0,
    order: row.sort_order ?? 0,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    confirmationCode: row.confirmation_code ?? undefined,
    source: row.source,
    createdAt: row.created_at,
  }));
}

