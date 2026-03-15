// @ts-ignore deno url
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { requireEnv } from '../_shared/env.ts';

type Body = {
  input: string;
  language?: string;
  countryCode?: string;
  sessionToken?: string;
};

serve(async (req: Request) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const { input, language = 'es', countryCode, sessionToken } = (await req.json()) as Body;
    if (!input || input.trim().length < 2) {
      return jsonResponse({ ok: true, predictions: [] });
    }

    const key = requireEnv('GOOGLE_MAPS_SERVER_API_KEY');

    // Places API New — v1/places:autocomplete
    const body: Record<string, unknown> = {
      input: input.trim(),
      languageCode: language,
      includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
    };
    if (countryCode) body.includedRegionCodes = [countryCode.toLowerCase()];
    if (sessionToken) body.sessionToken = sessionToken;

    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json() as {
      error?: { message?: string; status?: string };
      suggestions?: Array<{
        placePrediction?: {
          placeId: string;
          text?: { text: string };
          structuredFormat?: {
            mainText?: { text: string };
            secondaryText?: { text: string };
          };
        };
      }>;
    };

    if (!res.ok || data.error) {
      console.error('[places-autocomplete] Google error:', data.error);
      return jsonResponse(
        { ok: false, error: data.error?.message ?? `Places error (${res.status})` },
        { status: 400 }
      );
    }

    const predictions = (data.suggestions ?? []).slice(0, 6).map((s) => {
      const p = s.placePrediction!;
      return {
        place_id: p.placeId,
        description: p.text?.text ?? '',
        structured_formatting: {
          main_text: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
          secondary_text: p.structuredFormat?.secondaryText?.text ?? '',
        },
      };
    });

    return jsonResponse({ ok: true, predictions });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
