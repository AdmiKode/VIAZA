// src/modules/airport/pages/AirportFlowPage.tsx
// Airport Flow — "¿Cuándo salgo?" con lógica real
//
// PALETA OFICIAL (INMUTABLE):
//   Primary    #12212E
//   Secondary  #307082
//   Soft Teal  #6CA3A2
//   Background #ECE7DC
//   Accent     #EA9940
//
// REGLA: CERO emojis, CERO colores fuera de paleta.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import {
  requestNotificationPermissions,
  scheduleNotification,
} from '../../../services/notificationsService';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  accent:     '#EA9940',
  muted:      'rgba(18,33,46,0.5)',
  border:     'rgba(18,33,46,0.10)',
  card:       'white',
} as const;

// ─── Íconos ──────────────────────────────────────────────────────────────────

function IconBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={P.primary} strokeWidth="2.2" strokeLinecap="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );
}

function IconPlane() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={P.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.18 2 2 0 0 1 3.9 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.secondary} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function IconDoc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P.softTeal} strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatFull(date: Date): string {
  return date.toLocaleString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function minutesToLabel(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Cálculo de cuándo salir ─────────────────────────────────────────────────

interface DepartureCalc {
  shouldLeaveAt: Date;
  arriveAt: Date;
  minutesToAirport: number;        // tiempo en ruta (tráfico normal)
  minutesBuffer: number;           // colchón de seguridad
  minutesToCheckin: number;        // cuánto antes del vuelo llegar
  breakdown: { label: string; minutes: number }[];
}

function calcDeparture(params: {
  flightDeparture: Date;
  transportType: 'flight' | 'car' | 'bus' | 'train';
  driveMinutes: number;
  isInternational: boolean;
}): DepartureCalc {
  const { flightDeparture, transportType, driveMinutes, isInternational } = params;

  // cuánto antes llegar al aeropuerto según tipo
  const checkinBuffer = transportType === 'flight'
    ? (isInternational ? 180 : 120)
    : 60;

  const routeBuffer = 30; // colchón de tráfico/imprevistos

  const breakdown = [
    { label: isInternational ? 'Check-in internacional' : 'Check-in doméstico', minutes: checkinBuffer },
    { label: 'Traslado + tráfico', minutes: driveMinutes + routeBuffer },
  ];

  const totalMinutes = checkinBuffer + driveMinutes + routeBuffer;
  const shouldLeaveAt = new Date(flightDeparture.getTime() - totalMinutes * 60 * 1000);
  const arriveAt = new Date(flightDeparture.getTime() - checkinBuffer * 60 * 1000);

  return {
    shouldLeaveAt,
    arriveAt,
    minutesToAirport: driveMinutes,
    minutesBuffer: routeBuffer,
    minutesToCheckin: checkinBuffer,
    breakdown,
  };
}

// ─── Checklist de documentos ─────────────────────────────────────────────────

const DOC_CHECKLIST = [
  { id: 'passport', label: 'Pasaporte / Identificación' },
  { id: 'boarding', label: 'Pase de abordar (impreso o digital)' },
  { id: 'reservations', label: 'Confirmaciones de hotel y transporte' },
  { id: 'insurance', label: 'Seguro de viaje' },
  { id: 'visa', label: 'Visa (si aplica)' },
  { id: 'medication', label: 'Medicamentos en bolso de mano' },
  { id: 'liquids', label: 'Bolsa de líquidos (100ml, transparente)' },
  { id: 'electronics', label: 'Cargadores y electrónicos de mano' },
];

// ─── Página principal ─────────────────────────────────────────────────────────

export function AirportFlowPage() {
  const navigate = useNavigate();
  const trip = useAppStore(s => s.trips.find(t => t.id === s.currentTripId) ?? null);

  // Estado del formulario (prefilled desde el viaje si existe)
  const [flightIso, setFlightIso] = useState<string>(() => {
    if (trip?.flightDepartureTime) {
      try {
        return toInputValue(new Date(trip.flightDepartureTime));
      } catch {
        return toInputValue(new Date(Date.now() + 24 * 3600 * 1000));
      }
    }
    return toInputValue(new Date(Date.now() + 24 * 3600 * 1000));
  });
  const [driveMinutes, setDriveMinutes] = useState(45);
  const [isInternational, setIsInternational] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [goNow, setGoNow] = useState(false);

  // Derivados
  const flightDate = (() => {
    try { return new Date(flightIso); } catch { return new Date(); }
  })();

  const calc = calcDeparture({
    flightDeparture: flightDate,
    transportType: (trip?.transportType as 'flight') ?? 'flight',
    driveMinutes,
    isInternational,
  });

  const minutesLeft = Math.round((calc.shouldLeaveAt.getTime() - Date.now()) / 60000);
  const isUrgent = minutesLeft > 0 && minutesLeft <= 30;
  const isPast = minutesLeft < 0;

  // Auto-detectar si ya es hora de salir
  useEffect(() => {
    if (minutesLeft <= 0 && minutesLeft > -60) setGoNow(true);
    else setGoNow(false);
  }, [minutesLeft]);

  const toggleDoc = useCallback((id: string) => {
    setCheckedDocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleScheduleReminder = useCallback(async () => {
    setNotifStatus('loading');
    try {
      const granted = await requestNotificationPermissions();
      if (!granted) { setNotifStatus('error'); return; }
      // 30 min antes de la hora de salida
      const notifAt = new Date(calc.shouldLeaveAt.getTime() - 30 * 60 * 1000);
      await scheduleNotification({
        id: Math.floor(Math.random() * 100000),
        title: 'Hora de salir al aeropuerto',
        body: `Sale en 30 min. Debes llegar a las ${formatTime(calc.arriveAt)}`,
        at: notifAt.toISOString(),
      });
      setNotifStatus('done');
    } catch {
      setNotifStatus('error');
    }
  }, [calc]);

  const docsTotal = DOC_CHECKLIST.length;
  const docsChecked = checkedDocs.size;
  const docsReady = docsChecked === docsTotal;

  return (
    <div style={{ minHeight: '100vh', background: P.background, fontFamily: 'Questrial, sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: P.background, padding: '18px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <IconBack />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: P.primary }}>Airport Flow</div>
            <div style={{ fontSize: 12, color: P.muted }}>
              {trip?.destination ?? 'Tu vuelo'}
              {trip?.flightNumber ? ` · ${trip.flightNumber}` : ''}
            </div>
          </div>
          <IconPlane />
        </div>
      </div>

      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* GO NOW banner */}
        <AnimatePresence>
          {goNow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: P.accent, borderRadius: 18, padding: '20px',
                textAlign: 'center', boxShadow: `0 8px 28px rgba(234,153,64,0.35)`,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900, color: P.primary, letterSpacing: -0.5 }}>Sal ahora</div>
              <div style={{ fontSize: 14, color: P.primary, marginTop: 4, opacity: 0.7 }}>
                Ya es hora de salir para llegar a tiempo
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vuelo — hora y configuración */}
        <div style={{ background: P.card, borderRadius: 18, padding: '18px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 }}>Tu vuelo</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 4 }}>HORA DE SALIDA DEL VUELO</div>
              <input
                type="datetime-local"
                value={flightIso}
                onChange={e => setFlightIso(e.target.value)}
                style={{ width: '100%', background: 'rgba(18,33,46,0.04)', border: `1.5px solid ${P.border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, color: P.primary, fontFamily: 'Questrial, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 4 }}>TIEMPO DE TRASLADO AL AEROPUERTO (MIN)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min={10} max={180} step={5}
                  value={driveMinutes}
                  onChange={e => setDriveMinutes(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: P.accent }}
                />
                <span style={{ fontSize: 16, fontWeight: 700, color: P.primary, minWidth: 52, textAlign: 'right' }}>{minutesToLabel(driveMinutes)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
              <span style={{ fontSize: 14, color: P.primary }}>Vuelo internacional</span>
              <button
                type="button"
                onClick={() => setIsInternational(v => !v)}
                style={{
                  width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: isInternational ? P.accent : 'rgba(18,33,46,0.15)',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: isInternational ? 21 : 3,
                  width: 20, height: 20, borderRadius: '50%', background: 'white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                }}/>
              </button>
            </div>
          </div>
        </div>

        {/* Resultado — cuándo salir */}
        <div style={{
          background: isPast ? 'rgba(18,33,46,0.07)' : isUrgent ? `rgba(234,153,64,0.15)` : `rgba(48,112,130,0.10)`,
          border: `1.5px solid ${isPast ? P.border : isUrgent ? `rgba(234,153,64,0.35)` : `rgba(48,112,130,0.30)`}`,
          borderRadius: 18, padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <IconClock />
            <div style={{ fontSize: 15, fontWeight: 800, color: P.primary }}>
              {isPast ? 'Ya deberías estar en camino' : 'Debes salir a las'}
            </div>
          </div>

          {!isPast && (
            <div style={{ fontSize: 36, fontWeight: 900, color: P.primary, letterSpacing: -1, marginBottom: 4 }}>
              {formatTime(calc.shouldLeaveAt)}
            </div>
          )}

          <div style={{ fontSize: 13, color: P.muted, marginBottom: 14 }}>
            Para llegar al aeropuerto a las {formatTime(calc.arriveAt)} · {formatFull(flightDate)}
          </div>

          {/* Desglose */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {calc.breakdown.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: P.muted }}>
                <span>{b.label}</span>
                <span style={{ fontWeight: 700, color: P.primary }}>{minutesToLabel(b.minutes)}</span>
              </div>
            ))}
            {!isPast && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: `1px solid ${P.border}`, paddingTop: 6, marginTop: 2 }}>
                <span style={{ fontWeight: 700, color: P.primary }}>Tiempo restante para salir</span>
                <span style={{ fontWeight: 700, color: isUrgent ? P.accent : P.secondary }}>
                  {minutesLeft > 0 ? minutesToLabel(minutesLeft) : 'Salir ahora'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botón recordatorio */}
        <button
          type="button"
          onClick={handleScheduleReminder}
          disabled={notifStatus === 'loading' || notifStatus === 'done'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: notifStatus === 'done' ? P.secondary : P.primary,
            border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700,
            color: P.background, cursor: 'pointer', fontFamily: 'Questrial, sans-serif',
            opacity: notifStatus === 'loading' ? 0.6 : 1, transition: 'all 0.2s',
          }}
        >
          {notifStatus === 'done'
            ? <><IconCheck /> Recordatorio programado</>
            : notifStatus === 'loading'
            ? 'Programando...'
            : <><IconBell /> Recordarme 30 min antes</>
          }
        </button>

        {notifStatus === 'error' && (
          <div style={{ fontSize: 12, color: P.muted, textAlign: 'center' }}>
            Activa los permisos de notificaciones en configuración
          </div>
        )}

        {/* Checklist de documentos */}
        <div style={{ background: P.card, borderRadius: 18, padding: '18px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconDoc />
              <span style={{ fontSize: 15, fontWeight: 800, color: P.primary }}>Antes de salir</span>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: docsReady ? P.secondary : P.muted,
              background: docsReady ? `rgba(48,112,130,0.12)` : 'rgba(18,33,46,0.07)',
              borderRadius: 8, padding: '3px 8px',
            }}>
              {docsChecked}/{docsTotal}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {DOC_CHECKLIST.map((doc, i) => {
              const done = checkedDocs.has(doc.id);
              return (
                <motion.button
                  key={doc.id}
                  type="button"
                  onClick={() => toggleDoc(doc.id)}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 0',
                    borderBottom: i < DOC_CHECKLIST.length - 1 ? `1px solid ${P.border}` : 'none',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: done ? P.secondary : 'rgba(18,33,46,0.07)',
                    border: done ? 'none' : `1.5px solid ${P.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {done && <IconCheck />}
                  </div>
                  <span style={{ fontSize: 14, color: done ? P.muted : P.primary, textDecoration: done ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                    {doc.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {docsReady && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 12, background: `rgba(48,112,130,0.10)`, borderRadius: 12, padding: '10px 14px', fontSize: 13, color: P.secondary, fontWeight: 700, textAlign: 'center' }}
            >
              Todo listo para el aeropuerto
            </motion.div>
          )}
        </div>

        {/* Tips rápidos */}
        <div style={{ background: P.card, borderRadius: 18, padding: '18px', boxShadow: '0 2px 12px rgba(18,33,46,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>Recuerda</div>
          {[
            'Liquidos en bolsa transparente, max 100ml por pieza',
            'Laptop y líquidos fuera de la mochila en el scanner',
            'Cinturones y monedas en la mochila antes del scanner',
            isInternational ? 'Migración internacional puede tomar 30-45 min extra' : 'Documenta maleta con al menos 45 min de anticipación',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderBottom: i < 3 ? `1px solid ${P.border}` : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: P.softTeal, marginTop: 5, flexShrink: 0 }}/>
              <span style={{ fontSize: 13, color: P.primary, lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
