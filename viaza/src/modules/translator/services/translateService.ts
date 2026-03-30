import { supabase } from '../../../services/supabaseClient';

function decodeEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Mapa de códigos cortos → códigos de región que MyMemory entiende
const LANG_CODE_MAP: Record<string, string> = {
  es: 'es-MX', en: 'en-US', de: 'de-DE', fr: 'fr-FR', pt: 'pt-BR',
  it: 'it-IT', ja: 'ja-JP', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar-SA',
  ru: 'ru-RU', nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR', th: 'th-TH',
};

function toLangCode(code: string): string {
  return LANG_CODE_MAP[code.toLowerCase()] ?? code;
}

async function translateWithMyMemory(params: { text: string; from: string; to: string }): Promise<string> {
  const { text, from, to } = params;
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${toLangCode(from)}|${toLangCode(to)}`);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`MyMemory error ${res.status}`);
  const json = await res.json() as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };

  // MyMemory devuelve status 200 pero con QUERY LENGTH LIMIT o basura si falla
  const translated = decodeEntities(String(json.responseData?.translatedText ?? '').trim());
  if (
    !translated ||
    translated.toUpperCase() === text.toUpperCase() ||
    translated.startsWith('QUERY') ||
    json.responseStatus === 403
  ) {
    throw new Error('MyMemory returned invalid result');
  }
  return translated;
}

// Fallback secundario: LibreTranslate instancia pública
async function translateWithLibre(params: { text: string; from: string; to: string }): Promise<string> {
  const res = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: params.text, source: params.from, target: params.to, format: 'text' }),
  });
  if (!res.ok) throw new Error(`LibreTranslate error ${res.status}`);
  const json = await res.json() as { translatedText?: string; error?: string };
  if (json.error || !json.translatedText) throw new Error('LibreTranslate empty');
  return json.translatedText.trim();
}

export async function translateText(params: { text: string; from: string; to: string }): Promise<string> {
  const { text, from, to } = params;
  const cleaned = text.trim();
  if (!cleaned) return '';
  if (from === to) return cleaned;

  // 1. Intentar con ai-orchestrator (Supabase Edge)
  try {
    const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
      body: { task_type: 'translation', payload: { text: cleaned, from, to } },
    });
    if (!error) {
      const translated = (data as { result?: { translatedText?: string } } | null)?.result?.translatedText?.trim();
      if (translated && translated.toLowerCase() !== cleaned.toLowerCase()) return translated;
    }
  } catch { /* ignorar, seguir con fallbacks */ }

  // 2. MyMemory (gratuito, sin key)
  try {
    return await translateWithMyMemory({ text: cleaned.slice(0, 500), from, to });
  } catch { /* ignorar */ }

  // 3. LibreTranslate (instancia pública)
  try {
    return await translateWithLibre({ text: cleaned.slice(0, 500), from, to });
  } catch { /* ignorar */ }

  throw new Error('No se pudo traducir. Revisa tu conexión.');
}

