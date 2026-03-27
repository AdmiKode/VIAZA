import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';
import { createSupabaseClientForRequest } from '../_shared/supabase.ts';
import { createSupabaseServiceClient } from '../_shared/supabase_service.ts';
import { requireEnv } from '../_shared/env.ts';

type StripeCustomer = { id: string };
type StripeSubscription = { id: string; status: string; current_period_end?: number | null };

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

function isActiveSubscription(sub: StripeSubscription, nowMs: number) {
  const status = String(sub.status ?? '').toLowerCase();
  if (status === 'active' || status === 'trialing') return true;
  // tolerancia: si aún tiene periodo vigente, damos acceso (p.ej. past_due)
  const end = Number(sub.current_period_end ?? 0) * 1000;
  if (end > nowMs && ['past_due', 'unpaid'].includes(status)) return true;
  return false;
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    if (req.method !== 'POST') return jsonResponse({ ok: false, error: 'Method not allowed' }, { status: 405 });

    const supabase = createSupabaseClientForRequest(req);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return jsonResponse({ ok: false, error: 'Not authenticated' }, { status: 401 });
    const email = auth.user.email;
    if (!email) return jsonResponse({ ok: false, error: 'Missing user email' }, { status: 400 });

    const service = createSupabaseServiceClient();

    // 1) Intentar obtener customer_id desde pagos previos (si existe)
    let customerId: string | null = null;
    try {
      const { data: payments } = await service
        .from('payments')
        .select('provider_customer_id, provider')
        .eq('user_id', auth.user.id)
        .eq('provider', 'stripe')
        .not('provider_customer_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
      const fromDb = (payments?.[0]?.provider_customer_id as string | undefined) ?? null;
      if (fromDb) customerId = fromDb;
    } catch {
      // ignore
    }

    // 2) Fallback: buscar customer por email en Stripe
    if (!customerId) {
      const encoded = new URLSearchParams({ email, limit: '1' }).toString();
      const customers = await stripeGet({ path: `/customers?${encoded}` });
      const list = (customers['data'] as StripeCustomer[] | undefined) ?? [];
      customerId = list[0]?.id ?? null;
    }

    if (!customerId) return jsonResponse({ ok: false, error: 'No Stripe customer found' }, { status: 404 });

    // 3) Leer suscripciones del customer
    const subsJson = await stripeGet({
      path: `/subscriptions?${new URLSearchParams({ customer: customerId, status: 'all', limit: '10' }).toString()}`,
    });
    const subs = (subsJson['data'] as StripeSubscription[] | undefined) ?? [];
    const nowMs = Date.now();

    // Preferir sub activa/trialing; si no, cualquiera con periodo vigente
    const active =
      subs.find((s) => ['active', 'trialing'].includes(String(s.status ?? '').toLowerCase()))
      ?? subs.find((s) => isActiveSubscription(s, nowMs))
      ?? null;

    if (!active) {
      // No hay suscripción vigente: no activar
      return jsonResponse({ ok: true, active: false });
    }

    const currentPeriodEndMs = Number(active.current_period_end ?? 0) * 1000;
    const plan_expires_at =
      Number.isFinite(currentPeriodEndMs) && currentPeriodEndMs > nowMs
        ? new Date(currentPeriodEndMs).toISOString()
        : new Date(nowMs + 30 * 86400000).toISOString();

    const { error: profErr } = await service
      .from('profiles')
      .update({ plan: 'premium', plan_expires_at, updated_at: new Date().toISOString() })
      .eq('id', auth.user.id);

    if (profErr) return jsonResponse({ ok: false, error: profErr.message }, { status: 400 });

    return jsonResponse({
      ok: true,
      active: true,
      plan: 'premium',
      plan_expires_at,
      stripe_customer_id: customerId,
      stripe_subscription_id: active.id,
      stripe_subscription_status: active.status,
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 500 });
  }
});

