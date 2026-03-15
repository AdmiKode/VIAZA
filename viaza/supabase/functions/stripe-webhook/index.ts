import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createSupabaseServiceClient } from '../_shared/supabase_service.ts';
import { requireEnv } from '../_shared/env.ts';
import { jsonResponse, handleOptions } from '../_shared/cors.ts';

type StripeEvent = {
  type: string;
  data: { object: Record<string, unknown> };
};

async function stripeRetrieve(params: { path: string }) {
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

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}

async function verifyStripeSignature(params: {
  payload: string;
  signatureHeader: string;
  secret: string;
}) {
  const { payload, signatureHeader, secret } = params;
  const parts = signatureHeader.split(',').map((p) => p.trim());
  const tPart = parts.find((p) => p.startsWith('t='));
  const v1Part = parts.find((p) => p.startsWith('v1='));
  if (!tPart || !v1Part) throw new Error('Invalid Stripe signature header');

  const timestamp = tPart.slice(2);
  const v1 = v1Part.slice(3).toLowerCase();
  const signedPayload = `${timestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('').toLowerCase();

  const expected = new TextEncoder().encode(expectedHex);
  const provided = new TextEncoder().encode(v1);
  if (!timingSafeEqual(expected, provided)) throw new Error('Stripe signature verification failed');
}

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const secret = requireEnv('STRIPE_WEBHOOK_SECRET');
    const sigHeader = req.headers.get('Stripe-Signature');
    if (!sigHeader) return jsonResponse({ ok: false, error: 'Missing Stripe-Signature' }, { status: 400 });

    const payload = await req.text();
    await verifyStripeSignature({ payload, signatureHeader: sigHeader, secret });

    const event = JSON.parse(payload) as StripeEvent;
    const obj = event.data?.object ?? {};

    const supabase = createSupabaseServiceClient();

    // Para MVP: tratamos checkout.session.completed como pago mensual de Premium (30 días).
    if (event.type === 'checkout.session.completed') {
      const sessionId = String(obj['id'] ?? '');
      const amountTotal = Number(obj['amount_total'] ?? 0);
      const currency = String(obj['currency'] ?? 'mxn').toUpperCase();
      const customer = obj['customer'] ? String(obj['customer']) : null;
      const receiptUrl = obj['invoice'] ? `https://dashboard.stripe.com/test/invoices/${String(obj['invoice'])}` : null;

      const metadata = (obj['metadata'] as Record<string, unknown> | undefined) ?? {};
      const userId = String(metadata['user_id'] ?? obj['client_reference_id'] ?? '');
      if (!userId) return jsonResponse({ ok: false, error: 'Missing user_id metadata' }, { status: 400 });

      const { error } = await supabase
        .from('payments')
        .upsert(
          {
            user_id: userId,
            provider: 'stripe',
            provider_payment_id: sessionId,
            provider_customer_id: customer,
            amount: Math.round(amountTotal) / 100,
            currency,
            status: 'completed',
            plan_purchased: 'premium',
            plan_duration_days: 30,
            receipt_url: receiptUrl,
            metadata: obj,
          },
          { onConflict: 'provider_payment_id' }
        );

      if (error) return jsonResponse({ ok: false, error: error.message }, { status: 400 });
      return jsonResponse({ ok: true });
    }

    // Renovaciones / pagos recurrentes
    if (event.type === 'invoice.paid') {
      const invoiceId = String(obj['id'] ?? '');
      const amountPaid = Number(obj['amount_paid'] ?? 0);
      const currency = String(obj['currency'] ?? 'mxn').toUpperCase();
      const customer = obj['customer'] ? String(obj['customer']) : null;
      const hostedInvoiceUrl = obj['hosted_invoice_url'] ? String(obj['hosted_invoice_url']) : null;

      const subscriptionId = obj['subscription'] ? String(obj['subscription']) : '';
      let userId = '';

      const metadata = (obj['metadata'] as Record<string, unknown> | undefined) ?? {};
      if (metadata['user_id']) userId = String(metadata['user_id']);

      if (!userId && subscriptionId) {
        const sub = await stripeRetrieve({ path: `/subscriptions/${subscriptionId}` });
        const subMeta = (sub['metadata'] as Record<string, unknown> | undefined) ?? {};
        if (subMeta['user_id']) userId = String(subMeta['user_id']);
      }

      if (!userId) return jsonResponse({ ok: true, ignored: true, reason: 'missing_user_id' });

      const { error } = await supabase
        .from('payments')
        .upsert(
          {
            user_id: userId,
            provider: 'stripe',
            provider_payment_id: invoiceId,
            provider_customer_id: customer,
            amount: Math.round(amountPaid) / 100,
            currency,
            status: 'completed',
            plan_purchased: 'premium',
            plan_duration_days: 30,
            receipt_url: hostedInvoiceUrl,
            metadata: obj,
          },
          { onConflict: 'provider_payment_id' }
        );

      if (error) return jsonResponse({ ok: false, error: error.message }, { status: 400 });
      return jsonResponse({ ok: true });
    }

    // Cancelación / eliminación de suscripción
    if (event.type === 'customer.subscription.deleted') {
      const meta = (obj['metadata'] as Record<string, unknown> | undefined) ?? {};
      const userId = meta['user_id'] ? String(meta['user_id']) : '';
      if (!userId) return jsonResponse({ ok: true, ignored: true, reason: 'missing_user_id' });

      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'free', plan_expires_at: null, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) return jsonResponse({ ok: false, error: error.message }, { status: 400 });
      return jsonResponse({ ok: true });
    }

    // Placeholder: otros eventos se aceptan para no fallar retries
    return jsonResponse({ ok: true, ignored: true, type: event.type });
  } catch (e) {
    return jsonResponse({ ok: false, error: (e as Error).message ?? 'Unknown error' }, { status: 400 });
  }
});
