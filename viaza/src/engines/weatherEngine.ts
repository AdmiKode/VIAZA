import type { WeatherForecast } from '../types/trip';

/** WMO Weather Interpretation Codes → category */
function wmoToWeatherType(code: number, avgTemp: number): WeatherForecast['weatherType'] {
  if (code >= 71 && code <= 77) return 'snowy';   // Snow
  if (code >= 61 && code <= 67) return 'rainy';   // Rain
  if (code >= 80 && code <= 82) return 'rainy';   // Rain showers
  if (code >= 85 && code <= 86) return 'snowy';   // Snow showers
  if (code >= 95) return 'rainy';                 // Thunderstorm
  // No precipitation — classify by temperature
  if (avgTemp >= 28) return 'hot';
  if (avgTemp >= 20) return 'warm';
  if (avgTemp >= 10) return 'mild';
  if (avgTemp >= 0) return 'cold';
  return 'snowy';
}

function weatherTypeToDescription(type: WeatherForecast['weatherType']): string {
  switch (type) {
    case 'hot':   return 'Muy caluroso';
    case 'warm':  return 'Cálido';
    case 'mild':  return 'Templado';
    case 'cold':  return 'Frío';
    case 'snowy': return 'Nevado';
    case 'rainy': return 'Lluvioso';
  }
}

/** OpenWeatherMap icon code → WeatherForecast weatherType */
function owmIconToWeatherType(icon: string, temp: number): WeatherForecast['weatherType'] {
  if (icon.startsWith('13')) return 'snowy';
  if (icon.startsWith('09') || icon.startsWith('10') || icon.startsWith('11')) return 'rainy';
  if (temp >= 28) return 'hot';
  if (temp >= 20) return 'warm';
  if (temp >= 10) return 'mild';
  if (temp >= 0) return 'cold';
  return 'snowy';
}

/**
 * Fetches current conditions from OpenWeatherMap (for near-term trips ≤ 5 days).
 * Falls back silently — used to enrich Open-Meteo with a real-time icon.
 */
export async function fetchCurrentConditions(
  lat: number,
  lon: number,
): Promise<{ icon: string; description: string; temp: number } | null> {
  void lat;
  void lon;
  // Regla de seguridad: no exponer API keys en frontend.
  // Para condiciones en tiempo real (si se requieren), implementar vía Edge Function.
  return null;
}

/**
 * Fetches a weather forecast from Open-Meteo (free, no API key needed).
 * Returns aggregated data for the full trip duration.
 * Optionally enriched with current conditions from OpenWeatherMap.
 */
export async function fetchForecast(
  lat: number,
  lon: number,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<WeatherForecast> {
  // Open-Meteo only provides up to 16 days forecast.
  // For longer trips we clamp to 16 days.
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const daily = data.daily as {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };

  const maxTemps: number[] = daily.temperature_2m_max ?? [];
  const minTemps: number[] = daily.temperature_2m_min ?? [];
  const rainProbs: number[] = daily.precipitation_probability_max ?? [];
  const codes: number[]    = daily.weathercode ?? [];

  if (maxTemps.length === 0) throw new Error('No weather data returned');

  const avgMax = maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length;
  const avgMin = minTemps.reduce((a, b) => a + b, 0) / minTemps.length;
  const avgTemp = Math.round((avgMax + avgMin) / 2);
  const maxTemp = Math.round(Math.max(...maxTemps));
  const minTemp = Math.round(Math.min(...minTemps));
  const rainProbability = Math.round(
    rainProbs.reduce((a, b) => a + b, 0) / rainProbs.length
  );

  // Most frequent WMO code across the forecast window
  const codeFreq: Record<number, number> = {};
  for (const c of codes) codeFreq[c] = (codeFreq[c] ?? 0) + 1;
  const dominantCode = Number(
    Object.entries(codeFreq).sort((a, b) => b[1] - a[1])[0][0]
  );

  const weatherType = wmoToWeatherType(dominantCode, avgTemp);

  return {
    avgTemp,
    minTemp,
    maxTemp,
    rainProbability,
    weatherType,
    description: weatherTypeToDescription(weatherType),
  };
}

/**
 * Maps WeatherForecast weatherType to the legacy ClimateType used in packing rules.
 */
export function weatherTypeToClimate(
  type: WeatherForecast['weatherType']
): 'hot' | 'cold' | 'mild' | 'rainy' {
  switch (type) {
    case 'hot':
    case 'warm':  return 'hot';
    case 'cold':
    case 'snowy': return 'cold';
    case 'rainy': return 'rainy';
    case 'mild':  return 'mild';
  }
}
