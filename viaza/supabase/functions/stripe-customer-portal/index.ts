import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { createSupabaseClientForRequest } from '../_shared/supabase.ts';
import { requireEnv } from '../_shared/env.ts';

type Body = { return_url?: string };

function formEncode(obj: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) params.set(k, v);
  return params.toString();
}

async function stripeGet(params: { path: string }) {
  const stripeKey = requireEnv('STRIPE_SECRET_KEY');
  const res = await fetch(`https://api.stripe.com/v1${params.path}`, {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });
  const json = await res.json().catch(() => ({})) as Record<string, unknown>;
  if (!res.ok) {
    const msg = (json['error'] as { message?: string } | undefined)?.message;
    throw new Error(msg ?? `Stripe error ${res.status}`);
  }
  return json;
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
    const return_url = body.return_url ?? `${appUrl}/premium`;

    const { data: payments, error: payErr } = await supabase
      .from('payments')
      .select('provider_customer_id, provider, status, created_at')
      .eq('user_id', auth.user.id)
      .eq('provider', 'stripe')
      .not('provider_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (payErr) return jsonResponse({ ok: false, error: payErr.message }, { status: 400 });

    let customerId = payments?.[0]?.provider_customer_id as string | undefined;
    // Fallback robusto: si no hay payments (webhook no corrió / datos viejos),
    // buscar customer por email en Stripe.
    if (!customerId) {
      const email = auth.user.email;
      if (email) {
        const encoded = new URLSearchParams({ email, limit: '1' }).toString();
        const customers = await stripeGet({ path: `/customers?${encoded}` });
        const list = (customers['data'] as Array<{ id: string }> | undefined) ?? [];
        customerId = list[0]?.id;
      }
    }
    if (!customerId) return jsonResponse({ ok: false, error: 'No stripe customer found' }, { status: 404 });

    const stripeKey = requireEnv('STRIPE_SECRET_KEY');
    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formEncode({ customer: customerId, return_url }),
    });

    const json = await res.json() as { url?: string; error?: { message?: string } };
    if (!res.ok || !json.url) {
      return jsonResponse({ ok: false, error: json.error?.message ?? 'Stripe error' }, { status: 400 });
    }

    return jsonResponse({ ok: true, portal_url: json.url });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});
