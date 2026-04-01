import { supabase } from './supabaseClient';
import type { WeatherForecastDailyEntry } from '../types/trip';

type SegmentAccumulator = { t: number[]; r: number[] };

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function max(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function clampDateRange(params: { start: string; end: string }) {
  const today = new Date();
  const maxForecast = new Date(today.getTime() + 16 * 86400000);

  const start = new Date(`${params.start}T12:00:00`);
  const end = new Date(`${params.end}T12:00:00`);
  const validStart = Number.isFinite(start.getTime()) ? start : today;
  const validEnd = Number.isFinite(end.getTime()) ? end : new Date(today.getTime() + 7 * 86400000);

  const clampedStart = validStart > maxForecast ? today : validStart;
  const clampedEndRaw = validEnd > maxForecast ? maxForecast : validEnd;
  const clampedEnd = clampedEndRaw < clampedStart ? clampedStart : clampedEndRaw;

  return { start: isoDate(clampedStart), end: isoDate(clampedEnd) };
}

async function fetchWeatherDirect(params: {
  lat: number;
  lon: number;
  startDate: string;
  endDate: string;
  timezone?: string;
}): Promise<WeatherForecastDailyEntry[]> {
  const clamped = clampDateRange({ start: params.startDate, end: params.endDate });
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(params.lat));
  url.searchParams.set('longitude', String(params.lon));
  url.searchParams.set('hourly', 'temperature_2m,precipitation_probability');
  url.searchParams.set('timezone', params.timezone ?? 'auto');
  url.searchParams.set('start_date', clamped.start);
  url.searchParams.set('end_date', clamped.end);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);

  const json = await res.json() as {
    hourly?: {
      time?: string[];
      temperature_2m?: number[];
      precipitation_probability?: number[];
    };
  };

  const times = json.hourly?.time ?? [];
  const temps = json.hourly?.temperature_2m ?? [];
  const rain = json.hourly?.precipitation_probability ?? [];

  const byDate = new Map<string, {
    morning: SegmentAccumulator;
    afternoon: SegmentAccumulator;
    night: SegmentAccumulator;
  }>();

  for (let i = 0; i < times.length; i += 1) {
    const ts = String(times[i] ?? '');
    const date = ts.slice(0, 10);
    const hour = Number(ts.slice(11, 13));
    if (!date || !Number.isFinite(hour)) continue;

    const entry = byDate.get(date) ?? {
      morning: { t: [], r: [] },
      afternoon: { t: [], r: [] },
      night: { t: [], r: [] },
    };

    const t = Number(temps[i]);
    const r = Number(rain[i]);
    if (hour >= 6 && hour <= 11) { if (Number.isFinite(t)) entry.morning.t.push(t); if (Number.isFinite(r)) entry.morning.r.push(r); }
    else if (hour >= 12 && hour <= 17) { if (Number.isFinite(t)) entry.afternoon.t.push(t); if (Number.isFinite(r)) entry.afternoon.r.push(r); }
    else if (hour >= 18 && hour <= 23) { if (Number.isFinite(t)) entry.night.t.push(t); if (Number.isFinite(r)) entry.night.r.push(r); }

    byDate.set(date, entry);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      morning: { temp_avg: avg(v.morning.t), rain_prob_max: max(v.morning.r) },
      afternoon: { temp_avg: avg(v.afternoon.t), rain_prob_max: max(v.afternoon.r) },
      night: { temp_avg: avg(v.night.t), rain_prob_max: max(v.night.r) },
    }));
}

export async function fetchWeatherCache(params: {
  tripId: string;
  lat: number;
  lon: number;
  startDate: string;
  endDate: string;
  timezone?: string;
}): Promise<WeatherForecastDailyEntry[]> {
  const { tripId, lat, lon, startDate, endDate, timezone } = params;

  // Si las coordenadas no son válidas, fallar rápido con mensaje claro
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat === 0 || lon === 0) {
    throw new Error('No hay coordenadas para este destino. Crea el viaje de nuevo seleccionando el destino del buscador.');
  }

  // Si el viaje ya terminó, ajustar al rango actual (Open-Meteo solo tiene 16 días futuros)
  const today = new Date().toISOString().slice(0, 10);
  const effectiveStart = startDate < today ? today : startDate;
  const effectiveEnd = endDate < today ? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) : endDate;

  // 1. Intentar con edge function (usuarios premium y no-premium — si falla por 403/premium, ir a fallback)
  try {
    const { data, error } = await supabase.functions.invoke('weather-cache', {
      body: {
        trip_id: tripId,
        lat,
        lon,
        start_date: effectiveStart,
        end_date: effectiveEnd,
        timezone,
      },
    });
    if (!error) {
      const forecast = (data as { forecast_daily?: WeatherForecastDailyEntry[] } | null)?.forecast_daily ?? [];
      if (forecast.length > 0) return forecast;
    }
    // Si error (incluye 403 premium) → caer al fallback directo sin lanzar
  } catch { /* ignorar, fallback directo */ }

  // 2. Fallback directo a Open-Meteo (gratuito, sin key, sin auth)
  const fallback = await fetchWeatherDirect({ lat, lon, startDate: effectiveStart, endDate: effectiveEnd, timezone });
  if (fallback.length > 0) return fallback;

  throw new Error('No se pudo obtener el pronóstico. Verifica que el destino del viaje tenga coordenadas válidas.');
}
