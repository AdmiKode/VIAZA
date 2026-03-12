import type { ClimateType } from '../../../types/trip';

export interface DestinationMeta {
  countryCode: string;
  currencyCode: string;
  languageCode: string;
  climate: ClimateType;
  /** Nombre legible del país */
  countryName: string;
}

/**
 * Infiere metadatos del destino a partir del texto ingresado por el usuario.
 * ~50 destinos cubiertos. Fallback: US/USD/en/mild.
 */
export function inferDestinationMeta(destination: string): DestinationMeta {
  const d = destination.trim().toLowerCase();

  // ── Europa ──────────────────────────────────────────────────────
  if (d.includes('paris') || d.includes('lyon') || d.includes('nice') || d.includes('marseille'))
    return { countryCode: 'FR', currencyCode: 'EUR', languageCode: 'fr', climate: 'mild', countryName: 'Francia' };
  if (d.includes('rome') || d.includes('roma') || d.includes('milan') || d.includes('milano') || d.includes('florence') || d.includes('naples') || d.includes('venice'))
    return { countryCode: 'IT', currencyCode: 'EUR', languageCode: 'it', climate: 'mild', countryName: 'Italia' };
  if (d.includes('barcelona') || d.includes('madrid') || d.includes('seville') || d.includes('sevilla') || d.includes('valencia'))
    return { countryCode: 'ES', currencyCode: 'EUR', languageCode: 'es', climate: 'hot', countryName: 'España' };
  if (d.includes('london') || d.includes('manchester') || d.includes('edinburgh'))
    return { countryCode: 'GB', currencyCode: 'GBP', languageCode: 'en', climate: 'rainy', countryName: 'Reino Unido' };
  if (d.includes('berlin') || d.includes('munich') || d.includes('hamburg') || d.includes('frankfurt'))
    return { countryCode: 'DE', currencyCode: 'EUR', languageCode: 'de', climate: 'cold', countryName: 'Alemania' };
  if (d.includes('amsterdam') || d.includes('rotterdam'))
    return { countryCode: 'NL', currencyCode: 'EUR', languageCode: 'nl', climate: 'rainy', countryName: 'Países Bajos' };
  if (d.includes('lisbon') || d.includes('lisboa') || d.includes('porto'))
    return { countryCode: 'PT', currencyCode: 'EUR', languageCode: 'pt', climate: 'mild', countryName: 'Portugal' };
  if (d.includes('zurich') || d.includes('geneva') || d.includes('bern'))
    return { countryCode: 'CH', currencyCode: 'CHF', languageCode: 'de', climate: 'cold', countryName: 'Suiza' };
  if (d.includes('vienna') || d.includes('wien') || d.includes('salzburg'))
    return { countryCode: 'AT', currencyCode: 'EUR', languageCode: 'de', climate: 'cold', countryName: 'Austria' };
  if (d.includes('prague') || d.includes('praga'))
    return { countryCode: 'CZ', currencyCode: 'CZK', languageCode: 'cs', climate: 'cold', countryName: 'República Checa' };
  if (d.includes('budapest'))
    return { countryCode: 'HU', currencyCode: 'HUF', languageCode: 'hu', climate: 'mild', countryName: 'Hungría' };
  if (d.includes('athens') || d.includes('atenas') || d.includes('santorini') || d.includes('mykonos'))
    return { countryCode: 'GR', currencyCode: 'EUR', languageCode: 'el', climate: 'hot', countryName: 'Grecia' };
  if (d.includes('stockholm') || d.includes('oslo') || d.includes('copenhagen') || d.includes('helsinki'))
    return { countryCode: 'SE', currencyCode: 'SEK', languageCode: 'sv', climate: 'cold', countryName: 'Escandinavia' };

  // ── América del Norte ─────────────────────────────────────────────
  if (d.includes('miami') || d.includes('orlando'))
    return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'hot', countryName: 'Estados Unidos' };
  if (d.includes('new york') || d.includes('los angeles') || d.includes('chicago') || d.includes('san francisco') || d.includes('boston') || d.includes('seattle') || d.includes('las vegas') || d.includes('washington'))
    return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'mild', countryName: 'Estados Unidos' };
  if (d.includes('toronto') || d.includes('montreal') || d.includes('vancouver') || d.includes('calgary'))
    return { countryCode: 'CA', currencyCode: 'CAD', languageCode: 'en', climate: 'cold', countryName: 'Canadá' };
  if (d.includes('cancun') || d.includes('cancún') || d.includes('tulum') || d.includes('playa del carmen') || d.includes('cabo') || d.includes('puerto vallarta'))
    return { countryCode: 'MX', currencyCode: 'MXN', languageCode: 'es', climate: 'hot', countryName: 'México' };
  if (d.includes('mexico city') || d.includes('ciudad de mexico') || d.includes('cdmx') || d.includes('guadalajara') || d.includes('monterrey'))
    return { countryCode: 'MX', currencyCode: 'MXN', languageCode: 'es', climate: 'mild', countryName: 'México' };

  // ── América del Sur ───────────────────────────────────────────────
  if (d.includes('buenos aires') || d.includes('mendoza') || d.includes('patagonia'))
    return { countryCode: 'AR', currencyCode: 'ARS', languageCode: 'es', climate: 'mild', countryName: 'Argentina' };
  if (d.includes('rio') || d.includes('são paulo') || d.includes('sao paulo') || d.includes('florianopolis') || d.includes('brasilia'))
    return { countryCode: 'BR', currencyCode: 'BRL', languageCode: 'pt', climate: 'hot', countryName: 'Brasil' };
  if (d.includes('bogota') || d.includes('bogotá') || d.includes('cartagena') || d.includes('medellin') || d.includes('medellín'))
    return { countryCode: 'CO', currencyCode: 'COP', languageCode: 'es', climate: 'mild', countryName: 'Colombia' };
  if (d.includes('lima') || d.includes('cusco') || d.includes('machu picchu'))
    return { countryCode: 'PE', currencyCode: 'PEN', languageCode: 'es', climate: 'mild', countryName: 'Perú' };
  if (d.includes('santiago') || d.includes('valparaiso'))
    return { countryCode: 'CL', currencyCode: 'CLP', languageCode: 'es', climate: 'mild', countryName: 'Chile' };

  // ── Asia ──────────────────────────────────────────────────────────
  if (d.includes('tokyo') || d.includes('osaka') || d.includes('kyoto') || d.includes('hiroshima'))
    return { countryCode: 'JP', currencyCode: 'JPY', languageCode: 'ja', climate: 'mild', countryName: 'Japón' };
  if (d.includes('beijing') || d.includes('shanghai'))
    return { countryCode: 'CN', currencyCode: 'CNY', languageCode: 'zh', climate: 'mild', countryName: 'China' };
  if (d.includes('hong kong'))
    return { countryCode: 'HK', currencyCode: 'HKD', languageCode: 'zh', climate: 'hot', countryName: 'Hong Kong' };
  if (d.includes('bangkok') || d.includes('phuket') || d.includes('chiang mai') || d.includes('koh samui'))
    return { countryCode: 'TH', currencyCode: 'THB', languageCode: 'th', climate: 'hot', countryName: 'Tailandia' };
  if (d.includes('bali') || d.includes('jakarta') || d.includes('lombok'))
    return { countryCode: 'ID', currencyCode: 'IDR', languageCode: 'id', climate: 'hot', countryName: 'Indonesia' };
  if (d.includes('singapore') || d.includes('singapur'))
    return { countryCode: 'SG', currencyCode: 'SGD', languageCode: 'en', climate: 'hot', countryName: 'Singapur' };
  if (d.includes('dubai') || d.includes('abu dhabi'))
    return { countryCode: 'AE', currencyCode: 'AED', languageCode: 'ar', climate: 'hot', countryName: 'Emiratos Árabes' };
  if (d.includes('istanbul') || d.includes('ankara') || d.includes('cappadocia') || d.includes('capadocia'))
    return { countryCode: 'TR', currencyCode: 'TRY', languageCode: 'tr', climate: 'mild', countryName: 'Turquía' };
  if (d.includes('delhi') || d.includes('mumbai') || d.includes('bangalore') || d.includes('goa'))
    return { countryCode: 'IN', currencyCode: 'INR', languageCode: 'hi', climate: 'hot', countryName: 'India' };
  if (d.includes('seoul') || d.includes('busan') || d.includes('jeju'))
    return { countryCode: 'KR', currencyCode: 'KRW', languageCode: 'ko', climate: 'mild', countryName: 'Corea del Sur' };

  // ── África / Oceanía ──────────────────────────────────────────────
  if (d.includes('marrakech') || d.includes('casablanca') || d.includes('rabat'))
    return { countryCode: 'MA', currencyCode: 'MAD', languageCode: 'ar', climate: 'hot', countryName: 'Marruecos' };
  if (d.includes('cape town') || d.includes('johannesburg') || d.includes('safari'))
    return { countryCode: 'ZA', currencyCode: 'ZAR', languageCode: 'en', climate: 'mild', countryName: 'Sudáfrica' };
  if (d.includes('sydney') || d.includes('melbourne') || d.includes('brisbane') || d.includes('cairns'))
    return { countryCode: 'AU', currencyCode: 'AUD', languageCode: 'en', climate: 'hot', countryName: 'Australia' };
  if (d.includes('auckland') || d.includes('queenstown') || d.includes('wellington'))
    return { countryCode: 'NZ', currencyCode: 'NZD', languageCode: 'en', climate: 'mild', countryName: 'Nueva Zelanda' };

  // ── Default ───────────────────────────────────────────────────────
  return { countryCode: 'US', currencyCode: 'USD', languageCode: 'en', climate: 'mild', countryName: destination.trim() };
}
