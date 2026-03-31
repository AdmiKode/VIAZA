// src/services/pushNotificationService.ts
//
// Servicio de notificaciones push
//
// ============================================================
// ESTADO — 30 marzo 2026
// ============================================================
//
// [CONFIRMADO] @capacitor/push-notifications v6.0.5 instalado en package.json.
//   registerPushToken() y setupPushListeners() funcionan en device Android.
//   google-services.json está en android/app/src/main/.
//
// [CONFIRMADO] FIREBASE_SERVICE_ACCOUNT_JSON en Supabase secrets.
//   private_key_id: f99aff379268b51a9e055cbce671d29b3a5fa9fb
//   edge function send-push redespllegada con nuevo service account.
//
// [CONFIRMADO] @capacitor/local-notifications v6 instalado.
//   scheduleLocalNotification() funciona sin Firebase ni internet.
//   Mecanismo para recordatorios locales (agenda, departure reminder).
//
// PENDIENTE DEVICE VALIDATED:
//   - Instalar APK en device Android real
//   - Login → token debe aparecer en push_tokens tabla Supabase
//   - Enviar push desde dashboard → device debe recibirla
//
// ============================================================

import { supabase } from './supabaseClient';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type PushPlatform = 'android' | 'ios' | 'web';

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  platform: PushPlatform;
  isActive: boolean;
  deviceId?: string;
  lastSeenAt: string;
  createdAt: string;
}

export interface LocalNotificationPayload {
  title: string;
  body: string;
  /** ID único para poder cancelarla. Si no se pasa, se genera uno. */
  id?: number;
  /** Fecha/hora de disparo. Si no se pasa, dispara inmediatamente. */
  scheduleAt?: Date;
  /** Datos extra para manejar el tap (deeplink, moduleId, etc.) */
  extra?: Record<string, unknown>;
}

// ─── LOCAL NOTIFICATIONS (CONFIRMADO — @capacitor/local-notifications v6) ────

/**
 * Solicita permiso de notificaciones locales.
 * Devuelve true si se concedió, false si se denegó o el plugin no está disponible.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    // En web o si el permiso no es soportado
    return false;
  }
}

/**
 * Agenda una notificación local. Funciona sin internet.
 * Si scheduleAt no se pasa, dispara en 1 segundo.
 */
export async function scheduleLocalNotification(payload: LocalNotificationPayload): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const notifId = payload.id ?? Math.floor(Math.random() * 2147483647);
    const at = payload.scheduleAt ?? new Date(Date.now() + 1000);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId,
          title: payload.title,
          body: payload.body,
          schedule: { at },
          extra: payload.extra ?? null,
          sound: undefined,
          actionTypeId: '',
          attachments: undefined,
        },
      ],
    });
  } catch (e) {
    console.warn('[pushNotificationService] scheduleLocalNotification error:', e);
  }
}

/**
 * Cancela una notificación local por su ID.
 */
export async function cancelLocalNotification(id: number): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch (e) {
    console.warn('[pushNotificationService] cancelLocalNotification error:', e);
  }
}

// ─── PUSH REMOTAS — NO CONFIRMADO (@capacitor/push-notifications) ────────────

/**
 * Registra el FCM token del dispositivo en Supabase.
 *
 * [NO CONFIRMADO] Requiere @capacitor/push-notifications instalado.
 * Si el plugin no está, el import dinámico falla silenciosamente.
 *
 * Llamar en App.tsx después de login exitoso.
 */
export async function registerPushToken(platform: PushPlatform): Promise<void> {
  try {
    // Import dinámico — no rompe si el plugin no está instalado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { PushNotifications } = await import('@capacitor/push-notifications' as any);

    await PushNotifications.requestPermissions();
    await PushNotifications.register();

    PushNotifications.addListener('registration', async (tokenData: { value: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upsert: si el token ya existe, actualiza last_seen_at e is_active
      const { error } = await supabase.from('push_tokens').upsert(
        {
          user_id: user.id,
          token: tokenData.value,
          platform,
          is_active: true,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,token' }
      );

      if (error) {
        console.warn('[pushNotificationService] registerPushToken upsert error:', error.message);
      }
    });

    PushNotifications.addListener('registrationError', (err: unknown) => {
      console.warn('[pushNotificationService] registration error:', err);
    });
  } catch {
    // Plugin no instalado o plataforma no soportada (web) — silencioso
  }
}

/**
 * Desactiva el token del dispositivo actual en Supabase (al cerrar sesión).
 * [NO CONFIRMADO] Solo funciona si registerPushToken fue llamado antes.
 */
export async function deactivatePushToken(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { PushNotifications } = await import('@capacitor/push-notifications' as any);
    let currentToken: string | null = null;

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 3000);
      PushNotifications.addListener('registration', (data: { value: string }) => {
        currentToken = data.value;
        clearTimeout(timeout);
        resolve();
      });
      PushNotifications.register().catch(() => { clearTimeout(timeout); resolve(); });
    });

    if (!currentToken) return;

    await supabase
      .from('push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('token', currentToken);
  } catch {
    // Silencioso
  }
}

/**
 * Configura listeners para push recibidas en foreground.
 * [NO CONFIRMADO] Requiere @capacitor/push-notifications.
 *
 * @param onReceived callback cuando llega una notificación con app en primer plano
 * @param onTap callback cuando el usuario toca la notificación
 */
export async function setupPushListeners(
  onReceived?: (title: string, body: string, extra?: unknown) => void,
  onTap?: (extra?: unknown) => void,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { PushNotifications } = await import('@capacitor/push-notifications' as any);

    PushNotifications.addListener('pushNotificationReceived', (notification: {
      title?: string; body?: string; data?: unknown;
    }) => {
      onReceived?.(notification.title ?? '', notification.body ?? '', notification.data);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: {
      notification?: { data?: unknown };
    }) => {
      onTap?.(action.notification?.data);
    });
  } catch {
    // Silencioso si el plugin no está
  }
}
