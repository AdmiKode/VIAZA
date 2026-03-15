import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { createSupabaseClientForRequest } from '../_shared/supabase.ts';
import { requirePremium } from '../_shared/premium.ts';

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

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const premium = await requirePremium(req);
    if (premium instanceof Response) return premium;

    const body = (await req.json()) as Body;
    const { trip_id, lat, lon, start_date, end_date, timezone } = body;
    if (!trip_id || !Number.isFinite(lat) || !Number.isFinite(lon) || !start_date || !end_date) {
      return jsonResponse({ ok: false, error: 'trip_id, lat, lon, start_date, end_date are required' }, { status: 400 });
    }

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('hourly', 'temperature_2m,precipitation_probability');
    url.searchParams.set('timezone', timezone ?? 'auto');
    url.searchParams.set('start_date', start_date);
    url.searchParams.set('end_date', end_date);

    const res = await fetch(url);
    if (!res.ok) return jsonResponse({ ok: false, error: `open-meteo ${res.status}` }, { status: 502 });

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

    // Persistir en trips.weather_forecast_daily (con RLS vía JWT del usuario)
    const supabase = createSupabaseClientForRequest(req);

    const { error: upErr } = await supabase
      .from('trips')
      .update({ weather_forecast_daily: forecast_daily, updated_at: new Date().toISOString() })
      .eq('id', trip_id);

    if (upErr) return jsonResponse({ ok: false, error: upErr.message }, { status: 400 });

    return jsonResponse({ ok: true, forecast_daily });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
