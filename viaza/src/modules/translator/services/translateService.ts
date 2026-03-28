import { supabase } from '../../../services/supabaseClient';

function decodeEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function translateWithMyMemory(params: { text: string; from: string; to: string }): Promise<string> {
  const { text, from, to } = params;
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${from}|${to}`);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Translate fallback error ${res.status}`);
  const json = await res.json() as { responseData?: { translatedText?: string } };
  return decodeEntities(String(json.responseData?.translatedText ?? '').trim());
}

export async function translateText(params: { text: string; from: string; to: string }): Promise<string> {
  const { text, from, to } = params;
  const cleaned = text.trim();
  if (!cleaned) return '';
  if (from === to) return cleaned;

  try {
    const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
      body: { task_type: 'translation', payload: { text: cleaned, from, to } },
    });

    if (error) throw error;
    const translated = (data as { result?: { translatedText?: string } } | null)?.result?.translatedText?.trim();
    if (translated) return translated;
  } catch {
    // fallback handled below
  }

  const fallback = await translateWithMyMemory({ text: cleaned.slice(0, 2000), from, to });
  return fallback || '';
}
