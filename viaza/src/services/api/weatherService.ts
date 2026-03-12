/**
 * weatherService.ts
 * Conecta con Open-Meteo (https://open-meteo.com/) — gratuito, sin API key.
 * Dado un nombre de destino, geocodifica y obtiene el pronóstico real.
 */

import type { ClimateType } from '../../types/trip';

export interface WeatherForecast {
  climate: ClimateType;
  avgTempC: number;
  minTempC: number;
  maxTempC: number;
  precipitationMm: number;
  description: string; // "Caluroso y seco" etc.
}

interface GeoResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

/**
 * Geocodifica un destino usando Open-Meteo Geocoding API.
 */
export async function geocodeDestination(destination: string): Promise<GeoResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=es&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results?.length) return null;
    const r = data.results[0];
    return { latitude: r.latitude, longitude: r.longitude, name: r.name, country: r.country };
  } catch {
    return null;
  }
}

/**
 * Obtiene el pronóstico promedio para un rango de fechas.
 * Si startDate/endDate están vacíos usa los próximos 7 días.
 */
export async function getWeatherForecast(
  destination: string,
  startDate?: string,
  endDate?: string
): Promise<WeatherForecast | null> {
  const geo = await geocodeDestination(destination);
  if (!geo) return null;

  const today = new Date();
  const start = startDate || today.toISOString().slice(0, 10);
  // Open-Meteo permite hasta 16 días en adelante en forecast
  const rawEnd = endDate || new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);

  // Limitar a máx 16 días desde hoy para forecast (API limit)
  const maxDate = new Date(today.getTime() + 16 * 86400000).toISOString().slice(0, 10);
  const end = rawEnd > maxDate ? maxDate : rawEnd;

  const url = [
    'https://api.open-meteo.com/v1/forecast',
    `?latitude=${geo.latitude}`,
    `&longitude=${geo.longitude}`,
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum`,
    `&temperature_unit=celsius`,
    `&timezone=auto`,
    `&start_date=${start}`,
    `&end_date=${end}`,
  ].join('');

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const daily = data.daily;
    if (!daily?.temperature_2m_max?.length) return null;

    const maxTemps: number[] = daily.temperature_2m_max;
    const minTemps: number[] = daily.temperature_2m_min;
    const precip: number[] = daily.precipitation_sum;

    const avgMax = maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length;
    const avgMin = minTemps.reduce((a, b) => a + b, 0) / minTemps.length;
    const avgTemp = (avgMax + avgMin) / 2;
    const totalPrecip = precip.reduce((a, b) => a + (b ?? 0), 0);
    const avgPrecip = totalPrecip / precip.length;

    const climate = inferClimateFromData(avgTemp, avgPrecip);
    const description = buildDescription(climate, avgTemp, avgPrecip);

    return {
      climate,
      avgTempC: Math.round(avgTemp),
      minTempC: Math.round(Math.min(...minTemps)),
      maxTempC: Math.round(Math.max(...maxTemps)),
      precipitationMm: Math.round(avgPrecip),
      description,
    };
  } catch {
    return null;
  }
}

function inferClimateFromData(avgTempC: number, avgPrecipMm: number): ClimateType {
  if (avgPrecipMm > 5) return 'rainy';
  if (avgTempC >= 26) return 'hot';
  if (avgTempC <= 10) return 'cold';
  return 'mild';
}

function buildDescription(climate: ClimateType, temp: number, precip: number): string {
  const tempStr = `${Math.round(temp)}°C`;
  if (climate === 'hot') return `Caluroso · ${tempStr}`;
  if (climate === 'cold') return `Frío · ${tempStr}`;
  if (climate === 'rainy') return `Lluvioso · ${Math.round(precip)}mm/día`;
  return `Templado · ${tempStr}`;
}
