export type LocalTipCategory = 'safety' | 'transport' | 'culture' | 'money' | 'food' | 'utilities';

export type LocalTip = {
  id: string;
  category: LocalTipCategory;
  titleKey: string;
  descriptionKey: string;
  city?: string;
  countryCode?: string;
};

export const localTips: LocalTip[] = [
  // ─── MEXICO ──────────────────────────────────────────────────────────────
  { id: 'mx-1', category: 'safety', titleKey: 'localTips.tip.mx.1.title', descriptionKey: 'localTips.tip.mx.1.description', countryCode: 'MX' },
  { id: 'mx-2', category: 'money', titleKey: 'localTips.tip.mx.2.title', descriptionKey: 'localTips.tip.mx.2.description', countryCode: 'MX' },
  { id: 'mx-3', category: 'transport', titleKey: 'localTips.tip.mx.3.title', descriptionKey: 'localTips.tip.mx.3.description', countryCode: 'MX' },
  { id: 'mx-4', category: 'food', titleKey: 'localTips.tip.mx.4.title', descriptionKey: 'localTips.tip.mx.4.description', countryCode: 'MX' },
  { id: 'mx-5', category: 'culture', titleKey: 'localTips.tip.mx.5.title', descriptionKey: 'localTips.tip.mx.5.description', countryCode: 'MX' },
  { id: 'mx-6', category: 'utilities', titleKey: 'localTips.tip.mx.6.title', descriptionKey: 'localTips.tip.mx.6.description', countryCode: 'MX' },
  { id: 'mx-7', category: 'safety', titleKey: 'localTips.tip.mx.7.title', descriptionKey: 'localTips.tip.mx.7.description', countryCode: 'MX' },
  { id: 'mx-8', category: 'food', titleKey: 'localTips.tip.mx.8.title', descriptionKey: 'localTips.tip.mx.8.description', countryCode: 'MX' },

  // ─── USA ─────────────────────────────────────────────────────────────────
  { id: 'us-1', category: 'money', titleKey: 'localTips.tip.us.1.title', descriptionKey: 'localTips.tip.us.1.description', countryCode: 'US' },
  { id: 'us-2', category: 'transport', titleKey: 'localTips.tip.us.2.title', descriptionKey: 'localTips.tip.us.2.description', countryCode: 'US' },
  { id: 'us-3', category: 'safety', titleKey: 'localTips.tip.us.3.title', descriptionKey: 'localTips.tip.us.3.description', countryCode: 'US' },
  { id: 'us-4', category: 'food', titleKey: 'localTips.tip.us.4.title', descriptionKey: 'localTips.tip.us.4.description', countryCode: 'US' },
  { id: 'us-5', category: 'utilities', titleKey: 'localTips.tip.us.5.title', descriptionKey: 'localTips.tip.us.5.description', countryCode: 'US' },
  { id: 'us-6', category: 'culture', titleKey: 'localTips.tip.us.6.title', descriptionKey: 'localTips.tip.us.6.description', countryCode: 'US' },

  // ─── SPAIN ───────────────────────────────────────────────────────────────
  { id: 'es-1', category: 'food', titleKey: 'localTips.tip.es.1.title', descriptionKey: 'localTips.tip.es.1.description', countryCode: 'ES' },
  { id: 'es-2', category: 'culture', titleKey: 'localTips.tip.es.2.title', descriptionKey: 'localTips.tip.es.2.description', countryCode: 'ES' },
  { id: 'es-3', category: 'transport', titleKey: 'localTips.tip.es.3.title', descriptionKey: 'localTips.tip.es.3.description', countryCode: 'ES' },
  { id: 'es-4', category: 'safety', titleKey: 'localTips.tip.es.4.title', descriptionKey: 'localTips.tip.es.4.description', countryCode: 'ES' },
  { id: 'es-5', category: 'money', titleKey: 'localTips.tip.es.5.title', descriptionKey: 'localTips.tip.es.5.description', countryCode: 'ES' },

  // ─── ITALY ───────────────────────────────────────────────────────────────
  { id: 'it-1', category: 'safety', titleKey: 'localTips.tip.it.1.title', descriptionKey: 'localTips.tip.it.1.description', countryCode: 'IT' },
  { id: 'it-2', category: 'transport', titleKey: 'localTips.tip.it.2.title', descriptionKey: 'localTips.tip.it.2.description', countryCode: 'IT' },
  { id: 'it-3', category: 'food', titleKey: 'localTips.tip.it.3.title', descriptionKey: 'localTips.tip.it.3.description', countryCode: 'IT' },
  { id: 'it-4', category: 'culture', titleKey: 'localTips.tip.it.4.title', descriptionKey: 'localTips.tip.it.4.description', countryCode: 'IT' },
  { id: 'it-5', category: 'money', titleKey: 'localTips.tip.it.5.title', descriptionKey: 'localTips.tip.it.5.description', countryCode: 'IT' },

  // ─── JAPAN ───────────────────────────────────────────────────────────────
  { id: 'jp-1', category: 'transport', titleKey: 'localTips.tip.jp.1.title', descriptionKey: 'localTips.tip.jp.1.description', countryCode: 'JP' },
  { id: 'jp-2', category: 'culture', titleKey: 'localTips.tip.jp.2.title', descriptionKey: 'localTips.tip.jp.2.description', countryCode: 'JP' },
  { id: 'jp-3', category: 'money', titleKey: 'localTips.tip.jp.3.title', descriptionKey: 'localTips.tip.jp.3.description', countryCode: 'JP' },
  { id: 'jp-4', category: 'food', titleKey: 'localTips.tip.jp.4.title', descriptionKey: 'localTips.tip.jp.4.description', countryCode: 'JP' },
  { id: 'jp-5', category: 'utilities', titleKey: 'localTips.tip.jp.5.title', descriptionKey: 'localTips.tip.jp.5.description', countryCode: 'JP' },

  // ─── FRANCE ──────────────────────────────────────────────────────────────
  { id: 'fr-1', category: 'culture', titleKey: 'localTips.tip.fr.1.title', descriptionKey: 'localTips.tip.fr.1.description', countryCode: 'FR' },
  { id: 'fr-2', category: 'food', titleKey: 'localTips.tip.fr.2.title', descriptionKey: 'localTips.tip.fr.2.description', countryCode: 'FR' },
  { id: 'fr-3', category: 'transport', titleKey: 'localTips.tip.fr.3.title', descriptionKey: 'localTips.tip.fr.3.description', countryCode: 'FR' },
  { id: 'fr-4', category: 'safety', titleKey: 'localTips.tip.fr.4.title', descriptionKey: 'localTips.tip.fr.4.description', countryCode: 'FR' },
  { id: 'fr-5', category: 'money', titleKey: 'localTips.tip.fr.5.title', descriptionKey: 'localTips.tip.fr.5.description', countryCode: 'FR' },

  // ─── GERMANY ─────────────────────────────────────────────────────────────
  { id: 'de-1', category: 'transport', titleKey: 'localTips.tip.de.1.title', descriptionKey: 'localTips.tip.de.1.description', countryCode: 'DE' },
  { id: 'de-2', category: 'culture', titleKey: 'localTips.tip.de.2.title', descriptionKey: 'localTips.tip.de.2.description', countryCode: 'DE' },
  { id: 'de-3', category: 'money', titleKey: 'localTips.tip.de.3.title', descriptionKey: 'localTips.tip.de.3.description', countryCode: 'DE' },
  { id: 'de-4', category: 'food', titleKey: 'localTips.tip.de.4.title', descriptionKey: 'localTips.tip.de.4.description', countryCode: 'DE' },
  { id: 'de-5', category: 'utilities', titleKey: 'localTips.tip.de.5.title', descriptionKey: 'localTips.tip.de.5.description', countryCode: 'DE' },

  // ─── UK ──────────────────────────────────────────────────────────────────
  { id: 'gb-1', category: 'transport', titleKey: 'localTips.tip.gb.1.title', descriptionKey: 'localTips.tip.gb.1.description', countryCode: 'GB' },
  { id: 'gb-2', category: 'money', titleKey: 'localTips.tip.gb.2.title', descriptionKey: 'localTips.tip.gb.2.description', countryCode: 'GB' },
  { id: 'gb-3', category: 'culture', titleKey: 'localTips.tip.gb.3.title', descriptionKey: 'localTips.tip.gb.3.description', countryCode: 'GB' },
  { id: 'gb-4', category: 'food', titleKey: 'localTips.tip.gb.4.title', descriptionKey: 'localTips.tip.gb.4.description', countryCode: 'GB' },
  { id: 'gb-5', category: 'utilities', titleKey: 'localTips.tip.gb.5.title', descriptionKey: 'localTips.tip.gb.5.description', countryCode: 'GB' },

  // ─── THAILAND ────────────────────────────────────────────────────────────
  { id: 'th-1', category: 'culture', titleKey: 'localTips.tip.th.1.title', descriptionKey: 'localTips.tip.th.1.description', countryCode: 'TH' },
  { id: 'th-2', category: 'safety', titleKey: 'localTips.tip.th.2.title', descriptionKey: 'localTips.tip.th.2.description', countryCode: 'TH' },
  { id: 'th-3', category: 'money', titleKey: 'localTips.tip.th.3.title', descriptionKey: 'localTips.tip.th.3.description', countryCode: 'TH' },
  { id: 'th-4', category: 'food', titleKey: 'localTips.tip.th.4.title', descriptionKey: 'localTips.tip.th.4.description', countryCode: 'TH' },
  { id: 'th-5', category: 'transport', titleKey: 'localTips.tip.th.5.title', descriptionKey: 'localTips.tip.th.5.description', countryCode: 'TH' },

  // ─── ARGENTINA ───────────────────────────────────────────────────────────
  { id: 'ar-1', category: 'money', titleKey: 'localTips.tip.ar.1.title', descriptionKey: 'localTips.tip.ar.1.description', countryCode: 'AR' },
  { id: 'ar-2', category: 'food', titleKey: 'localTips.tip.ar.2.title', descriptionKey: 'localTips.tip.ar.2.description', countryCode: 'AR' },
  { id: 'ar-3', category: 'culture', titleKey: 'localTips.tip.ar.3.title', descriptionKey: 'localTips.tip.ar.3.description', countryCode: 'AR' },
  { id: 'ar-4', category: 'safety', titleKey: 'localTips.tip.ar.4.title', descriptionKey: 'localTips.tip.ar.4.description', countryCode: 'AR' },
  { id: 'ar-5', category: 'transport', titleKey: 'localTips.tip.ar.5.title', descriptionKey: 'localTips.tip.ar.5.description', countryCode: 'AR' },

  // ─── COLOMBIA ────────────────────────────────────────────────────────────
  { id: 'co-1', category: 'safety', titleKey: 'localTips.tip.co.1.title', descriptionKey: 'localTips.tip.co.1.description', countryCode: 'CO' },
  { id: 'co-2', category: 'food', titleKey: 'localTips.tip.co.2.title', descriptionKey: 'localTips.tip.co.2.description', countryCode: 'CO' },
  { id: 'co-3', category: 'money', titleKey: 'localTips.tip.co.3.title', descriptionKey: 'localTips.tip.co.3.description', countryCode: 'CO' },
  { id: 'co-4', category: 'culture', titleKey: 'localTips.tip.co.4.title', descriptionKey: 'localTips.tip.co.4.description', countryCode: 'CO' },
  { id: 'co-5', category: 'transport', titleKey: 'localTips.tip.co.5.title', descriptionKey: 'localTips.tip.co.5.description', countryCode: 'CO' },

  // ─── BRAZIL ──────────────────────────────────────────────────────────────
  { id: 'br-1', category: 'safety', titleKey: 'localTips.tip.br.1.title', descriptionKey: 'localTips.tip.br.1.description', countryCode: 'BR' },
  { id: 'br-2', category: 'money', titleKey: 'localTips.tip.br.2.title', descriptionKey: 'localTips.tip.br.2.description', countryCode: 'BR' },
  { id: 'br-3', category: 'food', titleKey: 'localTips.tip.br.3.title', descriptionKey: 'localTips.tip.br.3.description', countryCode: 'BR' },
  { id: 'br-4', category: 'culture', titleKey: 'localTips.tip.br.4.title', descriptionKey: 'localTips.tip.br.4.description', countryCode: 'BR' },
  { id: 'br-5', category: 'transport', titleKey: 'localTips.tip.br.5.title', descriptionKey: 'localTips.tip.br.5.description', countryCode: 'BR' },

  // ─── AUSTRALIA ───────────────────────────────────────────────────────────
  { id: 'au-1', category: 'safety', titleKey: 'localTips.tip.au.1.title', descriptionKey: 'localTips.tip.au.1.description', countryCode: 'AU' },
  { id: 'au-2', category: 'culture', titleKey: 'localTips.tip.au.2.title', descriptionKey: 'localTips.tip.au.2.description', countryCode: 'AU' },
  { id: 'au-3', category: 'money', titleKey: 'localTips.tip.au.3.title', descriptionKey: 'localTips.tip.au.3.description', countryCode: 'AU' },
  { id: 'au-4', category: 'food', titleKey: 'localTips.tip.au.4.title', descriptionKey: 'localTips.tip.au.4.description', countryCode: 'AU' },
  { id: 'au-5', category: 'utilities', titleKey: 'localTips.tip.au.5.title', descriptionKey: 'localTips.tip.au.5.description', countryCode: 'AU' },

  // ─── PERU ────────────────────────────────────────────────────────────────
  { id: 'pe-1', category: 'safety', titleKey: 'localTips.tip.pe.1.title', descriptionKey: 'localTips.tip.pe.1.description', countryCode: 'PE' },
  { id: 'pe-2', category: 'culture', titleKey: 'localTips.tip.pe.2.title', descriptionKey: 'localTips.tip.pe.2.description', countryCode: 'PE' },
  { id: 'pe-3', category: 'food', titleKey: 'localTips.tip.pe.3.title', descriptionKey: 'localTips.tip.pe.3.description', countryCode: 'PE' },
  { id: 'pe-4', category: 'money', titleKey: 'localTips.tip.pe.4.title', descriptionKey: 'localTips.tip.pe.4.description', countryCode: 'PE' },
  { id: 'pe-5', category: 'transport', titleKey: 'localTips.tip.pe.5.title', descriptionKey: 'localTips.tip.pe.5.description', countryCode: 'PE' },

  // ─── GENERIC (shown for any destination) ─────────────────────────────────
  { id: 'gen-1', category: 'money', titleKey: 'localTips.tip.gen.1.title', descriptionKey: 'localTips.tip.gen.1.description' },
  { id: 'gen-2', category: 'safety', titleKey: 'localTips.tip.gen.2.title', descriptionKey: 'localTips.tip.gen.2.description' },
  { id: 'gen-3', category: 'utilities', titleKey: 'localTips.tip.gen.3.title', descriptionKey: 'localTips.tip.gen.3.description' },
  { id: 'gen-4', category: 'transport', titleKey: 'localTips.tip.gen.4.title', descriptionKey: 'localTips.tip.gen.4.description' },
  { id: 'gen-5', category: 'culture', titleKey: 'localTips.tip.gen.5.title', descriptionKey: 'localTips.tip.gen.5.description' },
];
