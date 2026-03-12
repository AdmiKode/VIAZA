const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const OPENAI_BASE = (import.meta.env.VITE_OPENAI_BASE_URL as string | undefined) ?? 'https://api.openai.com/v1';

const LANG_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', pt: 'Portuguese',
  fr: 'French',  de: 'German',  it: 'Italian',
  ja: 'Japanese', zh: 'Chinese', ko: 'Korean',
  ar: 'Arabic',  ru: 'Russian',
};

export async function translateText(params: { text: string; from: string; to: string }): Promise<string> {
  const { text, from, to } = params;
  const cleaned = text.trim();
  if (!cleaned) return '';

  const fromName = LANG_NAMES[from] ?? from;
  const toName   = LANG_NAMES[to]   ?? to;

  if (OPENAI_KEY) {
    try {
      const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional travel translator. Translate from ${fromName} to ${toName}. Return ONLY the translated text, no explanations, no quotes.`,
            },
            { role: 'user', content: cleaned },
          ],
          max_tokens: 500,
          temperature: 0.2,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const translated = (data.choices?.[0]?.message?.content as string | undefined)?.trim();
        if (translated) return translated;
      }
    } catch {
      // fall through to fallback
    }
  }

  // Fallback when no key
  await new Promise((r) => setTimeout(r, 120));
  return `${cleaned} [${to}]`;
}

