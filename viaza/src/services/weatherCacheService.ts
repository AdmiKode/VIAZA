import { supabase } from './supabaseClient';
import type { WeatherForecastDailyEntry } from '../types/trip';

export async function fetchWeatherCache(params: {
  tripId: string;
  lat: number;
  lon: number;
  startDate: string;
  endDate: string;
  timezone?: string;
}): Promise<WeatherForecastDailyEntry[]> {
  const { tripId, lat, lon, startDate, endDate, timezone } = params;
  const { data, error } = await supabase.functions.invoke('weather-cache', {
    body: {
      trip_id: tripId,
      lat,
      lon,
      start_date: startDate,
      end_date: endDate,
      timezone,
    },
  });
  if (error) throw error;
  const forecast = (data as { forecast_daily?: WeatherForecastDailyEntry[] } | null)?.forecast_daily ?? [];
  return forecast;
}

