// src/modules/safety/components/CompanionMapView.tsx
//
// Vista del acompañante — muestra el estado de la sesión de Safe Walk
// que comparte el viajero. Accede vía companion_token sin autenticación.
//
// DATOS que muestra:
//   - Estado de la sesión (activo / completado / SOS)
//   - Nombre del viajero (companion_name desde la sesión)
//   - Última ubicación conocida
//   - Tiempo esperado de llegada
//   - Historial de checkins (últimos 20)
//   - Botón de contacto si hay número de teléfono guardado
//
// POLLING: cada 20 segundos (no Realtime directo por restricciones RLS).
// Sin emojis. Paleta oficial VIAZA.

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../services/supabaseClient';

const P = {
  primary: '#12212E',
  secondary: '#307082',
  softTeal: '#6CA3A2',
  accent: '#EA9940',
  bg: '#ECE7DC',
};

const POLL_INTERVAL_MS = 20_000; // 20 segundos

export type SessionStatus = 'active' | 'completed' | 'expired' | 'sos_triggered';

export type CompanionSession = {
  id: string;
  session_type: string;
  status: SessionStatus;
  companion_name: string | null;
  expected_duration_min: number | null;
  started_at: string;
  expected_end_at: string | null;
  last_checkin_at: string | null;
  last_lat: number | null;
  last_lon: number | null;
  last_accuracy: number | null;
};

export type Checkin = {
  lat: number;
  lon: number;
  checkin_at: string;
};

type CompanionMapViewProps = {
  companionToken: string;
};

function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `hace ${hrs}h ${mins % 60}min`;
}

function formatTime(isoString: string | null): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const config: Record<SessionStatus, { label: string; color: string; bg: string }> = {
    active: { label: 'En camino', color: P.secondary, bg: 'rgba(48,112,130,0.12)' },
    completed: { label: 'Llegó bien', color: '#2A7D4F', bg: 'rgba(42,125,79,0.10)' },
    expired: { label: 'Tiempo vencido', color: P.accent, bg: 'rgba(234,153,64,0.12)' },
    sos_triggered: { label: 'SOS ACTIVADO', color: '#C0392B', bg: 'rgba(192,57,43,0.12)' },
  };
  const c = config[status];
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-bold"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

export function CompanionMapView({ companionToken }: CompanionMapViewProps) {
  const [session, setSession] = useState<CompanionSession | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchSessionData() {
    try {
      const { data, error: fnErr } = await supabase.functions.invoke(
        `safety-tracking/view/${companionToken}`,
        { method: 'GET' } as Parameters<typeof supabase.functions.invoke>[1]
      );
      if (fnErr) throw new Error(fnErr.message);
      const result = data as { session: CompanionSession; checkins: Checkin[] };
      setSession(result.session);
      setCheckins(result.checkins ?? []);
      setError(null);
      setLastRefresh(new Date());
    } catch (e) {
      setError((e as Error).message ?? 'Error al cargar sesión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchSessionData();
    // Solo hacer polling si la sesión está activa
    intervalRef.current = setInterval(() => {
      if (session?.status === 'active') {
        void fetchSessionData();
      }
    }, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companionToken]);

  // Parar polling cuando la sesión ya no está activa
  useEffect(() => {
    if (session && session.status !== 'active' && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [session?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: P.bg }}>
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: `${P.secondary} transparent ${P.secondary} ${P.secondary}` }}
          />
          <p className="mt-3 text-sm" style={{ color: P.secondary }}>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center min-h-dvh px-6" style={{ background: P.bg }}>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: P.primary }}>Sesión no encontrada</p>
          <p className="text-xs mt-2" style={{ color: `rgba(18,33,46,0.50)` }}>
            {error ?? 'El enlace puede ser inválido o la sesión expiró.'}
          </p>
        </div>
      </div>
    );
  }

  const name = session.companion_name ?? 'Tu contacto';
  const hasLocation = session.last_lat != null && session.last_lon != null;
  const mapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${session.last_lat},${session.last_lon}`
    : null;

  return (
    <div className="min-h-dvh" style={{ background: P.bg, fontFamily: 'Questrial, sans-serif' }}>

      {/* Header de alerta SOS */}
      {session.status === 'sos_triggered' && (
        <div className="px-4 pt-4">
          <div
            className="rounded-3xl px-5 py-4 text-center"
            style={{ background: 'rgba(192,57,43,0.10)', border: '2px solid rgba(192,57,43,0.40)' }}
          >
            <p className="text-sm font-bold" style={{ color: '#C0392B' }}>
              SOS ACTIVADO
            </p>
            <p className="text-xs mt-1" style={{ color: `rgba(18,33,46,0.65)` }}>
              {name} activó una alerta de emergencia. Contacta de inmediato.
            </p>
          </div>
        </div>
      )}

      {/* Header principal */}
      <div
        className="px-5 pt-12 pb-8"
        style={{
          background: session.status === 'sos_triggered'
            ? 'linear-gradient(160deg, #7B241C 0%, #C0392B 100%)'
            : 'linear-gradient(160deg, #12212E 0%, #307082 100%)',
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-white/50">
          Safe Walk — Vista del acompañante
        </p>
        <p className="text-2xl font-extrabold text-white mt-2">{name}</p>
        <div className="mt-3">
          <StatusBadge status={session.status} />
        </div>

        {/* Tiempo */}
        <div className="mt-4 flex gap-3 flex-wrap">
          <div className="rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-[11px] text-white/50">Inició</p>
            <p className="text-sm font-bold text-white">{formatTime(session.started_at)}</p>
          </div>
          {session.expected_end_at && (
            <div className="rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <p className="text-[11px] text-white/50">Esperado a las</p>
              <p className="text-sm font-bold text-white">{formatTime(session.expected_end_at)}</p>
            </div>
          )}
          <div className="rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-[11px] text-white/50">Último reporte</p>
            <p className="text-sm font-bold text-white">{formatRelativeTime(session.last_checkin_at)}</p>
          </div>
        </div>
      </div>

      {/* Última ubicación */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: P.softTeal }}>
          Última ubicación conocida
        </p>
        <div
          className="rounded-3xl px-5 py-4"
          style={{ background: 'white', boxShadow: '0 2px 14px rgba(18,33,46,0.07)' }}
        >
          {hasLocation ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: session.status === 'active' ? P.secondary : P.softTeal }} />
                <p className="text-xs font-semibold" style={{ color: P.primary }}>
                  {session.last_lat!.toFixed(5)}, {session.last_lon!.toFixed(5)}
                </p>
                {session.last_accuracy && (
                  <p className="text-[11px]" style={{ color: `rgba(18,33,46,0.40)` }}>
                    ±{Math.round(session.last_accuracy)}m
                  </p>
                )}
              </div>
              <p className="text-xs" style={{ color: `rgba(18,33,46,0.45)` }}>
                Actualizado {formatRelativeTime(session.last_checkin_at)}
              </p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 rounded-2xl px-4 py-2 text-xs font-bold"
                  style={{ background: `rgba(48,112,130,0.10)`, color: P.secondary, textDecoration: 'none' }}
                >
                  Ver en Google Maps
                </a>
              )}
            </>
          ) : (
            <p className="text-xs" style={{ color: `rgba(18,33,46,0.45)` }}>
              Sin datos de ubicación aún. Esperando primer reporte...
            </p>
          )}
        </div>
      </div>

      {/* Historial de checkins */}
      {checkins.length > 0 && (
        <div className="px-4 mt-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: P.softTeal }}>
            Historial de reportes ({checkins.length})
          </p>
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 2px 14px rgba(18,33,46,0.07)' }}
          >
            {checkins.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: i < checkins.length - 1 ? '1px solid rgba(18,33,46,0.06)' : 'none' }}
              >
                <div
                  className="shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: i === 0 ? P.secondary : P.softTeal }}
                />
                <div className="flex-1">
                  <p className="text-xs" style={{ color: P.primary }}>
                    {c.lat.toFixed(5)}, {c.lon.toFixed(5)}
                  </p>
                </div>
                <p className="text-[11px]" style={{ color: `rgba(18,33,46,0.40)` }}>
                  {formatTime(c.checkin_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actualización automática */}
      <div className="px-4 mt-5 mb-8 text-center">
        {session.status === 'active' ? (
          <p className="text-xs" style={{ color: `rgba(18,33,46,0.35)` }}>
            Actualizando cada 20 segundos. Última: {lastRefresh.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        ) : (
          <p className="text-xs" style={{ color: `rgba(18,33,46,0.35)` }}>
            La sesión ya no está activa.
          </p>
        )}
      </div>
    </div>
  );
}
