/**
 * itinerarySharingService — generate / revoke share links for itineraries.
 */

import { supabase } from './supabaseClient';

export interface SharedItineraryEvent {
  id: string;
  dayIndex: number;
  order: number;
  type: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  confirmationCode?: string;
  source?: string;
}

export interface SharedItineraryData {
  trip: {
    id: string;
    title: string;
    destination: string;
    startDate?: string;
    endDate?: string;
    durationDays: number;
    travelType: string;
  };
  events: SharedItineraryEvent[];
}

// ─── Generate share link ──────────────────────────────────────────────────────

export async function generateShareLink(
  tripId: string
): Promise<{ token: string; url: string }> {
  const { data, error } = await supabase.functions.invoke('share-itinerary', {
    body: { tripId },
  });
  if (error) throw error;
  const res = data as { ok: boolean; token?: string; url?: string; error?: string };
  if (!res.ok) throw new Error(res.error ?? 'Error al generar enlace');
  return { token: res.token!, url: res.url! };
}

// ─── Revoke share link ────────────────────────────────────────────────────────

export async function revokeShareLink(tripId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('share-itinerary', {
    body: { tripId },
    method: 'DELETE',
  } as Parameters<typeof supabase.functions.invoke>[1]);
  if (error) throw error;
  const res = data as { ok: boolean; error?: string };
  if (!res.ok) throw new Error(res.error ?? 'Error al revocar enlace');
}

// ─── Fetch public itinerary by token ─────────────────────────────────────────

export async function fetchSharedItinerary(
  token: string
): Promise<SharedItineraryData> {
  const { data, error } = await supabase.functions.invoke(`share-itinerary/${token}`, {
    method: 'GET',
  } as Parameters<typeof supabase.functions.invoke>[1]);
  if (error) throw error;
  const res = data as { ok: boolean; trip?: SharedItineraryData['trip']; events?: SharedItineraryEvent[]; error?: string };
  if (!res.ok) throw new Error(res.error ?? 'Enlace no válido o expirado');
  return { trip: res.trip!, events: res.events ?? [] };
}
