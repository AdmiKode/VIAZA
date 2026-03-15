export type ItineraryEventType =
  | 'flight'
  | 'hotel'
  | 'activity'
  | 'place'
  | 'transport'
  | 'meal'
  | 'free';

export type PlaceCategory =
  | 'restaurant'
  | 'cafe'
  | 'museum'
  | 'hotel'
  | 'beach'
  | 'park'
  | 'shopping'
  | 'transport'
  | 'attraction'
  | 'other';

export type PlaceStatus = 'want_to_go' | 'booked' | 'visited';

export interface ItineraryEvent {
  id: string;
  tripId: string;
  /** 0 = día 1, 1 = día 2, etc. */
  dayIndex: number;
  /** posición dentro del día para ordenar */
  order: number;
  type: ItineraryEventType;
  title: string;
  description?: string;
  /** HH:MM */
  startTime?: string;
  endTime?: string;
  /** ref a SavedPlace.id */
  placeId?: string;
  confirmationCode?: string;
  source: 'manual' | 'imported' | 'suggestion';
  createdAt: string;
}

export interface SavedPlace {
  id: string;
  tripId: string;
  name: string;
  address?: string;
  lat: number;
  lon: number;
  category: PlaceCategory;
  googlePlaceId?: string;
  photo?: string;
  /** Día del viaje al que está asignado (0-based). null = sin asignar */
  assignedDayIndex?: number | null;
  notes?: string;
  status: PlaceStatus;
  createdAt: string;
}
