/**
 * tripsService.ts
 * CRUD de viajes contra la tabla `trips` de Supabase.
 * Se llama en background desde el store — si falla, el dato
 * queda en Zustand local y se reintenta en la próxima sesión.
 */

import { supabase } from './supabaseClient';
import type { Trip } from '../types/trip';

/** Mapea un Trip local al row de Supabase */
function tripToRow(trip: Trip, userId: string) {
  return {
    id: trip.id,
    user_id: userId,
    title: trip.title,
    destination: trip.destination,
    destination_place_id: trip.destinationPlaceId ?? null,
    destination_country: trip.destinationCountry ?? null,
    country_code: trip.countryCode ?? null,
    destination_timezone: trip.destinationTimezone ?? null,
    lat: trip.lat ?? null,
    lon: trip.lon ?? null,
    start_date: trip.startDate ?? null,
    end_date: trip.endDate ?? null,
    duration_days: trip.durationDays,
    travel_type: trip.travelType,
    climate: trip.climate,
    traveler_group: trip.travelerGroup,
    traveler_profile: trip.travelerProfile ?? 'balanced',
    travel_style: trip.travelStyle ?? 'standard',
    luggage_strategy: trip.luggageStrategy ?? null,
    active_modules: trip.activeModules ?? [],
    activities: trip.activities ?? [],
    laundry_mode: trip.laundryMode,
    packing_style: trip.packingStyle,
    transport_type: trip.transportType ?? null,
    origin_city: trip.originCity ?? null,
    origin_lat: trip.originLat ?? null,
    origin_lon: trip.originLon ?? null,
    flight_number: trip.flightNumber ?? null,
    airline: trip.airline ?? null,
    airport_code: trip.airportCode ?? null,
    bus_terminal: trip.busTerminal ?? null,
    train_station: trip.trainStation ?? null,
    cruise_port: trip.cruisePort ?? null,
    number_of_adults: trip.numberOfAdults ?? 1,
    number_of_kids: trip.numberOfKids ?? 0,
    number_of_babies: trip.numberOfBabies ?? 0,
    currency_code: trip.currencyCode ?? 'USD',
    language_code: trip.languageCode ?? 'en',
    trip_status: trip.tripStatus ?? 'planning',
    weather_forecast: trip.weatherForecast ?? null,
    weather_forecast_daily: trip.weatherForecastDaily ?? null,
  };
}

/** Insertar un viaje nuevo en Supabase */
export async function saveTrip(trip: Trip, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trips')
    .upsert(tripToRow(trip, userId), { onConflict: 'id' });

  if (error) {
    console.error('[tripsService] saveTrip error:', error.message);
  }
}

/** Actualizar campos de un viaje existente */
export async function updateTripRemote(
  tripId: string,
  patch: Partial<Trip>
): Promise<void> {
  // Convertir solo los campos que cambiaron
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.tripStatus !== undefined) row.trip_status = patch.tripStatus;
  if (patch.weatherForecast !== undefined) row.weather_forecast = patch.weatherForecast;
  if (patch.packingStyle !== undefined) row.packing_style = patch.packingStyle;
  if (patch.activities !== undefined) row.activities = patch.activities;

  if (Object.keys(row).length === 0) return;
  row.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('trips')
    .update(row)
    .eq('id', tripId);

  if (error) {
    console.error('[tripsService] updateTripRemote error:', error.message);
  }
}

/** Obtener todos los viajes del usuario desde Supabase */
export async function fetchTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[tripsService] fetchTrips error:', error.message);
    return [];
  }

  // Mapear row de Supabase → Trip local
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    destination: row.destination,
    destinationPlaceId: row.destination_place_id ?? undefined,
    destinationCountry: row.destination_country ?? undefined,
    countryCode: row.country_code,
    destinationTimezone: row.destination_timezone ?? undefined,
    lat: row.lat,
    lon: row.lon,
    startDate: row.start_date,
    endDate: row.end_date,
    durationDays: row.duration_days,
    travelType: row.travel_type,
    climate: row.climate,
    travelerGroup: row.traveler_group,
    travelerProfile: row.traveler_profile ?? undefined,
    travelStyle: row.travel_style ?? undefined,
    luggageStrategy: row.luggage_strategy ?? undefined,
    activeModules: row.active_modules ?? undefined,
    activities: row.activities ?? [],
    laundryMode: row.laundry_mode,
    packingStyle: row.packing_style,
    transportType: row.transport_type,
    originCity: row.origin_city,
    originLat: row.origin_lat,
    originLon: row.origin_lon,
    flightNumber: row.flight_number,
    airline: row.airline,
    airportCode: row.airport_code,
    busTerminal: row.bus_terminal,
    trainStation: row.train_station,
    cruisePort: row.cruise_port,
    numberOfAdults: row.number_of_adults,
    numberOfKids: row.number_of_kids,
    numberOfBabies: row.number_of_babies,
    currencyCode: row.currency_code,
    languageCode: row.language_code,
    tripStatus: row.trip_status,
    weatherForecast: row.weather_forecast,
    weatherForecastDaily: row.weather_forecast_daily ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
