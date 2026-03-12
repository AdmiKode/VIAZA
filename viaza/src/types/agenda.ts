export type AgendaCategory =
  | 'medication'
  | 'call'
  | 'meeting'
  | 'checkin'
  | 'activity'
  | 'reminder'
  | 'transport'
  | 'custom';

export type AgendaRecurrence =
  | 'none'
  | 'every_8h'
  | 'every_12h'
  | 'daily'
  | 'weekly';

export interface AgendaItem {
  id: string;
  tripId: string;
  title: string;
  category: AgendaCategory;
  /** ISO date YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  recurrence: AgendaRecurrence;
  notes?: string;
  /** ID numérico para Capacitor LocalNotifications */
  notificationId?: number;
  completed: boolean;
  createdAt: string;
}
