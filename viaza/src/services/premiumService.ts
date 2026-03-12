/**
 * premiumService.ts
 *
 * Lógica unificada de compras premium:
 * - Web (browser): Stripe Payment Link
 * - Nativo iOS/Android (Capacitor): RevenueCat Purchases SDK
 *
 * NOTA sobre RevenueCat:
 * Se importa de forma estática pero vite.config.ts tiene un alias que en web
 * apunta a src/stubs/revenuecat-stub.ts (retorna null).
 * En el build nativo de Capacitor el paquete real está instalado y funciona.
 */

import { Capacitor } from '@capacitor/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — en web este import resuelve al stub vacío (vite alias)
import { Purchases as _RC } from '@revenuecat/purchases-capacitor';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/9AQ5lV8vs6cQ8Z2fZa';
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID as string;
const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY as string;
const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '')
  ?? window.location.origin;

export const isNative = Capacitor.isNativePlatform();

// En web el stub devuelve null, así que RC siempre es null en browser
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RC: any = _RC ?? null;

// ─── Inicializar RevenueCat (llamar en AppProviders solo en nativo) ──────────
export async function initRevenueCat(userId?: string): Promise<void> {
  if (!isNative || !RC) return;
  await RC.configure({ apiKey: RC_API_KEY });
  if (userId) await RC.logIn({ appUserID: userId });
}

// ─── Verificar si el usuario tiene premium activo ───────────────────────────
export async function checkPremiumStatus(): Promise<boolean> {
  if (!isNative || !RC) return false;
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
    params.set('success_url', `${APP_URL}/?premium=success`);
    params.set('cancel_url', `${APP_URL}/premium`);
    window.open(`${STRIPE_PAYMENT_LINK}?${params.toString()}`, '_blank');
    return { success: true };
  }

  if (!RC) return { success: false, error: 'RevenueCat no disponible' };

  try {
    const { offerings } = await RC.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) return { success: false, error: 'Sin paquetes disponibles' };
    const { customerInfo } = await RC.purchasePackage({ aPackage: pkg });
    return { success: Object.keys(customerInfo.entitlements.active).length > 0 };
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err?.code === 'PURCHASE_CANCELLED') return { success: false, cancelled: true };
    return { success: false, error: err?.message ?? 'Error en la compra' };
  }
}

// ─── Restaurar compras ──────────────────────────────────────────────────────
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isNative || !RC) {
    return { success: false, error: 'La restauración solo está disponible en la app móvil' };
  }
  try {
    const { customerInfo } = await RC.restorePurchases();
    const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
    return { success: isActive, error: isActive ? undefined : 'No se encontraron compras anteriores' };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message ?? 'Error al restaurar' };
  }
}
