import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { createSupabaseClientForRequest } from '../_shared/supabase.ts';
import { requireEnv } from '../_shared/env.ts';

type Body = {
  success_url?: string;
  cancel_url?: string;
};

function formEncode(obj: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) params.set(k, v);
  return params.toString();
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const supabase = createSupabaseClientForRequest(req);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return jsonResponse({ ok: false, error: 'Not authenticated' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Body;
    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';
    const success_url = body.success_url ?? `${appUrl}/?premium=success`;
    const cancel_url = body.cancel_url ?? `${appUrl}/premium`;

    const stripeKey = requireEnv('STRIPE_SECRET_KEY');
    const priceId = requireEnv('STRIPE_PRICE_ID_PREMIUM_MXN_149_MONTHLY');

    const payload: Record<string, string> = {
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url,
      cancel_url,
      client_reference_id: auth.user.id,
      'metadata[user_id]': auth.user.id,
      'subscription_data[metadata][user_id]': auth.user.id,
      'subscription_data[metadata][plan]': 'premium',
    };
    if (auth.user.email) payload.customer_email = auth.user.email;

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formEncode(payload),
    });

    const json = await res.json() as { url?: string; error?: { message?: string } };
    if (!res.ok || !json.url) {
      return jsonResponse({ ok: false, error: json.error?.message ?? 'Stripe error' }, { status: 400 });
    }

    return jsonResponse({ ok: true, checkout_url: json.url });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
