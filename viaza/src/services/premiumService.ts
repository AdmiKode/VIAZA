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

export async function initRevenueCat(): Promise<void> {
  return;
}

export async function checkPremiumStatus(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from('user_subscription')
    .select('is_active_premium')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!error) return Boolean(data?.is_active_premium);

  // Fallback (evita falsos negativos si la vista no existe aún o falla por RLS/migración):
  // usar `profiles.plan` + `profiles.plan_expires_at`.
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('plan,plan_expires_at')
    .eq('id', user.id)
    .maybeSingle();
  if (profErr || !profile) return false;

  const plan = String(profile.plan ?? 'free').toLowerCase();
  if (plan !== 'premium') return false;
  if (!profile.plan_expires_at) return true;
  return new Date(profile.plan_expires_at).getTime() > Date.now();
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
