import { supabase } from '../../../services/supabaseClient';

export type CurrencyCode =
  | 'USD' | 'EUR' | 'MXN' | 'JPY' | 'CAD' | 'GBP'
  | 'COP' | 'BRL' | 'ARS' | 'THB' | 'IDR' | 'INR'
  | 'AUD' | 'AED' | 'CHF';

/** Fallback en caso de que falle la API o no haya key */
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.08,
  MXN: 0.058,
  JPY: 0.0067,
  CAD: 0.74,
  GBP: 1.27,
  COP: 0.00024,
  BRL: 0.20,
  ARS: 0.0011,
  THB: 0.029,
  IDR: 0.000062,
  INR: 0.012,
  AUD: 0.65,
  AED: 0.27,
  CHF: 1.12,
};

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora
let _cachedRates: Record<CurrencyCode, number> | null = null;
let _cacheTime = 0;

/**
 * Obtiene tasas de cambio reales desde ExchangeRate-API (v6).
 * Base: USD → convierte a ratios respecto a USD.
 * Si falla o la key está vacía, usa fallback hardcodeado.
 */
export async function fetchRates(): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();
  if (_cachedRates && now - _cacheTime < CACHE_TTL_MS) return _cachedRates;

  try {
    const { data, error } = await supabase.functions.invoke('exchange-rates', { body: { base: 'USD' } });
    if (error) throw error;
    const raw: Record<string, number> = (data as { conversion_rates?: Record<string, number> } | null)?.conversion_rates ?? {};
    const rates = {} as Record<CurrencyCode, number>;

    // Convierte a ratios relativos al USD (1 USD = X unidades → ratio = 1/X)
    const currencies = Object.keys(FALLBACK_RATES) as CurrencyCode[];
    for (const code of currencies) {
      const usdToCode = raw[code];
      rates[code] = usdToCode ? 1 / usdToCode : FALLBACK_RATES[code];
    }
    rates['USD'] = 1; // ancla

    _cachedRates = rates;
    _cacheTime = now;
    return rates;
  } catch (err) {
    console.error('[currencyService] fetchRates failed:', err);
    return FALLBACK_RATES;
  }
}

export function convertAmount(params: {
  amount: number;
  from: CurrencyCode;
  to: CurrencyCode;
  rates: Record<CurrencyCode, number>;
}) {
  const { amount, from, to, rates } = params;
  if (!Number.isFinite(amount)) return 0;
  const fromToUsd = rates[from];
  const toToUsd = rates[to];
  if (!fromToUsd || !toToUsd) return 0;
  const usd = amount * fromToUsd;
  return usd / toToUsd;
}
