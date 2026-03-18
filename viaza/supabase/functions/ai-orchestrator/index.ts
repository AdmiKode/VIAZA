import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';
import { requireAuth, requirePremium } from '../_shared/premium.ts';

type TaskType =
  | 'translation'
  | 'boarding_pass_ocr'
  | 'document_ocr'
  | 'reservation_parse'
  | 'luggage_analysis'
  | 'reviews_summary';

type Body = {
  task_type: TaskType;
  payload: Record<string, unknown>;
  trip_context?: Record<string, unknown>;
  language_context?: { app_lang?: string };
};

function langName(code: string) {
  const map: Record<string, string> = {
    es: 'Spanish',
    en: 'English',
    pt: 'Portuguese',
    fr: 'French',
    de: 'German',
  };
  return map[code] ?? code;
}

type Provider = 'openai' | 'anthropic' | 'groq';

function envProvider(name: string): Provider | null {
  const v = (Deno.env.get(name) ?? '').trim().toLowerCase();
  if (!v) return null;
  if (v === 'openai' || v === 'anthropic' || v === 'groq') return v;
  return null;
}

function hasEnv(name: string) {
  const v = Deno.env.get(name);
  return Boolean(v && v.trim());
}

function providerForTask(task: TaskType): Provider {
  // Override por tarea
  const override =
    envProvider(`AI_PROVIDER_${task.toUpperCase()}`) ??
    envProvider('AI_PROVIDER_DEFAULT');

  // Visión: Groq no soporta imágenes en OpenAI-compatible
  const isVision = task === 'boarding_pass_ocr' || task === 'document_ocr' || task === 'luggage_analysis';
  if (override) {
    if (isVision && override === 'groq') return hasEnv('OPENAI_API_KEY') ? 'openai' : 'anthropic';
    return override;
  }

  if (isVision) {
    if (hasEnv('OPENAI_API_KEY')) return 'openai';
    if (hasEnv('ANTHROPIC_API_KEY')) return 'anthropic';
    return 'openai';
  }

  // Texto: preferir Groq (rápido) si existe, si no Anthropic, si no OpenAI
  if (hasEnv('GROQ_API_KEY')) return 'groq';
  if (hasEnv('ANTHROPIC_API_KEY')) return 'anthropic';
  return 'openai';
}

function canUseAnyLLM() {
  return hasEnv('OPENAI_API_KEY') || hasEnv('ANTHROPIC_API_KEY') || hasEnv('GROQ_API_KEY');
}

async function myMemoryTranslate(params: { text: string; from: string; to: string }) {
  const { text, from, to } = params;
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${from}|${to}`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translate error ${res.status}`);
  const json = await res.json() as { responseData?: { translatedText?: string } };
  return String(json.responseData?.translatedText ?? '').trim();
}

async function openaiChat(params: {
  model: string;
  messages: Array<{ role: 'system' | 'user'; content: unknown }>;
  max_tokens: number;
  temperature: number;
}) {
  const key = requireEnv('OPENAI_API_KEY');
  const base = Deno.env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1';
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`OpenAI error ${res.status}: ${err || res.statusText}`);
  }
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return (json.choices?.[0]?.message?.content ?? '').trim();
}

async function groqChat(params: {
  model: string;
  messages: Array<{ role: 'system' | 'user'; content: unknown }>;
  max_tokens: number;
  temperature: number;
}) {
  const key = requireEnv('GROQ_API_KEY');
  const base = Deno.env.get('GROQ_BASE_URL') ?? 'https://api.groq.com/openai/v1';
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Groq error ${res.status}: ${err || res.statusText}`);
  }
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return (json.choices?.[0]?.message?.content ?? '').trim();
}

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  if (!dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mediaType: match[1], base64: match[2] };
}

async function anthropicMessage(params: {
  model: string;
  system: string;
  userContent: unknown;
  max_tokens: number;
  temperature: number;
}) {
  const key = requireEnv('ANTHROPIC_API_KEY');
  const base = Deno.env.get('ANTHROPIC_BASE_URL') ?? 'https://api.anthropic.com/v1';

  const content =
    typeof params.userContent === 'string'
      ? [{ type: 'text', text: params.userContent }]
      : params.userContent;

  const res = await fetch(`${base}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': Deno.env.get('ANTHROPIC_VERSION') ?? '2023-06-01',
    },
    body: JSON.stringify({
      model: params.model,
      system: params.system,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      messages: [
        { role: 'user', content },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Anthropic error ${res.status}: ${err || res.statusText}`);
  }

  const json = await res.json() as { content?: Array<{ type: string; text?: string }> };
  const blocks = json.content ?? [];
  return blocks.map((b) => (b.type === 'text' ? (b.text ?? '') : '')).join('').trim();
}

async function runLLM(params: {
  provider: Provider;
  model: string;
  system: string;
  userContent: unknown;
  max_tokens: number;
  temperature: number;
}) {
  const { provider, model, system, userContent, max_tokens, temperature } = params;
  if (provider === 'openai') {
    return openaiChat({
      model,
      max_tokens,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
    });
  }
  if (provider === 'groq') {
    // Groq OpenAI-compatible: solo texto
    if (Array.isArray(userContent)) throw new Error('Groq provider does not support vision content');
    return groqChat({
      model,
      max_tokens,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent },
      ],
    });
  }
  return anthropicMessage({
    model,
    system,
    userContent,
    max_tokens,
    temperature,
  });
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const authed = await requireAuth(req);
    if (authed instanceof Response) return authed;

    const body = (await req.json()) as Body;
    const { task_type, payload, trip_context, language_context } = body;
    if (!task_type) return jsonResponse({ ok: false, error: 'task_type is required' }, { status: 400 });

    const premium = await requirePremium(req);
    const isPremium = !(premium instanceof Response);

    const provider = providerForTask(task_type);
    const defaultOpenAIModel = Deno.env.get('OPENAI_MODEL_DEFAULT') ?? 'gpt-4.1-mini';
    const defaultAnthropicModel = Deno.env.get('ANTHROPIC_MODEL_DEFAULT') ?? 'claude-3-5-sonnet-latest';
    const defaultGroqModel = Deno.env.get('GROQ_MODEL_DEFAULT') ?? 'llama-3.1-70b-versatile';

    const defaultModel =
      provider === 'openai' ? defaultOpenAIModel :
      provider === 'anthropic' ? defaultAnthropicModel :
      defaultGroqModel;

    if (task_type === 'translation') {
      const text = String(payload.text ?? '').trim();
      const from = String(payload.from ?? '');
      const to = String(payload.to ?? '');
      if (!text || !from || !to) return jsonResponse({ ok: false, error: 'text/from/to required' }, { status: 400 });

      // Translator debe funcionar incluso sin premium o sin keys.
      // - Premium + keys: usa LLM
      // - No premium o sin keys: fallback MyMemory (gratis)
      let content = '';
      if (isPremium && canUseAnyLLM()) {
        const system = `You are a professional travel translator. Translate from ${langName(from)} to ${langName(to)}. Return ONLY the translated text.`;
        content = await runLLM({
          provider,
          model: defaultModel,
          temperature: 0.2,
          max_tokens: 500,
          system,
          userContent: text.slice(0, 4000),
        });
      } else {
        content = await myMemoryTranslate({ text: text.slice(0, 2000), from, to });
      }

      return jsonResponse({ ok: true, result: { translatedText: content } });
    }

    // Resto de tareas: premium requerido
    if (!isPremium) return premium;

    if (task_type === 'reservation_parse') {
      const text = String(payload.text ?? '').trim();
      if (!text) return jsonResponse({ ok: false, error: 'text required' }, { status: 400 });

      const system = `Eres un asistente de viaje. El usuario te pegará texto de una confirmación de reserva.
Extrae la información y devuelve SOLO un JSON válido con estos campos:
{
  "type": "flight" | "hotel" | "activity" | "place" | "transport" | "meal" | "free",
  "title": "string breve",
  "description": "string opcional",
  "startTime": "HH:MM o null",
  "endTime": "HH:MM o null",
  "confirmationCode": "string o null",
  "rawDate": "string o null"
}
No incluyas nada más que el JSON.`;

      const raw = await runLLM({
        provider,
        model: defaultModel,
        temperature: 0,
        max_tokens: 500,
        system,
        userContent: text.slice(0, 4000),
      });

      return jsonResponse({ ok: true, result: { raw } });
    }

    if (task_type === 'reviews_summary') {
      const reviewsText = String(payload.reviews_text ?? '').trim();
      const appLang = String(language_context?.app_lang ?? 'es');
      if (!reviewsText) return jsonResponse({ ok: false, error: 'reviews_text required' }, { status: 400 });

      const context = trip_context ? JSON.stringify(trip_context).slice(0, 1200) : '';
      const system = `You summarize travel reviews into actionable insights. Write in ${langName(appLang)}. Keep it short and operational.`;
      const user = `Context: ${context}\n\nReviews:\n${reviewsText.slice(0, 12000)}`;

      const summary = await runLLM({
        provider,
        model: defaultModel,
        temperature: 0.3,
        max_tokens: 350,
        system,
        userContent: user,
      });

      return jsonResponse({ ok: true, result: { summary } });
    }

    if (task_type === 'boarding_pass_ocr') {
      const imageDataUrl = String(payload.imageDataUrl ?? '');
      const mimeType = String(payload.mimeType ?? 'image/jpeg');
      if (!imageDataUrl) return jsonResponse({ ok: false, error: 'imageDataUrl required' }, { status: 400 });

      const model =
        provider === 'openai'
          ? (Deno.env.get('OPENAI_MODEL_VISION') ?? 'gpt-4o')
          : (Deno.env.get('ANTHROPIC_MODEL_VISION') ?? defaultAnthropicModel);

      const system = `Eres un asistente especializado en leer pases de abordar. Responde ÚNICAMENTE con JSON válido con claves:
passengerName, flightNumber, airline, originIata, originCity, destinationIata, destinationCity, departureDate, departureTime, boardingTime, gate, terminal, seat, bookingRef, rawText.
Usa null si falta un campo.`;

      const finalDataUrl = imageDataUrl.startsWith('data:') ? imageDataUrl : `data:${mimeType};base64,${imageDataUrl}`;
      const parsed = parseDataUrl(finalDataUrl);

      const userContent =
        provider === 'anthropic'
          ? [
              parsed
                ? { type: 'image', source: { type: 'base64', media_type: parsed.mediaType, data: parsed.base64 } }
                : { type: 'text', text: 'Imagen inválida' },
              { type: 'text', text: 'Extrae todos los datos del pase de abordar.' },
            ]
          : [
              { type: 'image_url', image_url: { url: finalDataUrl, detail: 'high' } },
              { type: 'text', text: 'Extrae todos los datos del pase de abordar.' },
            ];

      const content = await runLLM({
        provider,
        model,
        temperature: 0,
        max_tokens: 900,
        system,
        userContent,
      });

      return jsonResponse({ ok: true, result: { raw: content } });
    }

    if (task_type === 'document_ocr') {
      const imageDataUrl = String(payload.imageDataUrl ?? '');
      const mimeType = String(payload.mimeType ?? 'image/jpeg');
      if (!imageDataUrl) return jsonResponse({ ok: false, error: 'imageDataUrl required' }, { status: 400 });

      const model =
        provider === 'openai'
          ? (Deno.env.get('OPENAI_MODEL_VISION') ?? 'gpt-4o-mini')
          : (Deno.env.get('ANTHROPIC_MODEL_VISION') ?? defaultAnthropicModel);

      const system = `You extract all visible text from travel documents (tickets, reservations, insurance, confirmations). Return ONLY the extracted text. No markdown.`;

      const finalDataUrl = imageDataUrl.startsWith('data:') ? imageDataUrl : `data:${mimeType};base64,${imageDataUrl}`;
      const parsed = parseDataUrl(finalDataUrl);

      const userContent =
        provider === 'anthropic'
          ? [
              parsed
                ? { type: 'image', source: { type: 'base64', media_type: parsed.mediaType, data: parsed.base64 } }
                : { type: 'text', text: 'Invalid image' },
              { type: 'text', text: 'Extract all visible text.' },
            ]
          : [
              { type: 'image_url', image_url: { url: finalDataUrl, detail: 'high' } },
              { type: 'text', text: 'Extract all visible text.' },
            ];

      const text = await runLLM({
        provider,
        model,
        temperature: 0,
        max_tokens: 1200,
        system,
        userContent,
      });

      return jsonResponse({ ok: true, result: { text } });
    }

    if (task_type === 'luggage_analysis') {
      const imageDataUrl = String(payload.imageDataUrl ?? '');
      const luggageSize = String(payload.luggageSize ?? '');
      const appLang = String(language_context?.app_lang ?? 'es');
      if (!imageDataUrl || !luggageSize) return jsonResponse({ ok: false, error: 'imageDataUrl and luggageSize required' }, { status: 400 });

      const model =
        provider === 'openai'
          ? (Deno.env.get('OPENAI_MODEL_VISION') ?? 'gpt-4o-mini')
          : (Deno.env.get('ANTHROPIC_MODEL_VISION') ?? defaultAnthropicModel);

      const system = `You are an expert luggage organizer. Write in ${langName(appLang)}. Be concise and practical.`;
      const user = `Suitcase size: ${luggageSize}. Analyze the open suitcase photo and recommend arrangement by zones: left, right, center/bottom, quick access pockets, and one customs tip.`;

      const parsed = parseDataUrl(imageDataUrl);
      const userContent =
        provider === 'anthropic'
          ? [
              parsed
                ? { type: 'image', source: { type: 'base64', media_type: parsed.mediaType, data: parsed.base64 } }
                : { type: 'text', text: 'Imagen inválida' },
              { type: 'text', text: user },
            ]
          : [
              { type: 'text', text: user },
              { type: 'image_url', image_url: { url: imageDataUrl, detail: 'low' } },
            ];

      const suggestion = await runLLM({
        provider,
        model,
        temperature: 0.3,
        max_tokens: 650,
        system,
        userContent,
      });

      return jsonResponse({ ok: true, result: { suggestion } });
    }

    return jsonResponse({ ok: false, error: `Unsupported task_type: ${task_type}` }, { status: 400 });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
