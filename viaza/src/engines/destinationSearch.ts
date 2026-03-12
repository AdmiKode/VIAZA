export interface DestinationResult {
  id: string;
  name: string;          // Display name (city, country)
  shortName: string;     // Just the city / place name
  country: string;       // Country full name
  countryCode: string;   // ISO 3166-1 alpha-2 (uppercase)
  lat: number;
  lon: number;
  currencyCode: string;
  languageCode: string;
}

// ── Currency + Language lookup by ISO country code ─────────────────────────
const COUNTRY_META: Record<string, { currency: string; language: string }> = {
  AD: { currency: 'EUR', language: 'ca' },
  AE: { currency: 'AED', language: 'ar' },
  AF: { currency: 'AFN', language: 'fa' },
  AG: { currency: 'XCD', language: 'en' },
  AL: { currency: 'ALL', language: 'sq' },
  AM: { currency: 'AMD', language: 'hy' },
  AO: { currency: 'AOA', language: 'pt' },
  AR: { currency: 'ARS', language: 'es' },
  AT: { currency: 'EUR', language: 'de' },
  AU: { currency: 'AUD', language: 'en' },
  AZ: { currency: 'AZN', language: 'az' },
  BA: { currency: 'BAM', language: 'bs' },
  BB: { currency: 'BBD', language: 'en' },
  BD: { currency: 'BDT', language: 'bn' },
  BE: { currency: 'EUR', language: 'fr' },
  BF: { currency: 'XOF', language: 'fr' },
  BG: { currency: 'BGN', language: 'bg' },
  BH: { currency: 'BHD', language: 'ar' },
  BI: { currency: 'BIF', language: 'fr' },
  BJ: { currency: 'XOF', language: 'fr' },
  BN: { currency: 'BND', language: 'ms' },
  BO: { currency: 'BOB', language: 'es' },
  BR: { currency: 'BRL', language: 'pt' },
  BS: { currency: 'BSD', language: 'en' },
  BT: { currency: 'BTN', language: 'dz' },
  BW: { currency: 'BWP', language: 'en' },
  BY: { currency: 'BYR', language: 'be' },
  BZ: { currency: 'BZD', language: 'en' },
  CA: { currency: 'CAD', language: 'en' },
  CD: { currency: 'CDF', language: 'fr' },
  CF: { currency: 'XAF', language: 'fr' },
  CG: { currency: 'XAF', language: 'fr' },
  CH: { currency: 'CHF', language: 'de' },
  CI: { currency: 'XOF', language: 'fr' },
  CL: { currency: 'CLP', language: 'es' },
  CM: { currency: 'XAF', language: 'fr' },
  CN: { currency: 'CNY', language: 'zh' },
  CO: { currency: 'COP', language: 'es' },
  CR: { currency: 'CRC', language: 'es' },
  CU: { currency: 'CUP', language: 'es' },
  CV: { currency: 'CVE', language: 'pt' },
  CY: { currency: 'EUR', language: 'el' },
  CZ: { currency: 'CZK', language: 'cs' },
  DE: { currency: 'EUR', language: 'de' },
  DJ: { currency: 'DJF', language: 'fr' },
  DK: { currency: 'DKK', language: 'da' },
  DM: { currency: 'XCD', language: 'en' },
  DO: { currency: 'DOP', language: 'es' },
  DZ: { currency: 'DZD', language: 'ar' },
  EC: { currency: 'USD', language: 'es' },
  EE: { currency: 'EUR', language: 'et' },
  EG: { currency: 'EGP', language: 'ar' },
  ER: { currency: 'ERN', language: 'ti' },
  ES: { currency: 'EUR', language: 'es' },
  ET: { currency: 'ETB', language: 'am' },
  FI: { currency: 'EUR', language: 'fi' },
  FJ: { currency: 'FJD', language: 'en' },
  FK: { currency: 'FKP', language: 'en' },
  FR: { currency: 'EUR', language: 'fr' },
  GA: { currency: 'XAF', language: 'fr' },
  GB: { currency: 'GBP', language: 'en' },
  GD: { currency: 'XCD', language: 'en' },
  GE: { currency: 'GEL', language: 'ka' },
  GH: { currency: 'GHS', language: 'en' },
  GM: { currency: 'GMD', language: 'en' },
  GN: { currency: 'GNF', language: 'fr' },
  GQ: { currency: 'XAF', language: 'es' },
  GR: { currency: 'EUR', language: 'el' },
  GT: { currency: 'GTQ', language: 'es' },
  GW: { currency: 'XOF', language: 'pt' },
  GY: { currency: 'GYD', language: 'en' },
  HN: { currency: 'HNL', language: 'es' },
  HR: { currency: 'EUR', language: 'hr' },
  HT: { currency: 'HTG', language: 'fr' },
  HU: { currency: 'HUF', language: 'hu' },
  ID: { currency: 'IDR', language: 'id' },
  IE: { currency: 'EUR', language: 'en' },
  IL: { currency: 'ILS', language: 'he' },
  IN: { currency: 'INR', language: 'hi' },
  IQ: { currency: 'IQD', language: 'ar' },
  IR: { currency: 'IRR', language: 'fa' },
  IS: { currency: 'ISK', language: 'is' },
  IT: { currency: 'EUR', language: 'it' },
  JM: { currency: 'JMD', language: 'en' },
  JO: { currency: 'JOD', language: 'ar' },
  JP: { currency: 'JPY', language: 'ja' },
  KE: { currency: 'KES', language: 'sw' },
  KG: { currency: 'KGS', language: 'ky' },
  KH: { currency: 'KHR', language: 'km' },
  KI: { currency: 'AUD', language: 'en' },
  KM: { currency: 'KMF', language: 'fr' },
  KN: { currency: 'XCD', language: 'en' },
  KP: { currency: 'KPW', language: 'ko' },
  KR: { currency: 'KRW', language: 'ko' },
  KW: { currency: 'KWD', language: 'ar' },
  KZ: { currency: 'KZT', language: 'kk' },
  LA: { currency: 'LAK', language: 'lo' },
  LB: { currency: 'LBP', language: 'ar' },
  LC: { currency: 'XCD', language: 'en' },
  LI: { currency: 'CHF', language: 'de' },
  LK: { currency: 'LKR', language: 'si' },
  LR: { currency: 'LRD', language: 'en' },
  LS: { currency: 'LSL', language: 'st' },
  LT: { currency: 'EUR', language: 'lt' },
  LU: { currency: 'EUR', language: 'fr' },
  LV: { currency: 'EUR', language: 'lv' },
  LY: { currency: 'LYD', language: 'ar' },
  MA: { currency: 'MAD', language: 'ar' },
  MC: { currency: 'EUR', language: 'fr' },
  MD: { currency: 'MDL', language: 'ro' },
  ME: { currency: 'EUR', language: 'sr' },
  MG: { currency: 'MGA', language: 'fr' },
  MH: { currency: 'USD', language: 'en' },
  MK: { currency: 'MKD', language: 'mk' },
  ML: { currency: 'XOF', language: 'fr' },
  MM: { currency: 'MMK', language: 'my' },
  MN: { currency: 'MNT', language: 'mn' },
  MR: { currency: 'MRO', language: 'ar' },
  MT: { currency: 'EUR', language: 'mt' },
  MU: { currency: 'MUR', language: 'en' },
  MV: { currency: 'MVR', language: 'dv' },
  MW: { currency: 'MWK', language: 'en' },
  MX: { currency: 'MXN', language: 'es' },
  MY: { currency: 'MYR', language: 'ms' },
  MZ: { currency: 'MZN', language: 'pt' },
  NA: { currency: 'NAD', language: 'en' },
  NE: { currency: 'XOF', language: 'fr' },
  NG: { currency: 'NGN', language: 'en' },
  NI: { currency: 'NIO', language: 'es' },
  NL: { currency: 'EUR', language: 'nl' },
  NO: { currency: 'NOK', language: 'no' },
  NP: { currency: 'NPR', language: 'ne' },
  NR: { currency: 'AUD', language: 'en' },
  NZ: { currency: 'NZD', language: 'en' },
  OM: { currency: 'OMR', language: 'ar' },
  PA: { currency: 'PAB', language: 'es' },
  PE: { currency: 'PEN', language: 'es' },
  PF: { currency: 'XPF', language: 'fr' },
  PG: { currency: 'PGK', language: 'en' },
  PH: { currency: 'PHP', language: 'fil' },
  PK: { currency: 'PKR', language: 'ur' },
  PL: { currency: 'PLN', language: 'pl' },
  PT: { currency: 'EUR', language: 'pt' },
  PW: { currency: 'USD', language: 'en' },
  PY: { currency: 'PYG', language: 'es' },
  QA: { currency: 'QAR', language: 'ar' },
  RO: { currency: 'RON', language: 'ro' },
  RS: { currency: 'RSD', language: 'sr' },
  RU: { currency: 'RUB', language: 'ru' },
  RW: { currency: 'RWF', language: 'rw' },
  SA: { currency: 'SAR', language: 'ar' },
  SB: { currency: 'SBD', language: 'en' },
  SC: { currency: 'SCR', language: 'en' },
  SD: { currency: 'SDG', language: 'ar' },
  SE: { currency: 'SEK', language: 'sv' },
  SG: { currency: 'SGD', language: 'en' },
  SI: { currency: 'EUR', language: 'sl' },
  SK: { currency: 'EUR', language: 'sk' },
  SL: { currency: 'SLL', language: 'en' },
  SM: { currency: 'EUR', language: 'it' },
  SN: { currency: 'XOF', language: 'fr' },
  SO: { currency: 'SOS', language: 'so' },
  SR: { currency: 'SRD', language: 'nl' },
  ST: { currency: 'STD', language: 'pt' },
  SV: { currency: 'USD', language: 'es' },
  SY: { currency: 'SYP', language: 'ar' },
  SZ: { currency: 'SZL', language: 'en' },
  TD: { currency: 'XAF', language: 'fr' },
  TG: { currency: 'XOF', language: 'fr' },
  TH: { currency: 'THB', language: 'th' },
  TJ: { currency: 'TJS', language: 'tg' },
  TL: { currency: 'USD', language: 'pt' },
  TM: { currency: 'TMT', language: 'tk' },
  TN: { currency: 'TND', language: 'ar' },
  TO: { currency: 'TOP', language: 'en' },
  TR: { currency: 'TRY', language: 'tr' },
  TT: { currency: 'TTD', language: 'en' },
  TV: { currency: 'AUD', language: 'en' },
  TZ: { currency: 'TZS', language: 'sw' },
  UA: { currency: 'UAH', language: 'uk' },
  UG: { currency: 'UGX', language: 'en' },
  US: { currency: 'USD', language: 'en' },
  UY: { currency: 'UYU', language: 'es' },
  UZ: { currency: 'UZS', language: 'uz' },
  VA: { currency: 'EUR', language: 'it' },
  VC: { currency: 'XCD', language: 'en' },
  VE: { currency: 'VES', language: 'es' },
  VN: { currency: 'VND', language: 'vi' },
  VU: { currency: 'VUV', language: 'bi' },
  WS: { currency: 'WST', language: 'sm' },
  YE: { currency: 'YER', language: 'ar' },
  ZA: { currency: 'ZAR', language: 'af' },
  ZM: { currency: 'ZMW', language: 'en' },
  ZW: { currency: 'ZWL', language: 'en' },
};

function getCountryMeta(countryCode: string): { currency: string; language: string } {
  return COUNTRY_META[countryCode.toUpperCase()] ?? { currency: 'USD', language: 'en' };
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

/**
 * Searches destinations using Nominatim (OpenStreetMap) — free, no API key.
 * Returns up to 6 results enriched with currency + language.
 */
export async function searchDestinations(query: string): Promise<DestinationResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query.trim());
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '8');
  url.searchParams.set('addressdetails', '1');
  // featuretype=city omitido — filtraba demasiado y dejaba fuera destinos válidos
  // Filtramos en código: solo class=place|boundary|tourism
  url.searchParams.set('accept-language', 'es,en');

  const res = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'es,en',
      'User-Agent': 'VIAZA-app/1.0',
    },
  });

  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

  const raw: NominatimResult[] = await res.json();

  const seen = new Set<string>();
  const results: DestinationResult[] = [];

  for (const item of raw) {
    // Solo lugares habitados o de interés turístico
    const cls = (item as any).class as string | undefined;
    const type = (item as any).type as string | undefined;
    const isPlace = cls === 'place' || cls === 'boundary' || cls === 'tourism' || cls === 'natural';
    const isUsefulType = !type || !['postcode','county','state_district','region','subregion','quarter','suburb','neighbourhood','road'].includes(type);
    if (!isPlace || !isUsefulType) continue;

    const addr = item.address ?? {};
    const countryCode = (addr.country_code ?? 'us').toUpperCase();
    const country = addr.country ?? '';
    const shortName =
      addr.city ?? addr.town ?? addr.village ?? addr.county ?? addr.state ?? query;

    // Deduplicate by shortName + countryCode
    const key = `${shortName.toLowerCase()}::${countryCode}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const meta = getCountryMeta(countryCode);

    results.push({
      id: String(item.place_id),
      name: `${shortName}, ${country}`,
      shortName,
      country,
      countryCode,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      currencyCode: meta.currency,
      languageCode: meta.language,
    });
  }

  return results;
}

/** Returns the flag emoji for a 2-letter ISO country code */
export function countryFlag(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return '';
  return String.fromCodePoint(
    ...code.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}
