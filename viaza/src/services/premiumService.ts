/**
 * premiumService.ts
 *
 * Lógica unificada de compras premium:
 * - Web (browser): Stripe Payment Link (pk_live ya configurado)
 * - Nativo iOS/Android (Capacitor): RevenueCat Purchases SDK
 *
 * Detección de plataforma via Capacitor.isNativePlatform()
 */

import { Capacitor } from '@capacitor/core';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/9AQ5lV8vs6cQ8Z2fZa';
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID as string;
const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY as string;
/** URL de retorno tras pago Stripe — apunta al dominio de producción */
const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '')
  ?? window.location.origin;

const isNative = Capacitor.isNativePlatform();

// ─── Lazy-load RevenueCat SDK solo en nativo ─────────────────────────────────
// @revenuecat/purchases-capacitor se instala en la app nativa.
// En web hacemos dynamic import para evitar errores en browser.
async function getRC() {
  if (!isNative) return null;
  try {
    // Dynamic import — solo existe en builds nativos con el plugin instalado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import('@revenuecat/purchases-capacitor' as any);
    return mod.Purchases as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch {
    return null;
  }
}

// ─── Inicializar RevenueCat (llamar en AppProviders solo en nativo) ──────────
export async function initRevenueCat(userId?: string): Promise<void> {
  if (!isNative) return;
  const RC = await getRC();
  if (!RC) return;
  await RC.configure({ apiKey: RC_API_KEY });
  if (userId) {
    await RC.logIn({ appUserID: userId });
  }
}

// ─── Verificar si el usuario tiene premium activo ───────────────────────────
export async function checkPremiumStatus(): Promise<boolean> {
  if (!isNative) {
    // En web: confiar en el estado local del store (Stripe webhooks → Supabase)
    return false; // el store ya maneja isPremium via Supabase
  }
  const RC = await getRC();
  if (!RC) return false;
  try {
    const { customerInfo } = await RC.getCustomerInfo();
    return Object.keys(customerInfo.entitlements.active).length > 0;
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
  if (!isNative) {
    // Web → Stripe Payment Link
    const params = new URLSearchParams();
    if (userEmail) params.set('prefilled_email', userEmail);
    params.set('client_reference_id', STRIPE_PRICE_ID);
    // Stripe usa success_url / cancel_url para redirigir tras el pago
    params.set('success_url', `${APP_URL}/?premium=success`);
    params.set('cancel_url', `${APP_URL}/premium`);
    const url = `${STRIPE_PAYMENT_LINK}?${params.toString()}`;
    window.open(url, '_blank');
    // No podemos saber el resultado inmediato en web (redirect flow)
    // El webhook de Stripe actualiza Supabase y el store se sincroniza
    return { success: true };
  }

  // Nativo → RevenueCat
  const RC = await getRC();
  if (!RC) return { success: false, error: 'RevenueCat no disponible' };

  try {
    const { offerings } = await RC.getOfferings();
    const offering = offerings.current;
    if (!offering) return { success: false, error: 'Sin ofertas disponibles' };

    const pkg = offering.availablePackages[0];
    if (!pkg) return { success: false, error: 'Sin paquetes disponibles' };

    const { customerInfo } = await RC.purchasePackage({ aPackage: pkg });
    const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
    return { success: isActive };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err?.code === 'PURCHASE_CANCELLED') {
      return { success: false, cancelled: true };
    }
    return { success: false, error: err?.message ?? 'Error en la compra' };
  }
}

// ─── Restaurar compras ──────────────────────────────────────────────────────
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isNative) {
    // Web: no hay nada que restaurar, el estado viene de Supabase
    return { success: false, error: 'La restauración solo está disponible en la app móvil' };
  }

  const RC = await getRC();
  if (!RC) return { success: false, error: 'RevenueCat no disponible' };

  try {
    const { customerInfo } = await RC.restorePurchases();
    const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
    return { success: isActive, error: isActive ? undefined : 'No se encontraron compras anteriores' };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message ?? 'Error al restaurar' };
  }
}
