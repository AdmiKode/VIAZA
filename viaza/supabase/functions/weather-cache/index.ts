import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { createSupabaseClientForRequest } from '../_shared/supabase.ts';
import { requireAuth, requirePremium } from '../_shared/premium.ts';

type Body = {
  trip_id: string;
  lat: number;
  lon: number;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  timezone?: string;  // IANA
};

type Segment = { temp_avg: number | null; rain_prob_max: number | null };

function avg(nums: number[]) {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function max(nums: number[]) {
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function clampDateRange(params: { start: string; end: string }) {
  const today = new Date();
  const maxForecast = new Date(today.getTime() + 16 * 86400000);

  const start = new Date(params.start + 'T12:00:00');
  const end = new Date(params.end + 'T12:00:00');
  const validStart = Number.isFinite(start.getTime()) ? start : today;
  const validEnd = Number.isFinite(end.getTime()) ? end : new Date(today.getTime() + 7 * 86400000);

  const clampedStart = validStart > maxForecast ? today : validStart;
  const clampedEndRaw = validEnd > maxForecast ? maxForecast : validEnd;
  const clampedEnd = clampedEndRaw < clampedStart ? clampedStart : clampedEndRaw;

  return { start: isoDate(clampedStart), end: isoDate(clampedEnd) };
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const authed = await requireAuth(req);
    if (authed instanceof Response) return authed;
    const premium = await requirePremium(req);
    const canPersist = !(premium instanceof Response);

    const body = (await req.json()) as Body;
    const { trip_id, lat, lon, start_date, end_date, timezone } = body;
    if (!trip_id || !Number.isFinite(lat) || !Number.isFinite(lon) || !start_date || !end_date) {
      return jsonResponse({ ok: false, error: 'trip_id, lat, lon, start_date, end_date are required' }, { status: 400 });
    }

    // Open‑Meteo forecast only supports ~16 days ahead; if the trip is beyond that window
    // we fallback to "next 7 days" so the user still sees something useful.
    const clamped = clampDateRange({ start: start_date, end: end_date });

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('hourly', 'temperature_2m,precipitation_probability');
    url.searchParams.set('timezone', timezone ?? 'auto');
    url.searchParams.set('start_date', clamped.start);
    url.searchParams.set('end_date', clamped.end);

    let res = await fetch(url);
    if (!res.ok) {
      const today = new Date();
      const fallbackStart = isoDate(today);
      const fallbackEnd = isoDate(new Date(today.getTime() + 7 * 86400000));
      const fb = new URL(url);
      fb.searchParams.set('start_date', fallbackStart);
      fb.searchParams.set('end_date', fallbackEnd);
      res = await fetch(fb);
      if (!res.ok) return jsonResponse({ ok: false, error: `open-meteo ${res.status}` }, { status: 502 });
    }

    const json = await res.json() as {
      hourly?: {
        time: string[];
        temperature_2m: number[];
        precipitation_probability: number[];
      };
    };

    const times = json.hourly?.time ?? [];
    const temps = json.hourly?.temperature_2m ?? [];
    const rain = json.hourly?.precipitation_probability ?? [];

    const byDate = new Map<string, { morning: { t: number[]; r: number[] }; afternoon: { t: number[]; r: number[] }; night: { t: number[]; r: number[] } }>();

    for (let i = 0; i < times.length; i++) {
      const ts = times[i];
      const date = ts.slice(0, 10);
      const hour = Number(ts.slice(11, 13));
      if (!Number.isFinite(hour)) continue;

      const entry = byDate.get(date) ?? {
        morning: { t: [], r: [] },
        afternoon: { t: [], r: [] },
        night: { t: [], r: [] },
      };

      const t = temps[i];
      const r = rain[i];

      if (hour >= 6 && hour <= 11) { entry.morning.t.push(t); entry.morning.r.push(r); }
      else if (hour >= 12 && hour <= 17) { entry.afternoon.t.push(t); entry.afternoon.r.push(r); }
      else if (hour >= 18 && hour <= 23) { entry.night.t.push(t); entry.night.r.push(r); }

      byDate.set(date, entry);
    }

    const forecast_daily = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => {
        const morning: Segment = { temp_avg: avg(v.morning.t), rain_prob_max: max(v.morning.r) };
        const afternoon: Segment = { temp_avg: avg(v.afternoon.t), rain_prob_max: max(v.afternoon.r) };
        const night: Segment = { temp_avg: avg(v.night.t), rain_prob_max: max(v.night.r) };
        return { date, morning, afternoon, night };
      });

    // Persistir en trips.weather_forecast_daily (best-effort). Si falla por RLS u otros,
    // aún devolvemos el pronóstico para no romper la UI.
    if (canPersist) {
      const supabase = createSupabaseClientForRequest(req);
      const { error: upErr } = await supabase
        .from('trips')
        .update({ weather_forecast_daily: forecast_daily, updated_at: new Date().toISOString() })
        .eq('id', trip_id);

      if (upErr) console.warn('[weather-cache] persist failed:', upErr.message);
    }

    return jsonResponse({ ok: true, forecast_daily });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
