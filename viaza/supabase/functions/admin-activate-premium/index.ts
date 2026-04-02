/**
 * admin-activate-premium
 * ----------------------
 * Busca todos los pagos completados (status = 'completed') en la tabla `payments`
 * y actualiza `profiles.plan = 'premium'` para esos usuarios.
 *
 * Protección: requiere header `x-admin-secret` igual a la variable de entorno ADMIN_SECRET.
 * Si no existe ADMIN_SECRET, rechaza toda petición por seguridad.
 *
 * Uso:
 *   curl -X POST https://<project>.supabase.co/functions/v1/admin-activate-premium \
 *     -H "x-admin-secret: TU_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"user_id": "UUID_OPCIONAL"}'   # opcional: activar solo un usuario
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createSupabaseServiceClient } from '../_shared/supabase_service.ts';
import { handleOptions, jsonResponse } from '../_shared/cors.ts';

serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  // ── Autenticación por secret ────────────────────────────────────────────────
  const adminSecret = Deno.env.get('ADMIN_SECRET') ?? '';
  if (!adminSecret) {
    return jsonResponse({ ok: false, error: 'ADMIN_SECRET not configured' }, { status: 500 });
  }
  const provided = req.headers.get('x-admin-secret') ?? '';
  if (provided !== adminSecret) {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // ── Body opcional: { user_id?: string, duration_days?: number } ────────────
  let body: Record<string, unknown> = {};
  try {
    const text = await req.text();
    if (text.trim()) body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    // body vacío es válido
  }
  const targetUserId = body['user_id'] ? String(body['user_id']) : null;
  const durationDays = Number(body['duration_days'] ?? 365);

  const supabase = createSupabaseServiceClient();

  // ── Buscar pagos completados ───────────────────────────────────────────────
  let paymentsQuery = supabase
    .from('payments')
    .select('user_id, plan_purchased, plan_duration_days, created_at')
    .eq('status', 'completed')
    .in('plan_purchased', ['premium', 'pro']);

  if (targetUserId) {
    paymentsQuery = paymentsQuery.eq('user_id', targetUserId);
  }

  const { data: payments, error: paymentsErr } = await paymentsQuery;
  if (paymentsErr) {
    return jsonResponse({ ok: false, error: paymentsErr.message }, { status: 400 });
  }
  if (!payments || payments.length === 0) {
    return jsonResponse({ ok: false, error: 'No completed payments found' }, { status: 404 });
  }

  // ── Agrupar por user_id (tomar el más reciente) ───────────────────────────
  const userMap = new Map<string, { plan: string; days: number }>();
  for (const p of payments) {
    const uid = String(p.user_id ?? '');
    if (!uid) continue;
    if (!userMap.has(uid)) {
      userMap.set(uid, {
        plan: String(p.plan_purchased ?? 'premium'),
        days: Number(p.plan_duration_days ?? durationDays),
      });
    }
  }

  const now = new Date();
  const results: Array<{ user_id: string; ok: boolean; error?: string; plan_expires_at?: string }> = [];

  for (const [userId, { days }] of userMap.entries()) {
    const plan_expires_at = new Date(now.getTime() + days * 86400000).toISOString();
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        plan: 'premium',
        plan_expires_at,
        updated_at: now.toISOString(),
      })
      .eq('id', userId);

    if (updateErr) {
      results.push({ user_id: userId, ok: false, error: updateErr.message });
    } else {
      results.push({ user_id: userId, ok: true, plan_expires_at });
    }
  }

  const allOk = results.every((r) => r.ok);
  return jsonResponse({ ok: allOk, updated: results });
});
