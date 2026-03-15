import { supabase } from '../../../services/supabaseClient';

export async function translateText(params: { text: string; from: string; to: string }): Promise<string> {
  const { text, from, to } = params;
  const cleaned = text.trim();
  if (!cleaned) return '';

  const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
    body: { task_type: 'translation', payload: { text: cleaned, from, to } },
  });

  if (error) throw error;
  const translated = (data as { result?: { translatedText?: string } } | null)?.result?.translatedText?.trim();
  return translated || '';
}
