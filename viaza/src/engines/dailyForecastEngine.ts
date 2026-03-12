/**
 * dailyForecastEngine.ts
 * Fetches a day-by-day weather forecast from Open-Meteo with hourly data
 * to derive morning / afternoon / night temperatures per day.
 */

export interface DayForecast {
  date: string;           // YYYY-MM-DD
  maxTemp: number;
  minTemp: number;
  morningTemp: number;    // avg 06-10h
  afternoonTemp: number;  // avg 12-16h
  nightTemp: number;      // avg 20-24h
  rainProbability: number;
  weatherCode: number;
  weatherType: 'hot' | 'warm' | 'mild' | 'cold' | 'snowy' | 'rainy';
  icon: string;           // emoji-free icon key
}

function wmoToType(code: number, temp: number): DayForecast['weatherType'] {
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 85 && code <= 86) return 'snowy';
  if (code >= 61 && code <= 67) return 'rainy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 95) return 'rainy';
  if (temp >= 28) return 'hot';
  if (temp >= 20) return 'warm';
  if (temp >= 10) return 'mild';
  if (temp >= 0) return 'cold';
  return 'snowy';
}

function typeToIcon(type: DayForecast['weatherType'], code: number): string {
  if (code >= 95) return 'storm';
  if (type === 'snowy') return 'snow';
  if (type === 'rainy') return 'rain';
  if (type === 'hot') return 'sun_hot';
  if (type === 'warm') return 'sun';
  if (type === 'mild') return 'partly_cloudy';
  if (type === 'cold') return 'cold';
  return 'sun';
}

function avgHours(temps: number[], hours: number[]): number {
  const values = hours.map((h) => temps[h] ?? null).filter((v) => v !== null) as number[];
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Fetches daily forecast with hourly breakdown.
 * Open-Meteo free tier — no API key needed.
 * Clamps to 16 days (API limit).
 */
export async function fetchDailyForecast(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<DayForecast[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode');
  url.searchParams.set('hourly', 'temperature_2m');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo daily error: ${res.status}`);
  const data = await res.json();

  const daily = data.daily as {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };

  const hourlyTemps: number[] = data.hourly?.temperature_2m ?? [];
  const hourlyTimes: string[] = data.hourly?.time ?? [];

  const days = daily.time ?? [];

  return days.map((date, dayIdx) => {
    const maxTemp = Math.round(daily.temperature_2m_max[dayIdx] ?? 0);
    const minTemp = Math.round(daily.temperature_2m_min[dayIdx] ?? 0);
    const rainProbability = Math.round(daily.precipitation_probability_max[dayIdx] ?? 0);
    const weatherCode = daily.weathercode[dayIdx] ?? 0;
    const avgTemp = Math.round((maxTemp + minTemp) / 2);
    const weatherType = wmoToType(weatherCode, avgTemp);

    // Find hourly indices for this day
    const dayPrefix = date; // YYYY-MM-DD
    const dayHourIndices = hourlyTimes
      .map((t, i) => (t.startsWith(dayPrefix) ? i : -1))
      .filter((i) => i >= 0);

    // Morning: hours 6-10 (indices within the day's 24h block)
    const morningHours = [6, 7, 8, 9, 10].map((h) => dayHourIndices[h]).filter(Boolean);
    const afternoonHours = [12, 13, 14, 15, 16].map((h) => dayHourIndices[h]).filter(Boolean);
    const nightHours = [20, 21, 22, 23].map((h) => dayHourIndices[h]).filter(Boolean);

    const getAvg = (indices: number[]) => {
      const vals = indices.map((i) => hourlyTemps[i]).filter((v) => v !== undefined && v !== null);
      if (vals.length === 0) return avgTemp;
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    };

    return {
      date,
      maxTemp,
      minTemp,
      morningTemp: getAvg(morningHours),
      afternoonTemp: getAvg(afternoonHours),
      nightTemp: getAvg(nightHours),
      rainProbability,
      weatherCode,
      weatherType,
      icon: typeToIcon(weatherType, weatherCode),
    };
  });
}
