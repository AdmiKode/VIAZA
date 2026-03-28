// src/services/sosService.ts
// Cliente para sos-handler edge function + consultas directas a sos_events
// Schema: supabase/migrations/20260328_sos_events.sql

import { supabase } from './supabaseClient';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type SosStatus = 'sent' | 'delivered' | 'acknowledged' | 'resolved' | 'expired';
export type SosSentVia = 'whatsapp' | 'sms' | 'email' | 'manual';

export interface SosEvent {
  id: string;
  userId: string;
  tripId: string | null;
  lat: number | null;
  lon: number | null;
  accuracyMeters: number | null;
  eventToken: string;
  tokenExpiresAt: string;
  status: SosStatus;
  messageText: string | null;
  sentToName: string | null;
  sentToPhone: string | null; // ofuscado en DB
  sentVia: SosSentVia;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateSosPayload {
  tripId?: string;
  lat?: number;
  lon?: number;
  accuracyMeters?: number;
  messageText?: string;
  sentToName?: string;
  sentToPhone?: string;
  sentVia?: SosSentVia;
}

export interface SosCreateResult {
  sosEventId: string;
  eventToken: string;
  eventUrl: string;
  tokenExpiresAt: string;
}

// ─── Mapeo de row ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): SosEvent {
  return {
    id: row.id,
    userId: row.user_id,
    tripId: row.trip_id ?? null,
    lat: row.lat ?? null,
    lon: row.lon ?? null,
    accuracyMeters: row.accuracy_meters ?? null,
    eventToken: row.event_token,
    tokenExpiresAt: row.token_expires_at,
    status: row.status,
    messageText: row.message_text ?? null,
    sentToName: row.sent_to_name ?? null,
    sentToPhone: row.sent_to_phone ?? null,
    sentVia: row.sent_via ?? 'manual',
    acknowledgedAt: row.acknowledged_at ?? null,
    resolvedAt: row.resolved_at ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Dispara un SOS: crea el evento con token efímero, devuelve la URL pública.
 */
export async function triggerSos(payload: CreateSosPayload): Promise<SosCreateResult> {
  const { data, error } = await supabase.functions.invoke('sos-handler', {
    body: {
      tripId: payload.tripId,
      lat: payload.lat,
      lon: payload.lon,
      accuracyMeters: payload.accuracyMeters,
      messageText: payload.messageText,
      sentToName: payload.sentToName,
      sentToPhone: payload.sentToPhone,
      sentVia: payload.sentVia ?? 'manual',
    },
  });
  if (error) throw new Error(error.message);
  const d = data as SosCreateResult & { ok: boolean; error?: string };
  if (!d.ok) throw new Error(d.error ?? 'Error activando SOS');
  return { sosEventId: d.sosEventId, eventToken: d.eventToken, eventUrl: d.eventUrl, tokenExpiresAt: d.tokenExpiresAt };
}

/**
 * Obtiene el historial de SOS del usuario autenticado (más recientes primero).
 */
export async function getMySosEvents(limit = 20): Promise<SosEvent[]> {
  const { data, error } = await supabase
    .from('sos_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map(fromRow);
}

/**
 * Marca un SOS como resuelto o reconocido.
 */
export async function updateSosStatus(
  eventId: string,
  status: 'acknowledged' | 'resolved',
  notes?: string
): Promise<void> {
  const { data, error } = await supabase.functions.invoke(`sos-handler/${eventId}`, {
    method: 'PATCH',
    body: { status, notes },
  });
  if (error) throw new Error(error.message);
  const d = data as { ok: boolean; error?: string };
  if (!d.ok) throw new Error(d.error ?? 'Error actualizando SOS');
}

/**
 * Construye el mensaje WhatsApp listo para abrir con un link de la vista pública del SOS.
 */
export function buildWhatsAppSosMessage(params: {
  userName: string;
  contactName: string;
  eventUrl: string;
  lat?: number | null;
  lon?: number | null;
}): string {
  const { userName, contactName, eventUrl, lat, lon } = params;
  let msg = `Hola ${contactName}, soy ${userName}. He activado una alerta de seguridad. Puedes ver mi ubicación y estado aquí:\n${eventUrl}`;
  if (lat && lon) {
    msg += `\n\nMi ubicación actual: https://maps.google.com/?q=${lat},${lon}`;
  }
  return encodeURIComponent(msg);
}

/**
 * Abre WhatsApp con el mensaje de SOS preconstruido.
 */
export function openWhatsAppSos(phone: string, message: string): void {
  const cleanPhone = phone.replace(/\D/g, '');
  window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
}
