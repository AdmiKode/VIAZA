/**
 * premiumService.ts
 *
 * Seguridad:
 * - Web: Stripe Checkout Session creada en Supabase Edge Function.
 * - No se exponen API keys ni links sensibles en frontend.
 *
 * Nota:
 * - En este repo el foco actual de testers es Web (Vite/localhost).
 * - Flujos nativos (RevenueCat) se integran después si aplica.
 */

import { supabase } from './supabaseClient';

const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '') ?? window.location.origin;

export const isNative = false;

const LS_CHECKOUT_STARTED_AT = 'viaza_premium_checkout_started_at';

export async function initRevenueCat(): Promise<void> {
  return;
}

export async function checkPremiumStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Fuente de verdad (rápido y estable con RLS): `profiles.plan` + `profiles.plan_expires_at`.
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('plan,plan_expires_at')
    .eq('id', user.id)
    .maybeSingle();
  if (!profErr && profile) {
    const plan = String(profile.plan ?? 'free').toLowerCase();
    if (plan === 'premium') {
      if (!profile.plan_expires_at) return true;
      const active = new Date(profile.plan_expires_at).getTime() > Date.now();
      if (active) return true;
    }
  }

  // Fallback: vista calculada (si está disponible)
  const { data, error } = await supabase
    .from('user_subscription')
    .select('is_active_premium')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!error && data?.is_active_premium) return true;

  // Fallback extra: inferir Premium desde `payments` (último pago completado).
  try {
    const { data: p, error: payErr } = await supabase
      .from('payments')
      .select('created_at,plan_duration_days,status,plan_purchased')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .eq('plan_purchased', 'premium')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!payErr && p?.created_at) {
      const days = Number(p.plan_duration_days ?? 30);
      const start = new Date(String(p.created_at)).getTime();
      if (Number.isFinite(start) && start + days * 86400000 > Date.now()) return true;
    }
  } catch {
    // ignore
  }

  return false;
}

export async function syncPremiumFromStripe(): Promise<{ ok: boolean; active?: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { ok: false, error: 'Debes iniciar sesión' };
    const { data, error } = await supabase.functions.invoke('stripe-sync-premium', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: {},
    });
    if (error) return { ok: false, error: error.message };
    const active = Boolean((data as { active?: boolean } | null)?.active);
    return { ok: true, active };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? 'Error' };
  }
}

export function markPremiumCheckoutStarted() {
  try { localStorage.setItem(LS_CHECKOUT_STARTED_AT, String(Date.now())); } catch { /* ignore */ }
}

export function consumePremiumCheckoutStarted(params: { maxAgeMs: number }): boolean {
  try {
    const raw = localStorage.getItem(LS_CHECKOUT_STARTED_AT);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) { localStorage.removeItem(LS_CHECKOUT_STARTED_AT); return false; }
    const ok = Date.now() - ts <= params.maxAgeMs;
    // siempre consumimos para evitar loops
    localStorage.removeItem(LS_CHECKOUT_STARTED_AT);
    return ok;
  } catch {
    return false;
  }
}

// ─── Comprar Premium ────────────────────────────────────────────────────────
export interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

export async function purchasePremium(userEmail?: string): Promise<PurchaseResult> {
  try {
    void userEmail;

    // Garantizar sesión activa antes de llamar a la Edge Function
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Debes iniciar sesión para activar Premium' };

    const { data, error } = await supabase.functions.invoke('stripe-create-checkout-session', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: {
        success_url: `${APP_URL}/?premium=success`,
        cancel_url: `${APP_URL}/premium`,
      },
    });
    if (error) return { success: false, error: error.message };
    const url = (data as { checkout_url?: string } | null)?.checkout_url;
    if (!url) return { success: false, error: 'No checkout_url' };
    markPremiumCheckoutStarted();
    // En mobile, `window.open` puede bloquearse; redirigimos en la misma pestaña.
    window.location.assign(url);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message ?? 'Error en la compra' };
  }
}

export async function openCustomerPortal(): Promise<PurchaseResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Debes iniciar sesión' };

    const { data, error } = await supabase.functions.invoke('stripe-customer-portal', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: { return_url: `${APP_URL}/premium` },
    });
    if (error) return { success: false, error: error.message };
    const url = (data as { portal_url?: string } | null)?.portal_url;
    if (!url) return { success: false, error: 'No portal_url' };
    window.location.assign(url);
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message ?? 'Error' };
  }
}

// ─── Restaurar compras ──────────────────────────────────────────────────────
export async function restorePurchases(): Promise<PurchaseResult> {
  return { success: false, error: 'No disponible en web' };
}
