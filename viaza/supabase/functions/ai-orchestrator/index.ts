import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';
import { requireAuth, requirePremium } from '../_shared/premium.ts';

type TaskType =
  | 'translation'
  | 'boarding_pass_ocr'
  | 'document_ocr'
  | 'wallet_doc_parse'
  | 'reservation_parse'
  | 'luggage_analysis'
  | 'packing_validation_scan'
  | 'suitcase_layout_plan'
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
  const isVision =
    task === 'boarding_pass_ocr'
    || task === 'document_ocr'
    || task === 'luggage_analysis'
    || task === 'packing_validation_scan';
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

function parseJsonObjectFromText(text: string): Record<string, unknown> | null {
  const clean = text.trim();
  if (!clean) return null;

  try {
    const parsed = JSON.parse(clean) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // continue
  }

  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = clean.slice(start, end + 1);
  try {
    const parsed = JSON.parse(candidate) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
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

    // ─── wallet_doc_parse ────────────────────────────────────────────────────
    // OCR estructurado para documentos de identidad y viaje en el Wallet.
    // Retorna JSON con doc_type, full_name, doc_number, expiration_date,
    // issuing_country, nationality y raw_text.
    if (task_type === 'wallet_doc_parse') {
      const imageDataUrl = String(payload.imageDataUrl ?? '');
      const mimeType = String(payload.mimeType ?? 'image/jpeg');
      if (!imageDataUrl) return jsonResponse({ ok: false, error: 'imageDataUrl required' }, { status: 400 });

      const model =
        provider === 'openai'
          ? (Deno.env.get('OPENAI_MODEL_VISION') ?? 'gpt-4o-mini')
          : (Deno.env.get('ANTHROPIC_MODEL_VISION') ?? defaultAnthropicModel);

      const system = `You are a travel document OCR specialist. Analyze the image and extract structured data from travel or identity documents (passports, visas, IDs, driver licenses, insurance cards, vaccination certificates, travel permits).

Return ONLY a valid JSON object with these exact keys (use null for missing fields):
{
  "doc_type": "passport" | "id_card" | "visa" | "driver_license" | "insurance" | "vaccination" | "travel_permit" | "other",
  "full_name": "string or null",
  "doc_number": "string or null",
  "expiration_date": "YYYY-MM-DD or null",
  "issue_date": "YYYY-MM-DD or null",
  "issuing_country": "ISO 3166-1 alpha-2 or null",
  "nationality": "ISO 3166-1 alpha-2 or null",
  "date_of_birth": "YYYY-MM-DD or null",
  "raw_text": "all visible text on the document"
}

CRITICAL: expiration_date MUST be in YYYY-MM-DD format. If you see a date like "15 MAR 2028" convert it to "2028-03-15". Return ONLY the JSON, no markdown, no explanation.`;

      const finalDataUrl = imageDataUrl.startsWith('data:') ? imageDataUrl : `data:${mimeType};base64,${imageDataUrl}`;
      const parsedUrl = parseDataUrl(finalDataUrl);

      const userContent =
        provider === 'anthropic'
          ? [
              parsedUrl
                ? { type: 'image', source: { type: 'base64', media_type: parsedUrl.mediaType, data: parsedUrl.base64 } }
                : { type: 'text', text: 'Invalid image' },
              { type: 'text', text: 'Extract all structured data from this travel document.' },
            ]
          : [
              { type: 'image_url', image_url: { url: finalDataUrl, detail: 'high' } },
              { type: 'text', text: 'Extract all structured data from this travel document.' },
            ];

      const raw = await runLLM({
        provider,
        model,
        temperature: 0,
        max_tokens: 800,
        system,
        userContent,
      });

      // Intentar parsear el JSON — si falla, devolver raw para que el cliente lo maneje
      let structured: Record<string, unknown> | null = null;
      try {
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        structured = JSON.parse(cleaned);
      } catch {
        structured = null;
      }

      return jsonResponse({ ok: true, result: { structured, raw } });
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

    if (task_type === 'packing_validation_scan') {
      const imageDataUrl = String(payload.imageDataUrl ?? '');
      const luggageType = String(payload.luggageType ?? 'checked');
      const appLang = String(language_context?.app_lang ?? 'es');
      const checklist = Array.isArray(payload.checklist_items) ? payload.checklist_items : [];
      if (!imageDataUrl) return jsonResponse({ ok: false, error: 'imageDataUrl required' }, { status: 400 });

      const model =
        provider === 'openai'
          ? (Deno.env.get('OPENAI_MODEL_VISION') ?? 'gpt-4o-mini')
          : (Deno.env.get('ANTHROPIC_MODEL_VISION') ?? defaultAnthropicModel);

      const checklistJson = JSON.stringify(checklist).slice(0, 12000);
      const system = `You are a packing validation engine. Reply ONLY valid JSON in ${langName(appLang)}.`;
      const user = `Analyze the luggage photo and compare against this checklist JSON:
${checklistJson}

Luggage type: ${luggageType}

Return ONLY this JSON shape:
{
  "detected": [
    {
      "detected_label": "string",
      "normalized_label": "string",
      "confidence": 0.0,
      "quantity_detected": 1,
      "match_status": "matched|duplicate|extra|uncertain",
      "packing_item_id": "uuid or null"
    }
  ],
  "summary": {
    "completion_pct": 0,
    "missing_count": 0,
    "duplicate_count": 0,
    "uncertain_count": 0,
    "extra_count": 0,
    "confidence_avg": 0
  },
  "missing_packing_item_ids": ["uuid"],
  "notes": "short practical note"
}`;

      const parsedDataUrl = parseDataUrl(imageDataUrl);
      const userContent =
        provider === 'anthropic'
          ? [
              parsedDataUrl
                ? { type: 'image', source: { type: 'base64', media_type: parsedDataUrl.mediaType, data: parsedDataUrl.base64 } }
                : { type: 'text', text: 'Imagen invalida' },
              { type: 'text', text: user },
            ]
          : [
              { type: 'text', text: user },
              { type: 'image_url', image_url: { url: imageDataUrl, detail: 'low' } },
            ];

      const raw = await runLLM({
        provider,
        model,
        temperature: 0.1,
        max_tokens: 1500,
        system,
        userContent,
      });

      const parsed = parseJsonObjectFromText(raw);
      return jsonResponse({ ok: true, result: { raw, parsed } });
    }

    if (task_type === 'suitcase_layout_plan') {
      const appLang = String(language_context?.app_lang ?? 'es');
      const profile = payload.profile ?? {};
      const checklist = Array.isArray(payload.checklist_items) ? payload.checklist_items : [];
      const scanSummary = payload.scan_summary ?? {};
      const tripCtx = trip_context ?? {};

      const model =
        provider === 'openai'
          ? (Deno.env.get('OPENAI_MODEL_DEFAULT') ?? defaultOpenAIModel)
          : (provider === 'anthropic'
            ? defaultAnthropicModel
            : defaultGroqModel);

      const system = `You create operational suitcase layout plans. Reply ONLY valid JSON in ${langName(appLang)}.`;
      const user = `Build a practical suitcase layout plan.

Profile JSON: ${JSON.stringify(profile).slice(0, 3000)}
Checklist JSON: ${JSON.stringify(checklist).slice(0, 12000)}
Scan summary JSON: ${JSON.stringify(scanSummary).slice(0, 2000)}
Trip context JSON: ${JSON.stringify(tripCtx).slice(0, 2000)}

Return ONLY this JSON:
{
  "strategy_version": "v1",
  "layout": {
    "bottom": ["item"],
    "top": ["item"],
    "compartments": ["item"],
    "hand_bag": ["item"],
    "security_separated": ["item"],
    "fragile_separated": ["item"],
    "quick_access": ["item"]
  },
  "optimization_tips": ["tip"],
  "warnings": ["warning"],
  "notes": "short practical note"
}`;

      const raw = await runLLM({
        provider,
        model,
        temperature: 0.2,
        max_tokens: 1400,
        system,
        userContent: user,
      });

      const parsed = parseJsonObjectFromText(raw);
      return jsonResponse({ ok: true, result: { raw, parsed } });
    }

    return jsonResponse({ ok: false, error: `Unsupported task_type: ${task_type}` }, { status: 400 });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
