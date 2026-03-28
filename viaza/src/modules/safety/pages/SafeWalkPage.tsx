// src/modules/safety/pages/SafeWalkPage.tsx
//
// Safe Walk MVP — Sprint 1
//
// PALETA OFICIAL (INMUTABLE):
//   Primary    #12212E  — fondos, texto principal
//   Secondary  #307082  — acción confirmada, estado activo
//   Soft Teal  #6CA3A2  — acentos suaves
//   Background #ECE7DC  — fondo general
//   Accent     #EA9940  — CTA, alertas, badges de acción
//
// REGLA ABSOLUTA: CERO emojis, CERO colores fuera de paleta.
//
// ALCANCE EXPLÍCITO:
//   OK Iniciar sesion Safe Walk con nombre del companero y duracion estimada
//   OK Check-in automatico cada 5 min con app en primer plano
//   OK Boton "Llegue bien" para cerrar sesion correctamente
//   OK Boton SOS que registra evento en DB y abre WhatsApp
//   OK URL del acompanante para compartir
//
//   [NO SPRINT 1] Background tracking — requiere Android Foreground Service (Fase 2)
//   [NO SPRINT 1] Cola local sin señal — sin Capacitor Preferences en este sprint

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppButton } from '../../../components/ui/AppButton';
import { useAppStore } from '../../../app/store/useAppStore';
import { useSafeWalk } from '../hooks/useSafeWalk';
import { buildSosMessage, sendAssistedSos } from '../../../services/emergencyAssistService';
import { getCurrentPosition } from '../../../services/locationService';

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}

function minutesToDisplay(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const DURATION_OPTIONS = [15, 30, 60, 90, 120];

// ─── PALETA tokens para reutilizar ───────────────────────────────────────────
const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  accent:     '#EA9940',
  primaryRgb: '18,33,46',
} as const;

export function SafeWalkPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const trip = useAppStore((s) => s.trips.find((x) => x.id === s.currentTripId) ?? null);
  const { session, isLoading, lastCheckinAt, checkinCount, error, isTracking, start, end, triggerSos, forceCheckin } =
    useSafeWalk(trip?.id);

  const [companionName, setCompanionName] = useState('');
  const [companionPhone, setCompanionPhone] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  async function handleStart() {
    if (!companionName.trim()) return;
    setStarting(true);
    try {
      await start({
        tripId: trip?.id,
        companionName: companionName.trim(),
        companionPhone: companionPhone.trim() || undefined,
        expectedDurationMin: durationMin,
      });
    } finally {
      setStarting(false);
    }
  }

  async function handleEnd() {
    setEnding(true);
    try {
      await end();
      navigate('/home');
    } finally {
      setEnding(false);
    }
  }

  async function handleSos() {
    setSosLoading(true);
    try {
      const loc = await getCurrentPosition().catch(() => null);
      await triggerSos(
        session ? undefined : companionName || undefined,
        companionPhone || undefined,
      );
      const msg = buildSosMessage({
        travelerName: trip?.destination ?? 'Viajero VIAZA',
        destination: trip?.destination ?? null,
        lat: loc?.lat ?? null,
        lon: loc?.lon ?? null,
        trackingUrl: session?.companion_url || null,
      });
      const phone = companionPhone.trim();
      if (phone) {
        sendAssistedSos({ channel: 'whatsapp', phone, message: msg });
      } else {
        await navigator.clipboard.writeText(msg).catch(() => null);
        setShareMsg(msg);
      }
    } finally {
      setSosLoading(false);
    }
  }

  function handleShareUrl() {
    if (!session?.companion_url) return;
    navigator.clipboard.writeText(session.companion_url).catch(() => null);
  }

  // ─── Vista: sesión activa ─────────────────────────────────────────────────
  if (!isLoading && session) {
    return (
      <div className="min-h-dvh" style={{ background: P.background }}>
        <div className="px-5 pt-4 pb-28 space-y-4">
          <AppHeader
            title="Safe Walk activo"
            right={
              <button type="button" onClick={() => navigate('/home')}
                className="text-sm" style={{ color: `rgba(${P.primaryRgb},0.60)` }}>
                Inicio
              </button>
            }
          />

          {/* Panel de estado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-6 text-center"
            style={{ background: P.primary }}
          >
            {/* Indicador de tracking */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: isTracking ? P.secondary : P.accent,
                  animation: isTracking ? 'pulse 2s infinite' : 'none',
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.80)', fontWeight: 600, fontSize: 13 }}>
                {isTracking ? 'Tracking activo · primer plano' : 'En pausa'}
              </span>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.50)', fontSize: 12, marginBottom: 4 }}>
              Sesion iniciada a las
            </div>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>
              {formatTime(session.started_at)}
            </div>
            {session.expected_end_at && (
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 4 }}>
                Estimado de llegada: {formatTime(session.expected_end_at)}
              </div>
            )}

            <div className="mt-5 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 2 }}>
                Check-ins enviados
              </div>
              <div style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{checkinCount}</div>
              {lastCheckinAt && (
                <div style={{ color: 'rgba(255,255,255,0.40)', fontSize: 11, marginTop: 2 }}>
                  Ultimo: {formatTime(lastCheckinAt)}
                </div>
              )}
              <div style={{ color: 'rgba(255,255,255,0.30)', fontSize: 10, marginTop: 6 }}>
                Automatico cada 5 min · solo con app en primer plano
              </div>
            </div>
          </motion.div>

          {/* Link del companero */}
          {session.companion_url && (
            <AppCard>
              <div className="text-xs font-semibold mb-2"
                style={{ color: `rgba(${P.primaryRgb},0.60)` }}>
                Link para tu companero
              </div>
              <div
                className="rounded-xl p-3 text-xs break-all"
                style={{ background: `rgba(${P.primaryRgb},0.06)`, fontFamily: 'monospace' }}
              >
                {session.companion_url}
              </div>
              <AppButton className="mt-3 w-full" onClick={handleShareUrl} type="button" variant="secondary">
                Copiar link
              </AppButton>
            </AppCard>
          )}

          {/* Error no bloqueante */}
          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm font-semibold"
              style={{ background: `rgba(${P.primaryRgb},0.07)`, color: P.primary }}>
              {error}
            </div>
          )}

          {/* Check-in manual */}
          <AppButton className="w-full" onClick={forceCheckin} type="button" variant="secondary">
            Enviar ubicacion ahora
          </AppButton>

          {/* Llegue bien */}
          <AppButton
            className="w-full"
            onClick={handleEnd}
            type="button"
            disabled={ending}
            style={{ background: P.secondary, color: 'white', opacity: ending ? 0.6 : 1 }}
          >
            {ending ? 'Cerrando...' : 'Llegue bien — cerrar sesion'}
          </AppButton>

          {/* SOS */}
          <button
            type="button"
            className="w-full rounded-3xl py-5 font-bold transition active:scale-[0.98]"
            style={{
              background: P.accent,
              color: P.primary,
              fontSize: 18,
              opacity: sosLoading ? 0.7 : 1,
            }}
            onClick={handleSos}
            disabled={sosLoading}
          >
            {sosLoading ? 'Enviando SOS...' : 'SOS — Emergencia'}
          </button>

          {shareMsg && (
            <AppCard>
              <div className="text-xs font-semibold mb-2"
                style={{ color: `rgba(${P.primaryRgb},0.60)` }}>
                Sin telefono configurado — copia este mensaje:
              </div>
              <pre className="text-xs whitespace-pre-wrap break-words" style={{ fontFamily: 'inherit' }}>
                {shareMsg}
              </pre>
            </AppCard>
          )}
        </div>
      </div>
    );
  }

  // ─── Vista: formulario para iniciar sesion ────────────────────────────────
  return (
    <div className="min-h-dvh" style={{ background: P.background }}>
      <div className="px-5 pt-4 pb-28 space-y-4">
        <AppHeader
          title="Safe Walk"
          right={
            <button type="button" onClick={() => navigate('/home')}
              className="text-sm" style={{ color: `rgba(${P.primaryRgb},0.60)` }}>
              Inicio
            </button>
          }
        />

        {/* Banner explicativo */}
        <div className="rounded-3xl p-5" style={{ background: P.primary, color: 'white' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
            Activa Safe Walk
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 1.55 }}>
            Tu companero recibe un link para ver tu ubicacion mientras caminas.
            La sesion funciona con la app en primer plano.
          </div>
          <div className="mt-3 rounded-2xl px-3 py-2 text-xs"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>
            Tracking en background disponible en una proxima version.
          </div>
        </div>

        {/* Formulario */}
        <AppCard>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold mb-2"
                style={{ color: `rgba(${P.primaryRgb},0.60)` }}>
                Nombre del companero *
              </div>
              <AppInput
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                placeholder="Mama, Carlos, Hotel..."
              />
            </div>

            <div>
              <div className="text-xs font-semibold mb-2"
                style={{ color: `rgba(${P.primaryRgb},0.60)` }}>
                Telefono del companero (para SOS)
              </div>
              <AppInput
                value={companionPhone}
                onChange={(e) => setCompanionPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                inputMode="tel"
              />
            </div>

            <div>
              <div className="text-xs font-semibold mb-2"
                style={{ color: `rgba(${P.primaryRgb},0.60)` }}>
                Duracion estimada
              </div>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    className="rounded-2xl px-4 py-2 text-sm font-semibold transition"
                    style={{
                      background: durationMin === min ? P.primary : `rgba(${P.primaryRgb},0.08)`,
                      color: durationMin === min ? 'white' : P.primary,
                    }}
                    onClick={() => setDurationMin(min)}
                  >
                    {minutesToDisplay(min)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AppCard>

        {error && (
          <div className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: `rgba(${P.primaryRgb},0.07)`, color: P.primary }}>
            {error}
          </div>
        )}

        <AppButton
          className="w-full"
          onClick={handleStart}
          type="button"
          disabled={!companionName.trim() || starting || isLoading}
        >
          {starting ? 'Iniciando...' : 'Iniciar Safe Walk'}
        </AppButton>

        {/* SOS rapido sin sesion activa */}
        <button
          type="button"
          className="w-full rounded-3xl py-4 font-bold transition active:scale-[0.98]"
          style={{
            background: P.accent,
            color: P.primary,
            fontSize: 16,
          }}
          onClick={handleSos}
          disabled={sosLoading}
        >
          {sosLoading ? 'Enviando...' : 'SOS directo'}
        </button>
      </div>
    </div>
  );
}

