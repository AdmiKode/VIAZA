// src/services/safeTrackingService.ts
//
// ALCANCE MVP (Sprint 1): foreground tracking únicamente.
// El usuario debe tener la app en pantalla para que los check-ins funcionen.
// Background location / Android Foreground Service → Fase 2 (requiere plugin nativo).
// Offline: si no hay red, el checkin falla silenciosamente en este sprint.
// La cola offline local del dispositivo es tarea de Fase 3.

import { supabase } from './supabaseClient';

export interface SafeSession {
  session_id: string;
  companion_token: string;
  companion_url: string;
  started_at: string;
  expected_end_at: string | null;
}

export interface SafeCheckinResult {
  ok: boolean;
  checkin_at: string;
}

export interface CompanionView {
  session: {
    id: string;
    session_type: string;
    status: string;
    companion_name: string | null;
    expected_duration_min: number | null;
    started_at: string;
    expected_end_at: string | null;
    last_checkin_at: string | null;
    last_lat: number | null;
    last_lon: number | null;
    last_accuracy: number | null;
  };
  checkins: Array<{ lat: number; lon: number; checkin_at: string }>;
}

/**
 * Inicia una sesión de Safe Walk.
 * Devuelve session_id, companion_token y la URL pública para el acompañante.
 */
export async function startSafeWalkSession(params: {
  tripId?: string;
  companionName?: string;
  companionPhone?: string;
  expectedDurationMin?: number;
  sessionType?: 'safe_walk' | 'safe_return' | 'live_share';
}): Promise<SafeSession> {
  const { data, error } = await supabase.functions.invoke('safety-tracking/start', {
    body: {
      trip_id: params.tripId ?? null,
      companion_name: params.companionName ?? null,
      companion_phone: params.companionPhone ?? null,
      expected_duration_min: params.expectedDurationMin ?? null,
      session_type: params.sessionType ?? 'safe_walk',
    },
  });

  if (error) throw new Error(`No se pudo iniciar la sesión: ${error.message}`);
  if (!data?.session_id) throw new Error('Respuesta inválida del servidor');

  return data as SafeSession;
}

/**
 * Envía un check-in de ubicación a una sesión activa.
 * Debe llamarse con la app en foreground — no hay garantía en background.
 */
export async function sendSafeCheckin(params: {
  sessionId: string;
  lat: number;
  lon: number;
  accuracy?: number;
  note?: string;
}): Promise<SafeCheckinResult> {
  const { data, error } = await supabase.functions.invoke('safety-tracking/checkin', {
    body: {
      session_id: params.sessionId,
      lat: params.lat,
      lon: params.lon,
      accuracy: params.accuracy ?? null,
      note: params.note ?? null,
    },
  });

  if (error) throw new Error(`Check-in fallido: ${error.message}`);
  return data as SafeCheckinResult;
}

/**
 * Finaliza una sesión de Safe Walk.
 * status = 'completed' (llegó bien) | 'sos_triggered' (emergencia)
 */
export async function endSafeWalkSession(params: {
  sessionId: string;
  status?: 'completed' | 'sos_triggered';
}): Promise<void> {
  const { error } = await supabase.functions.invoke('safety-tracking/end', {
    body: {
      session_id: params.sessionId,
      status: params.status ?? 'completed',
    },
  });

  if (error) throw new Error(`No se pudo cerrar la sesión: ${error.message}`);
}

/**
 * Registra un evento SOS en la base de datos.
 * Se llama ANTES de abrir WhatsApp — el registro persiste aunque el usuario salga de la app.
 */
export async function logSosEvent(params: {
  tripId?: string | null;
  sessionId?: string | null;
  lat?: number | null;
  lon?: number | null;
  accuracy?: number | null;
  contactName?: string | null;
  contactPhone?: string | null;
  method?: 'whatsapp' | 'sms' | 'push' | 'manual';
}): Promise<void> {
  const { error } = await supabase.from('sos_events').insert({
    trip_id: params.tripId ?? null,
    session_id: params.sessionId ?? null,
    lat: params.lat ?? null,
    lon: params.lon ?? null,
    accuracy: params.accuracy ?? null,
    contact_notified: params.contactName ?? null,
    contact_phone: params.contactPhone ?? null,
    method: params.method ?? 'whatsapp',
    status: 'sent',
  });

  // SOS no debe bloquearse por un error de log — falla silenciosamente
  if (error) console.error('[safeTrackingService] logSosEvent error:', error.message);
}

/**
 * Obtiene las sesiones activas del usuario para el viaje actual.
 * Solo sesiones con status = 'active'.
 */
export async function getActiveSessions(tripId?: string): Promise<Array<{
  id: string;
  session_type: string;
  companion_name: string | null;
  companion_token: string;
  started_at: string;
  expected_end_at: string | null;
  last_checkin_at: string | null;
}>> {
  let query = supabase
    .from('safety_sessions')
    .select('id, session_type, companion_name, companion_token, started_at, expected_end_at, last_checkin_at')
    .eq('status', 'active')
    .order('started_at', { ascending: false });

  if (tripId) {
    query = query.eq('trip_id', tripId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Obtiene la lista de sesiones del historial (todas, no solo activas).
 */
export async function getSessionHistory(tripId?: string): Promise<Array<{
  id: string;
  session_type: string;
  status: string;
  companion_name: string | null;
  started_at: string;
  ended_at: string | null;
  expected_duration_min: number | null;
}>> {
  let query = supabase
    .from('safety_sessions')
    .select('id, session_type, status, companion_name, started_at, ended_at, expected_duration_min')
    .order('started_at', { ascending: false })
    .limit(20);

  if (tripId) {
    query = query.eq('trip_id', tripId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
