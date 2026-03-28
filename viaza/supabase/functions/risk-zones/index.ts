import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireAuth } from '../_shared/premium.ts';

type Body = {
  trip_id: string;
  country_code?: string;
  destination_country?: string;
};

type TripRiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

type ProviderFetchResult = {
  sourceUrl: string;
  payload: Record<string, unknown>;
};

const ISO2_TO_ISO3: Record<string, string> = {
  MX: 'MEX', US: 'USA', CA: 'CAN', AR: 'ARG', BR: 'BRA', CO: 'COL', PE: 'PER', CL: 'CHL',
  FR: 'FRA', IT: 'ITA', ES: 'ESP', GB: 'GBR', DE: 'DEU', NL: 'NLD', PT: 'PRT', CH: 'CHE',
  AT: 'AUT', CZ: 'CZE', HU: 'HUN', GR: 'GRC', SE: 'SWE', TR: 'TUR', MA: 'MAR', ZA: 'ZAF',
  JP: 'JPN', CN: 'CHN', TH: 'THA', ID: 'IDN', SG: 'SGP', AE: 'ARE', IN: 'IND', KR: 'KOR',
  AU: 'AUS', NZ: 'NZL',
};

function normalizeCountryCode(code?: string | null): string | null {
  const v = String(code ?? '').trim().toUpperCase();
  if (!v) return null;
  if (/^[A-Z]{2}$/.test(v)) return v;
  if (/^[A-Z]{3}$/.test(v)) {
    const found = Object.entries(ISO2_TO_ISO3).find(([, iso3]) => iso3 === v)?.[0];
    return found ?? null;
  }
  return null;
}

function scoreToLevel(score?: number | null): TripRiskLevel {
  if (score == null || !Number.isFinite(score)) return 'unknown';
  if (score >= 4.5) return 'critical';
  if (score >= 3.5) return 'high';
  if (score >= 2.0) return 'medium';
  return 'low';
}

function textToLevel(raw?: string | null): TripRiskLevel {
  const v = String(raw ?? '').trim().toLowerCase();
  if (!v) return 'unknown';
  if (v.includes('critical') || v.includes('extreme') || v.includes('do not travel')) return 'critical';
  if (v.includes('high') || v.includes('level 4') || v.includes('level 3')) return 'high';
  if (v.includes('medium') || v.includes('moderate') || v.includes('level 2')) return 'medium';
  if (v.includes('low') || v.includes('level 1')) return 'low';
  return 'unknown';
}

function asNumber(v: unknown): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function asString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s.length > 0 ? s : null;
}

function normalizeRisk(payload: Record<string, unknown>): {
  level: TripRiskLevel;
  score: number | null;
  advisory: string | null;
  alertsCount: number | null;
} {
  const nested = (payload.data && typeof payload.data === 'object' ? payload.data : null) as Record<string, unknown> | null;

  const score =
    asNumber(payload.risk_score) ??
    asNumber(payload.score) ??
    asNumber(payload.advisory_score) ??
    asNumber(nested?.risk_score) ??
    asNumber(nested?.score);

  const levelText =
    asString(payload.risk_level) ??
    asString(payload.level) ??
    asString(payload.advisory_level) ??
    asString(nested?.risk_level) ??
    asString(nested?.level);

  const level = textToLevel(levelText) !== 'unknown'
    ? textToLevel(levelText)
    : scoreToLevel(score);

  const advisory =
    asString(payload.advisory_text) ??
    asString(payload.summary) ??
    asString(payload.description) ??
    asString(payload.message) ??
    asString(nested?.advisory_text) ??
    asString(nested?.summary) ??
    asString(nested?.description);

  const alertsFromArray = Array.isArray(payload.alerts) ? payload.alerts.length : null;
  const alertsCount =
    asNumber(payload.alerts_count) ??
    asNumber(payload.active_alerts) ??
    asNumber(nested?.alerts_count) ??
    asNumber(nested?.active_alerts) ??
    alertsFromArray;

  return { level, score, advisory, alertsCount };
}

async function fetchProviderRisk(params: {
  baseUrl: string;
  apiKey: string;
  countryCode2: string;
}): Promise<ProviderFetchResult> {
  const { baseUrl, apiKey, countryCode2 } = params;
  const iso3 = ISO2_TO_ISO3[countryCode2] ?? countryCode2;
  const root = baseUrl.replace(/\/+$/, '');

  const candidates = [
    `${root}/countries/${iso3}`,
    `${root}/countries/${countryCode2}`,
    `${root}/country/${iso3}`,
    `${root}/country/${countryCode2}`,
    `${root}/risk/${iso3}`,
    `${root}/risk/${countryCode2}`,
    `${root}/advisory/${iso3}`,
    `${root}/advisory/${countryCode2}`,
    `${root}/advisories/${iso3}`,
    `${root}/advisories/${countryCode2}`,
    `${root}/risk?country=${iso3}`,
    `${root}/risk?country=${countryCode2}`,
    `${root}/advisory?country=${iso3}`,
    `${root}/advisory?country=${countryCode2}`,
  ];

  const attempts: string[] = [];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      });

      attempts.push(`${url} -> ${res.status}`);

      if (!res.ok) {
        if (res.status === 404) continue;
        const txt = await res.text().catch(() => '');
        throw new Error(`TravelRiskAPI ${res.status}: ${txt || 'request failed'}`);
      }

      const payload = await res.json() as Record<string, unknown>;
      return { sourceUrl: url, payload };
    } catch (e) {
      attempts.push(`${url} -> ${(e as Error).message}`);
    }
  }

  throw new Error(`TravelRiskAPI no respondió con un endpoint válido. intentos=${attempts.join(' | ')}`);
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const authed = await requireAuth(req);
    if (authed instanceof Response) return authed;
    const { supabase, userId } = authed;

    const body = await req.json() as Body;
    const tripId = String(body.trip_id ?? '').trim();
    if (!tripId) {
      return jsonResponse({ ok: false, error: 'trip_id is required' }, { status: 400 });
    }

    const { data: trip, error: tripErr } = await supabase
      .from('trips')
      .select('id,user_id,country_code,destination_country')
      .eq('id', tripId)
      .eq('user_id', userId)
      .maybeSingle();

    if (tripErr) return jsonResponse({ ok: false, error: tripErr.message }, { status: 500 });
    if (!trip) return jsonResponse({ ok: false, error: 'Trip not found' }, { status: 404 });

    const countryCode2 = normalizeCountryCode(body.country_code) ?? normalizeCountryCode(trip.country_code);
    if (!countryCode2) {
      return jsonResponse({ ok: false, error: 'country_code is required (ISO-2)' }, { status: 400 });
    }

    const apiKey = Deno.env.get('TRAVEL_RISK_API_KEY') ?? '';
    if (!apiKey) {
      return jsonResponse({ ok: false, error: 'Missing TRAVEL_RISK_API_KEY' }, { status: 500 });
    }

    const baseUrl = (Deno.env.get('TRAVEL_RISK_BASE_URL') ?? 'https://travelriskapi.com/api/v1').trim();
    const fetched = await fetchProviderRisk({ baseUrl, apiKey, countryCode2 });

    const risk = normalizeRisk(fetched.payload);
    const updatedAt = new Date().toISOString();

    const summary = {
      provider: 'TravelRiskAPI',
      level: risk.level,
      score: risk.score,
      advisory: risk.advisory,
      alertsCount: risk.alertsCount,
      countryCode: countryCode2,
      sourceUrl: fetched.sourceUrl,
      updatedAt,
      raw: fetched.payload,
    };

    const { error: upErr } = await supabase
      .from('trips')
      .update({
        risk_level: risk.level,
        risk_summary: summary,
        risk_updated_at: updatedAt,
        updated_at: updatedAt,
      })
      .eq('id', tripId)
      .eq('user_id', userId);

    if (upErr) return jsonResponse({ ok: false, error: upErr.message }, { status: 500 });

    return jsonResponse({ ok: true, risk: summary });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
