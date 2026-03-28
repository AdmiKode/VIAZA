// src/modules/safety/hooks/useSafeWalk.ts
//
// Maneja el estado de una sesión de Safe Walk activa.
//
// ALCANCE MVP (Sprint 1):
//   - Foreground tracking: el intervalo de check-in se ejecuta con setInterval
//     mientras el componente está montado (app en pantalla).
//   - Si la app va a background, el intervalo puede pausarse o no — depende del OS.
//     Background tracking real requiere Android Foreground Service (Fase 2).
//   - Si no hay red, el check-in fallará; no hay cola local en este sprint.

import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentPosition } from '../../../services/locationService';
import {
  endSafeWalkSession,
  getActiveSessions,
  logSosEvent,
  SafeSession,
  sendSafeCheckin,
  startSafeWalkSession,
} from '../../../services/safeTrackingService';

const CHECKIN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export interface UseSafeWalkState {
  /** Sesión activa, null si no hay ninguna */
  session: SafeSession | null;
  /** true mientras se está iniciando o cargando la sesión activa */
  isLoading: boolean;
  /** Último checkin enviado con éxito */
  lastCheckinAt: string | null;
  /** Número de checkins enviados en esta sesión */
  checkinCount: number;
  /** Error del último intento de operación */
  error: string | null;
  /** Estado del tracking automático */
  isTracking: boolean;
}

export interface UseSafeWalkActions {
  start: (params: {
    tripId?: string;
    companionName?: string;
    companionPhone?: string;
    expectedDurationMin?: number;
  }) => Promise<void>;
  end: () => Promise<void>;
  triggerSos: (contactName?: string, contactPhone?: string) => Promise<void>;
  /** Fuerza un checkin inmediato (sin esperar el intervalo) */
  forceCheckin: () => Promise<void>;
}

export function useSafeWalk(tripId?: string): UseSafeWalkState & UseSafeWalkActions {
  const [session, setSession] = useState<SafeSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckinAt, setLastCheckinAt] = useState<string | null>(null);
  const [checkinCount, setCheckinCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<SafeSession | null>(null);

  // Sincronizar ref con state para usar en el intervalo sin closure stale
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Al montar: cargar sesión activa existente (si el usuario cerró y reabrió la app)
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const active = await getActiveSessions(tripId);
        if (cancelled) return;

        if (active.length > 0) {
          const s = active[0];
          // Reconstruir SafeSession parcial — la URL del acompañante no se guarda en DB
          // pero podemos mostrar la sesión como activa sin la URL
          setSession({
            session_id: s.id,
            companion_token: s.companion_token,
            companion_url: '', // no disponible sin llamar al edge function de nuevo
            started_at: s.started_at,
            expected_end_at: s.expected_end_at ?? null,
          });
          setLastCheckinAt(s.last_checkin_at ?? null);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tripId]);

  // Función interna de checkin (usada por el intervalo y forceCheckin)
  const doCheckin = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;

    try {
      const loc = await getCurrentPosition();
      const result = await sendSafeCheckin({
        sessionId: currentSession.session_id,
        lat: loc.lat,
        lon: loc.lon,
        accuracy: loc.accuracy,
      });
      setLastCheckinAt(result.checkin_at);
      setCheckinCount((c) => c + 1);
      setError(null);
    } catch (e) {
      // No bloquear — el error se muestra pero el tracking continúa
      setError(`Check-in fallido: ${(e as Error).message}`);
    }
  }, []);

  // Arrancar / detener el intervalo de tracking según si hay sesión activa
  useEffect(() => {
    if (!session) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsTracking(false);
      return;
    }

    // Iniciar intervalo
    setIsTracking(true);
    void doCheckin(); // checkin inmediato al activar
    intervalRef.current = setInterval(() => void doCheckin(), CHECKIN_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsTracking(false);
    };
  }, [session?.session_id, doCheckin]); // solo re-arrancar si cambia la sesión

  const start = useCallback(async (params: {
    tripId?: string;
    companionName?: string;
    companionPhone?: string;
    expectedDurationMin?: number;
  }) => {
    setError(null);
    setIsLoading(true);
    try {
      const newSession = await startSafeWalkSession({
        tripId: params.tripId ?? tripId,
        companionName: params.companionName,
        companionPhone: params.companionPhone,
        expectedDurationMin: params.expectedDurationMin,
      });
      setSession(newSession);
      setCheckinCount(0);
      setLastCheckinAt(null);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  const end = useCallback(async () => {
    const currentSession = sessionRef.current;
    if (!currentSession) return;

    setError(null);
    try {
      await endSafeWalkSession({ sessionId: currentSession.session_id, status: 'completed' });
      setSession(null);
      setCheckinCount(0);
      setLastCheckinAt(null);
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  }, []);

  const triggerSos = useCallback(async (contactName?: string, contactPhone?: string) => {
    const currentSession = sessionRef.current;

    // Registrar en DB antes de cualquier otra acción
    try {
      const loc = await getCurrentPosition().catch(() => null);
      await logSosEvent({
        tripId: tripId ?? null,
        sessionId: currentSession?.session_id ?? null,
        lat: loc?.lat ?? null,
        lon: loc?.lon ?? null,
        accuracy: loc?.accuracy ?? null,
        contactName: contactName ?? currentSession?.companion_token ?? null,
        contactPhone: contactPhone ?? null,
        method: 'whatsapp',
      });
    } catch {
      // Silencioso — el SOS a WhatsApp continúa aunque el log falle
    }

    // Marcar sesión como sos_triggered si existe
    if (currentSession) {
      try {
        await endSafeWalkSession({ sessionId: currentSession.session_id, status: 'sos_triggered' });
        setSession(null);
      } catch {
        // Silencioso
      }
    }
  }, [tripId]);

  const forceCheckin = useCallback(async () => {
    await doCheckin();
  }, [doCheckin]);

  return {
    session,
    isLoading,
    lastCheckinAt,
    checkinCount,
    error,
    isTracking,
    start,
    end,
    triggerSos,
    forceCheckin,
  };
}
