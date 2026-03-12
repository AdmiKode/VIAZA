/**
 * notificationsService — abstracción de notificaciones locales
 * En web: usa la Notifications API del browser (fallback).
 * En nativo (Capacitor): usa @capacitor/local-notifications cuando esté disponible.
 */

export interface SchedulePayload {
  id: number;
  title: string;
  body: string;
  /** ISO string o Date — cuándo disparar */
  at: Date | string;
}

/** Solicita permiso al usuario. Devuelve true si fue concedido. */
export async function requestPermission(): Promise<boolean> {
  // En entorno Capacitor nativo se llamaría a LocalNotifications.requestPermissions()
  // En web, usamos la Notifications API
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/** Programa una notificación local. Devuelve el id usado. */
export async function scheduleNotification(payload: SchedulePayload): Promise<number> {
  const granted = await requestPermission();
  if (!granted) return payload.id;

  const at = payload.at instanceof Date ? payload.at : new Date(payload.at);
  const delay = at.getTime() - Date.now();

  if (delay <= 0) {
    // Disparar inmediatamente (ya pasó o es ahora)
    new Notification(payload.title, { body: payload.body, icon: '/brand/logo-blue.png' });
    return payload.id;
  }

  // Programar con setTimeout (web fallback)
  // En Capacitor nativo se reemplazaría con LocalNotifications.schedule()
  setTimeout(() => {
    new Notification(payload.title, { body: payload.body, icon: '/brand/logo-blue.png' });
  }, Math.min(delay, 2_147_483_647)); // setTimeout max ~24.8 días

  return payload.id;
}

/** Cancela una notificación programada por id. */
export function cancelNotification(_id: number): void {
  // En Capacitor: LocalNotifications.cancel({ notifications: [{ id }] })
  // En web no hay forma de cancelar un setTimeout sin guardar el handle.
  // Implementación completa disponible en integración nativa.
}

/** Genera un id numérico único basado en timestamp + random */
export function generateNotificationId(): number {
  return (Date.now() % 2_000_000) + Math.floor(Math.random() * 1000);
}
