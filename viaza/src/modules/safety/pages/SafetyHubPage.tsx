// src/modules/safety/pages/SafetyHubPage.tsx
//
// Hub central de seguridad del viajero.
// Agrupa todos los módulos de safety en un solo punto de entrada.
//
// Secciones:
//   1. Botón SOS — acceso rápido directo a /sos
//   2. Safe Walk — iniciar/ver sesión activa → /safety/safewalk
//   3. Tarjeta de emergencia — datos médicos + QR → /profile/emergency
//   4. Emergencias locales — números de emergencia del país del viaje
//
// PALETA INMUTABLE: #12212E #307082 #6CA3A2 #ECE7DC #EA9940
// CERO emojis. CERO colores fuera de paleta.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { getActiveSessions } from '../../../services/safeTrackingService';
import { getEmergencyProfile } from '../../../services/emergencyService';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  bg:         '#ECE7DC',
  accent:     '#EA9940',
  rgb:        '18,33,46',
} as const;

// ─── Números de emergencia por país (ISO-2) ──────────────────────────────────
// Extendible. Fallback a internacionales si no hay match.
const EMERGENCY_NUMBERS: Record<string, { police: string; ambulance: string; fire: string }> = {
  MX: { police: '911', ambulance: '911', fire: '911' },
  US: { police: '911', ambulance: '911', fire: '911' },
  ES: { police: '091', ambulance: '112', fire: '080' },
  FR: { police: '17',  ambulance: '15',  fire: '18' },
  DE: { police: '110', ambulance: '112', fire: '112' },
  GB: { police: '999', ambulance: '999', fire: '999' },
  IT: { police: '113', ambulance: '118', fire: '115' },
  BR: { police: '190', ambulance: '192', fire: '193' },
  AR: { police: '911', ambulance: '107', fire: '100' },
  CO: { police: '123', ambulance: '132', fire: '119' },
  PE: { police: '105', ambulance: '106', fire: '116' },
  CL: { police: '133', ambulance: '131', fire: '132' },
  PT: { police: '112', ambulance: '112', fire: '112' },
  JP: { police: '110', ambulance: '119', fire: '119' },
  CN: { police: '110', ambulance: '120', fire: '119' },
  AU: { police: '000', ambulance: '000', fire: '000' },
  CA: { police: '911', ambulance: '911', fire: '911' },
  ZA: { police: '10111', ambulance: '10177', fire: '10177' },
};

const FALLBACK_NUMBERS = { police: '911', ambulance: '112', fire: '112' };

function extractCountryCode(destination: string | null | undefined): string | null {
  if (!destination) return null;
  // Heurística simple: último token de 2 letras en mayúsculas si destination incluye código ISO
  // En producción viene de trip.destinationCountry o se extrae del geocoding
  return null;
}

// ─── Íconos SVG ─────────────────────────────────────────────────────────────

function IconSos() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function IconSafeWalk() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/>
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <circle cx="18" cy="18" r="3" fill="none"/>
      <path d="M20.54 15.46L22 14"/>
    </svg>
  );
}

function IconEmergencyCard() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3"/>
      <path d="M12 10v4M10 12h4"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.18 2 2 0 0 1 3.9 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SafetyHubPage() {
  const navigate = useNavigate();
  const trip     = useAppStore((s) => s.trips.find((x) => x.id === s.currentTripId) ?? null);

  const [hasActiveWalk, setHasActiveWalk]       = useState(false);
  const [hasEmergencyCard, setHasEmergencyCard] = useState(false);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [sessions, profile] = await Promise.all([
          getActiveSessions(trip?.id),
          getEmergencyProfile(),
        ]);
        if (cancelled) return;
        setHasActiveWalk(sessions.length > 0);
        setHasEmergencyCard(Boolean(profile));
      } catch {
        // silencioso — la UI muestra estado desconocido sin crash
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [trip?.id]);

  // Números de emergencia del país del viaje
  const countryCode =
    (trip as { destinationCountryCode?: string } | null)?.destinationCountryCode ??
    extractCountryCode(trip?.destination);
  const numbers = (countryCode && EMERGENCY_NUMBERS[countryCode.toUpperCase()])
    ? EMERGENCY_NUMBERS[countryCode.toUpperCase()]
    : FALLBACK_NUMBERS;

  const destination = trip?.destination ?? null;

  return (
    <div
      className="min-h-dvh pb-32"
      style={{ background: P.bg, fontFamily: 'Questrial, sans-serif' }}
    >
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-full transition active:scale-90"
          style={{ width: 38, height: 38, background: 'rgba(18,33,46,0.07)', border: 'none', cursor: 'pointer' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 className="text-lg font-bold" style={{ color: P.primary }}>Seguridad</h1>
      </div>

      <div className="px-5 pt-2 space-y-4">

        {/* ─── BOTÓN SOS ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <button
            type="button"
            onClick={() => navigate('/sos')}
            className="w-full rounded-3xl transition active:scale-[0.97]"
            style={{
              background: `linear-gradient(135deg, ${P.primary} 0%, ${P.secondary} 100%)`,
              padding: '20px 24px',
              boxShadow: `0 8px 32px rgba(${P.rgb},0.28)`,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{ width: 52, height: 52, background: 'rgba(234,153,64,0.22)' }}
              >
                <span style={{ color: P.accent }}>
                  <IconSos />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold" style={{ color: '#ECE7DC' }}>
                  Activar SOS
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(236,231,220,0.65)' }}>
                  Alerta inmediata con tu ubicación actual
                </div>
              </div>
              <span style={{ color: 'rgba(236,231,220,0.40)' }}>
                <IconChevron />
              </span>
            </div>
          </button>
        </motion.div>

        {/* ─── SAFE WALK ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
        >
          <button
            type="button"
            onClick={() => navigate('/safety/safewalk')}
            className="w-full rounded-3xl transition active:scale-[0.97]"
            style={{
              background: 'white',
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(18,33,46,0.08)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{ width: 48, height: 48, background: `rgba(48,112,130,0.12)` }}
              >
                <span style={{ color: P.secondary }}>
                  <IconSafeWalk />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: P.primary }}>
                    Safe Walk
                  </span>
                  {!loading && hasActiveWalk && (
                    <span
                      className="text-xs font-semibold rounded-full px-2 py-0.5"
                      style={{ background: 'rgba(48,112,130,0.12)', color: P.secondary }}
                    >
                      Activo
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: `rgba(${P.rgb},0.55)` }}>
                  {hasActiveWalk
                    ? 'Sesion activa — comparte tu ubicacion'
                    : 'Comparte tu ubicacion con alguien de confianza'}
                </div>
              </div>
              <span style={{ color: `rgba(${P.rgb},0.25)` }}>
                <IconChevron />
              </span>
            </div>
          </button>
        </motion.div>

        {/* ─── ZONAS DE RIESGO ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.09 }}
        >
          <button
            type="button"
            onClick={() => navigate('/risk-zones')}
            className="w-full rounded-3xl transition active:scale-[0.97]"
            style={{
              background: 'white',
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(18,33,46,0.08)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{ width: 48, height: 48, background: 'rgba(234,153,64,0.12)' }}
              >
                <span style={{ color: P.accent }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold" style={{ color: P.primary }}>
                  Zonas de riesgo
                </div>
                <div className="text-xs mt-0.5" style={{ color: `rgba(${P.rgb},0.55)` }}>
                  Barrios, colonias y alertas reales de tu destino
                </div>
              </div>
              <span style={{ color: `rgba(${P.rgb},0.25)` }}>
                <IconChevron />
              </span>
            </div>
          </button>
        </motion.div>

        {/* ─── TARJETA DE EMERGENCIA ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.12 }}
        >
          <button
            type="button"
            onClick={() => navigate('/profile/emergency')}
            className="w-full rounded-3xl transition active:scale-[0.97]"
            style={{
              background: 'white',
              padding: '18px 20px',
              boxShadow: '0 4px 20px rgba(18,33,46,0.08)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{ width: 48, height: 48, background: `rgba(108,163,162,0.15)` }}
              >
                <span style={{ color: P.softTeal }}>
                  <IconEmergencyCard />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: P.primary }}>
                    Tarjeta de emergencia
                  </span>
                  {!loading && !hasEmergencyCard && (
                    <span
                      className="text-xs font-semibold rounded-full px-2 py-0.5"
                      style={{ background: 'rgba(234,153,64,0.15)', color: P.accent }}
                    >
                      Sin configurar
                    </span>
                  )}
                  {!loading && hasEmergencyCard && (
                    <span
                      className="text-xs font-semibold rounded-full px-2 py-0.5"
                      style={{ background: 'rgba(48,112,130,0.12)', color: P.secondary }}
                    >
                      Configurada
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: `rgba(${P.rgb},0.55)` }}>
                  Datos medicos y contactos accesibles con QR
                </div>
              </div>
              <span style={{ color: `rgba(${P.rgb},0.25)` }}>
                <IconChevron />
              </span>
            </div>
          </button>
        </motion.div>

        {/* ─── NÚMEROS DE EMERGENCIA LOCALES ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.18 }}
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'white',
              boxShadow: '0 4px 20px rgba(18,33,46,0.08)',
            }}
          >
            <div
              className="px-5 pt-4 pb-3"
              style={{ borderBottom: '1px solid rgba(18,33,46,0.06)' }}
            >
              <div className="text-sm font-bold" style={{ color: P.primary }}>
                Emergencias locales
              </div>
              {destination && (
                <div className="text-xs mt-0.5" style={{ color: `rgba(${P.rgb},0.50)` }}>
                  {destination}
                </div>
              )}
            </div>

            {(
              [
                { label: 'Policia',     number: numbers.police,    color: P.secondary },
                { label: 'Ambulancia',  number: numbers.ambulance, color: P.accent },
                { label: 'Bomberos',    number: numbers.fire,      color: P.softTeal },
              ] as const
            ).map(({ label, number, color }, i, arr) => (
              <a
                key={label}
                href={`tel:${number}`}
                className="flex items-center gap-4 px-5 py-4 transition active:opacity-70"
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(18,33,46,0.06)' : 'none',
                  textDecoration: 'none',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ width: 40, height: 40, background: `${color}18` }}
                >
                  <span style={{ color }}>
                    <IconPhone />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: P.primary }}>
                    {label}
                  </div>
                </div>
                <div className="text-base font-bold" style={{ color }}>
                  {number}
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* ─── AVISO SAFE WALK (foreground only) ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'rgba(18,33,46,0.05)' }}
          >
            <p className="text-xs leading-relaxed" style={{ color: `rgba(${P.rgb},0.55)` }}>
              Safe Walk registra tu posicion mientras la app esta en pantalla.
              El seguimiento en segundo plano estara disponible en una proxima version.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
