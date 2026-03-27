/**
 * Compatibilidad temporal.
 * Fuente de verdad: src/services/notificationsService.ts
 */

export {
  requestNotificationPermissions as requestPermission,
  scheduleNotification,
  cancelNotification,
  generateNotificationId,
} from '../notificationsService';

export type {
  ScheduledNotification as SchedulePayload,
} from '../notificationsService';
