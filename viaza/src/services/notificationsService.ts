/**
 * notificationsService.ts
 * Notificaciones locales reales usando @capacitor/local-notifications.
 * Sin mocks — si los permisos son denegados, lanza error claro.
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Solicita permisos de notificación.
 * Retorna true si se concedieron, false si se denegaron.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    // En web usamos la Notifications API del navegador
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted';
}

export interface ScheduledNotification {
  id: number;
  title: string;
  body: string;
  /** ISO string de cuándo disparar */
  at: string;
}

/**
 * Programa una notificación local para una fecha/hora específica.
 */
export async function scheduleNotification(notif: ScheduledNotification): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) {
    throw new Error('Permisos de notificación no concedidos');
  }

  if (!Capacitor.isNativePlatform()) {
    // Web: usar setTimeout como aproximación (solo funciona si la app está abierta)
    const delay = new Date(notif.at).getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        new Notification(notif.title, { body: notif.body });
      }, delay);
    }
    return;
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notif.id,
        title: notif.title,
        body: notif.body,
        schedule: { at: new Date(notif.at) },
        sound: undefined,
        actionTypeId: '',
        extra: null,
      },
    ],
  });
}

/**
 * Cancela una notificación programada por ID.
 */
export async function cancelNotification(id: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id }] });
}

/**
 * Lista las notificaciones pendientes.
 */
export async function getPendingNotifications() {
  if (!Capacitor.isNativePlatform()) return [];
  const result = await LocalNotifications.getPending();
  return result.notifications;
}
