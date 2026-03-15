import { supabase } from './supabaseClient';
import type { AgendaItem } from '../types/agenda';

function toRow(item: AgendaItem, userId: string) {
  return {
    id: item.id,
    trip_id: item.tripId,
    user_id: userId,
    title: item.title,
    category: item.category,
    date: item.date,
    time: item.time,
    recurrence: item.recurrence,
    notes: item.notes ?? null,
    notification_id: item.notificationId ?? null,
    completed: item.completed,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertAgendaItem(item: AgendaItem): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('agenda_items')
    .upsert(toRow(item, user.id), { onConflict: 'id' });

  if (error) console.error('[agendaService] upsertAgendaItem error:', error.message);
}

export async function deleteAgendaItemRemote(id: string): Promise<void> {
  const { error } = await supabase
    .from('agenda_items')
    .delete()
    .eq('id', id);
  if (error) console.error('[agendaService] deleteAgendaItemRemote error:', error.message);
}

export async function fetchAgendaItems(tripId: string): Promise<AgendaItem[]> {
  const { data, error } = await supabase
    .from('agenda_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('[agendaService] fetchAgendaItems error:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    title: row.title,
    category: row.category,
    date: row.date,
    time: row.time,
    recurrence: row.recurrence,
    notes: row.notes ?? undefined,
    notificationId: row.notification_id ?? undefined,
    completed: row.completed ?? false,
    createdAt: row.created_at,
  }));
}

