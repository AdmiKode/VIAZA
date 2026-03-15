import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';

type Body = { base?: string };

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const { base = 'USD' } = (await req.json().catch(() => ({}))) as Body;
    const key = requireEnv('EXCHANGE_RATE_KEY');

    const url = `https://v6.exchangerate-api.com/v6/${encodeURIComponent(key)}/latest/${encodeURIComponent(base)}`;
    const res = await fetch(url);
    if (!res.ok) return jsonResponse({ ok: false, error: `ExchangeRate API ${res.status}` }, { status: 502 });
    const data = await res.json() as {
      result?: string;
      ['error-type']?: string;
      conversion_rates?: Record<string, number>;
    };
    if (data.result !== 'success' || !data.conversion_rates) {
      return jsonResponse({ ok: false, error: data['error-type'] ?? 'ExchangeRate error' }, { status: 400 });
    }

    return jsonResponse({ ok: true, base, conversion_rates: data.conversion_rates });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});

