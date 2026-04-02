import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useAppStore } from '../../../app/store/useAppStore';

/* ─── Paleta estricta ─── */
const C = {
  bg:       '#ECE7DC',
  dark:     '#12212E',
  teal:     '#307082',
  tealMid:  '#6CA3A2',
  amber:    '#EA9940',
  white:    '#FFFFFF',
};

/* ─── Hero gradient por travelType ─── */
const HERO: Record<string, string> = {
  beach:     `linear-gradient(175deg, ${C.dark} 0%, #1A3A4A 40%, #307082 75%, #6CA3A2 100%)`,
  mountain:  `linear-gradient(175deg, ${C.dark} 0%, #162C3A 40%, #1E3A4A 75%, #307082 100%)`,
  city:      `linear-gradient(175deg, ${C.dark} 0%, #1A2A3A 40%, #1E3046 75%, #307082 100%)`,
  camping:   `linear-gradient(175deg, ${C.dark} 0%, #162830 40%, #1E3A34 75%, #6CA3A2 100%)`,
  work:      `linear-gradient(175deg, ${C.dark} 0%, #162030 40%, #1E2C3A 75%, #307082 100%)`,
  snow:      `linear-gradient(175deg, ${C.dark} 0%, #162030 40%, #1E2E46 75%, #6CA3A2 100%)`,
  roadtrip:  `linear-gradient(175deg, ${C.dark} 0%, #2A1E10 40%, #EA9940 75%, #F0B060 100%)`,
  adventure: `linear-gradient(175deg, ${C.dark} 0%, #162830 40%, #307082 65%, #EA9940 100%)`,
  default:   `linear-gradient(175deg, ${C.dark} 0%, #1A2A3A 40%, #307082 75%, #6CA3A2 100%)`,
};

/* ─── Módulos del viaje ─── */
const MODULES = [
  { to: '/packing',            color: C.amber,   labelKey: 'packing.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><rect x="8" y="18" width="32" height="24" rx="7" fill={C.amber}/><rect x="8" y="18" width="32" height="11" rx="7" fill="rgba(255,255,255,0.25)"/><path d="M18 18v-4a6 6 0 0 1 12 0v4" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/><path d="M18 30l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { to: '/itinerary',          color: C.teal,    labelKey: 'itinerary.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="36" rx="7" fill={C.teal} fillOpacity="0.9"/><path d="M4 14h40" stroke="white" strokeWidth="2" strokeOpacity="0.3"/><circle cx="13" cy="10" r="2.5" fill="white" fillOpacity="0.5"/><circle cx="20" cy="10" r="2.5" fill="white" fillOpacity="0.5"/><path d="M13 24v14M13 24l11 7 11-7v14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { to: '/agenda',             color: C.tealMid, labelKey: 'agenda.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="32" rx="6" fill={C.tealMid} fillOpacity="0.9"/><path d="M16 20h16M16 28h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><circle cx="36" cy="12" r="7" fill={C.amber}/><path d="M33 12h6M36 9v6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg> },
  { to: '/places',             color: C.dark,    labelKey: 'places.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill={C.dark}/><circle cx="24" cy="18" r="5" fill="white" fillOpacity="0.6"/></svg> },
  { to: '/split-bill',         color: C.amber,   labelKey: 'splitBill.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="32" rx="8" fill={C.amber} fillOpacity="0.9"/><path d="M24 8v32M10 20h28M10 28h28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg> },
  { to: '/departure',          color: C.teal,    labelKey: 'departure.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill={C.teal}/><path d="M24 14v10l6 6" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg> },
  { to: '/safety',             color: C.dark,    labelKey: 'safety.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><path d="M24 4L8 12v14c0 10 7.6 19.3 16 22 8.4-2.7 16-12 16-22V12L24 4z" fill={C.dark}/><path d="M17 24l5 5 9-9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { to: '/wallet',             color: C.tealMid, labelKey: 'wallet.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="40" height="28" rx="7" fill={C.tealMid} fillOpacity="0.9"/><rect x="28" y="20" width="12" height="8" rx="4" fill="white" fillOpacity="0.6"/><path d="M4 20h40" stroke="white" strokeWidth="2" strokeOpacity="0.3"/></svg> },
  { to: '/budget',             color: C.amber,   labelKey: 'budget.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill={C.amber} fillOpacity="0.9"/><path d="M24 14v20M19 18h7a4 4 0 0 1 0 8h-7m0 0h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg> },
  { to: '/airline-rules',      color: C.teal,    labelKey: 'airline.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill={C.teal}/></svg> },
  { to: '/import-reservation', color: C.dark,    labelKey: 'import.title',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="40" height="28" rx="6" fill={C.dark} fillOpacity="0.85"/><path d="M12 22l3 3 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M26 22h10M26 28h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg> },
  { to: '/tools',              color: C.tealMid, labelKey: 'nav.tools',
    icon: <svg width="24" height="24" viewBox="0 0 48 48" fill="none"><path d="M34 6a10 10 0 0 0-10 11.2L8.3 33.5a4.24 4.24 0 1 0 6 6L30.8 24A10 10 0 1 0 34 6z" fill={C.tealMid}/><circle cx="34" cy="14" r="6" fill="rgba(255,255,255,0.25)"/></svg> },
];

/* ─── Íconos de transporte ─── */
function TransportIcon({ type, size = 20 }: { type: string; size?: number }) {
  const icons: Record<string, JSX.Element> = {
    flight: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="white"/></svg>,
    car:    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="4" y="20" width="40" height="14" rx="6" fill="white" fillOpacity="0.85"/><circle cx="13" cy="36" r="5" fill="white"/><circle cx="35" cy="36" r="5" fill="white"/></svg>,
    bus:    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="28" rx="6" fill="white" fillOpacity="0.85"/><circle cx="16" cy="38" r="4" fill="white"/><circle cx="32" cy="38" r="4" fill="white"/></svg>,
    train:  <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect x="12" y="6" width="24" height="28" rx="6" fill="white" fillOpacity="0.85"/><circle cx="18" cy="38" r="4" fill="white"/><circle cx="30" cy="38" r="4" fill="white"/></svg>,
    cruise: <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><path d="M4 36c10-8 30-8 40 0" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/><rect x="14" y="16" width="20" height="16" rx="3" fill="white" fillOpacity="0.85"/></svg>,
  };
  return icons[type] ?? icons.flight;
}

/* ─── Calcular días al/desde el viaje ─── */
function useTripCountdown(startDate?: string, endDate?: string) {
  return useMemo(() => {
    if (!startDate) return { status: 'none' as const, days: 0 };
    const now  = new Date(); now.setHours(0, 0, 0, 0);
    const start = new Date(startDate); start.setHours(0, 0, 0, 0);
    const end   = endDate ? (() => { const d = new Date(endDate); d.setHours(0, 0, 0, 0); return d; })() : null;
    const diffStart = Math.round((start.getTime() - now.getTime()) / 86400000);
    if (end && now >= start && now <= end) return { status: 'ongoing' as const, days: Math.round((end.getTime() - now.getTime()) / 86400000) };
    if (diffStart > 0) return { status: 'future'  as const, days: diffStart };
    if (diffStart === 0) return { status: 'today'  as const, days: 0 };
    return { status: 'past' as const, days: Math.abs(diffStart) };
  }, [startDate, endDate]);
}

/* ─── Componente principal ─── */
export function TripDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params   = useParams();

  const trip          = useAppStore((s) => s.trips.find((x) => x.id === params.id) ?? null);
  const currentTripId = useAppStore((s) => s.currentTripId);
  const setCurrentTrip = useAppStore((s) => s.setCurrentTrip);
  const packingItems  = useAppStore((s) => s.packingItems.filter((x) => x.tripId === params.id));

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const packedCount  = packingItems.filter((x) => x.checked).length;
  const totalCount   = packingItems.length;
  const progressPct  = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);
  const isActive     = currentTripId === params.id;
  const countdown    = useTripCountdown(trip?.startDate, trip?.endDate);

  if (!trip) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6" style={{ background: C.bg }}>
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" className="opacity-25">
          <path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill={C.dark}/>
          <circle cx="24" cy="18" r="5" fill={C.dark} opacity="0.5"/>
        </svg>
        <p style={{ color: C.dark, fontSize: 17, fontWeight: 700 }}>{t('trip.notFound')}</p>
        <button type="button" onClick={() => navigate('/home')}
          style={{ background: C.amber, color: C.white, border: 'none', borderRadius: 16, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Questrial, sans-serif', fontSize: 15 }}>
          {t('trip.goHome')}
        </button>
      </div>
    );
  }

  const heroGradient = HERO[trip.travelType] ?? HERO.default;

  return (
    <div className="min-h-dvh pb-32" style={{ background: C.bg, fontFamily: 'Questrial, sans-serif' }}>

      {/* ════ HERO FULL-BLEED ════ */}
      <div className="relative overflow-hidden" style={{ background: heroGradient, minHeight: 300, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>

        {/* Esferas decorativas */}
        <div className="pointer-events-none absolute" style={{ right: -60, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
        <div className="pointer-events-none absolute" style={{ left: -40, bottom: 20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.035)' }}/>
        <div className="pointer-events-none absolute" style={{ right: 30, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(234,153,64,0.12)' }}/>

        {/* Nav top */}
        <div className="relative flex items-center justify-between px-5 pt-14 pb-2">
          <button type="button" onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-2xl"
            style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M30 10L14 24l16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>

          {/* Badge activo */}
          {isActive && (
            <span className="rounded-full px-3 py-1.5" style={{ background: C.amber, color: C.white, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>
              {t('trip.active').toUpperCase()}
            </span>
          )}
        </div>

        {/* Contenido del hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative px-6 pt-4 pb-8">

          {/* Tipo de viaje */}
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            {t(`travelType.${trip.travelType}`)}
          </div>

          {/* Destino */}
          <div style={{ color: C.white, fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>
            {trip.destination}
          </div>

          {/* Fechas */}
          {trip.startDate && (
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 16 }}>
              {trip.startDate}{trip.endDate ? ` — ${trip.endDate}` : ''}{trip.durationDays ? ` · ${trip.durationDays} ${t('onboarding.dates.days')}` : ''}
            </div>
          )}

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {trip.climate && (
              <span className="rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.15)', color: C.white, fontSize: 12, fontWeight: 600 }}>
                {t(`climate.${trip.climate}`)}
              </span>
            )}
            {trip.currencyCode && (
              <span className="rounded-full px-3 py-1.5" style={{ background: C.amber, color: C.white, fontSize: 12, fontWeight: 700 }}>
                {trip.currencyCode}
              </span>
            )}
            {trip.languageCode && (
              <span className="rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.15)', color: C.white, fontSize: 12, fontWeight: 600 }}>
                {trip.languageCode.toUpperCase()}
              </span>
            )}
            {trip.transportType && (
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.12)', color: C.white, fontSize: 12, fontWeight: 600 }}>
                <TransportIcon type={trip.transportType} size={14} />
                {t(`transport.${trip.transportType}`, trip.transportType)}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}
          className="relative mx-5 mb-6 grid grid-cols-3 overflow-hidden rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}>

          {/* Días */}
          <div className="flex flex-col items-center justify-center py-4 px-2">
            <div style={{ color: C.white, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
              {countdown.status === 'none' ? '—' : countdown.days}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11, fontWeight: 600, marginTop: 3, textAlign: 'center' }}>
              {countdown.status === 'future'  ? t('trip.daysLeft',  { days: '' }).replace('  ', '') :
               countdown.status === 'ongoing' ? `${t('trip.daysLeft', { days: '' }).replace('  ', '')} rest.` :
               countdown.status === 'today'   ? t('trip.today') :
               countdown.status === 'past'    ? t('trip.daysGone',  { days: '' }).replace('  ', '') : '—'}
            </div>
          </div>

          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', margin: '12px 0' }}/>

          {/* Maleta */}
          <div className="flex flex-col items-center justify-center py-4 px-2">
            <div style={{ color: C.white, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{progressPct}%</div>
            <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11, fontWeight: 600, marginTop: 3 }}>{t('trip.packingProgress')}</div>
          </div>

          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', margin: '12px 0' }}/>

          {/* Viajeros */}
          <div className="flex flex-col items-center justify-center py-4 px-2">
            <div style={{ color: C.white, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
              {(trip.numberOfAdults ?? 0) + (trip.numberOfKids ?? 0) || '—'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11, fontWeight: 600, marginTop: 3 }}>{t('trip.travelers')}</div>
          </div>
        </motion.div>
      </div>

      {/* ════ BODY ════ */}
      <div className="space-y-4 px-5 pt-5">

        {/* ── Activar viaje (si no es el activo) ── */}
        {!isActive && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <button type="button" onClick={() => { setCurrentTrip(trip.id); navigate('/home'); }}
              className="flex w-full items-center justify-center gap-2 rounded-3xl py-4"
              style={{ background: C.amber, color: C.white, border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', fontSize: 15, fontWeight: 700 }}>
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <path d="M24 4L8 12v14c0 10 7.6 19.3 16 22 8.4-2.7 16-12 16-22V12L24 4z" fill="white"/>
              </svg>
              {t('trip.setActive')}
            </button>
          </motion.div>
        )}

        {/* ── Progreso de maleta ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}
          className="overflow-hidden rounded-3xl" style={{ background: C.white, boxShadow: '0 4px 20px rgba(18,33,46,0.07)' }}>
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(18,33,46,0.38)', marginBottom: 4 }}>
                {t('packing.title')}
              </div>
              <div style={{ color: C.dark, fontSize: 15, fontWeight: 700 }}>
                {totalCount === 0
                  ? t('trip.noItems')
                  : `${packedCount} / ${totalCount} ${t('packing.items')}`}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: progressPct === 100 ? C.teal : C.amber, boxShadow: `0 4px 14px ${progressPct === 100 ? 'rgba(48,112,130,0.35)' : 'rgba(234,153,64,0.35)'}` }}>
              <span style={{ color: C.white, fontWeight: 800, fontSize: 13 }}>{progressPct}%</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mx-5 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(18,33,46,0.07)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
              transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="h-2 rounded-full"
              style={{ background: `linear-gradient(90deg, ${C.amber}, #F0B060)` }}/>
          </div>

          <Link to="/packing" onClick={() => setCurrentTrip(trip.id)}
            className="mx-5 mb-5 mt-4 flex items-center justify-center gap-2 rounded-2xl py-3 transition active:scale-[0.98]"
            style={{ background: C.dark, color: C.white, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {t('home.openPacking')}
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
              <path d="M18 10l16 14-16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </Link>
        </motion.div>

        {/* ── Clima ── */}
        {trip.weatherForecast && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="rounded-3xl p-5" style={{ background: C.white, boxShadow: '0 4px 20px rgba(18,33,46,0.07)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(18,33,46,0.38)', marginBottom: 12 }}>
              {t('weather.forecast.title')}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 60, height: 60, background: `rgba(48,112,130,0.10)` }}>
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                  <circle cx="28" cy="20" r="10" fill={C.teal} fillOpacity="0.9"/>
                  <ellipse cx="20" cy="26" rx="12" ry="8" fill={C.teal} fillOpacity="0.7"/>
                  <ellipse cx="32" cy="28" rx="10" ry="7" fill={C.tealMid} fillOpacity="0.6"/>
                </svg>
              </div>
              <div>
                <div style={{ color: C.dark, fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{trip.weatherForecast.avgTemp}°C</div>
                <div style={{ color: 'rgba(18,33,46,0.55)', fontSize: 13, marginTop: 2 }}>{trip.weatherForecast.description}</div>
                <div style={{ color: 'rgba(18,33,46,0.40)', fontSize: 12, marginTop: 2 }}>
                  {trip.weatherForecast.minTemp}° / {trip.weatherForecast.maxTemp}° · {t('weather.forecast.rain', { pct: trip.weatherForecast.rainProbability })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Transporte ── */}
        {trip.transportType && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="rounded-3xl p-5" style={{ background: C.white, boxShadow: '0 4px 20px rgba(18,33,46,0.07)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(18,33,46,0.38)', marginBottom: 12 }}>
              {t('transport.title')}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 52, height: 52, background: C.dark }}>
                <TransportIcon type={trip.transportType} />
              </div>
              <div>
                <div style={{ color: C.dark, fontSize: 15, fontWeight: 700 }}>{t(`transport.${trip.transportType}`, trip.transportType)}</div>
                {trip.originCity && <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 13, marginTop: 2 }}>{trip.originCity} → {trip.destination}</div>}
                {trip.flightNumber && (
                  <div style={{ color: C.teal, fontSize: 12, fontWeight: 700, marginTop: 2 }}>
                    {trip.flightNumber}{trip.airline ? ` · ${trip.airline}` : ''}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Viajeros ── */}
        {((trip.numberOfAdults ?? 0) > 0 || (trip.numberOfKids ?? 0) > 0) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="rounded-3xl p-5" style={{ background: C.white, boxShadow: '0 4px 20px rgba(18,33,46,0.07)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(18,33,46,0.38)', marginBottom: 12 }}>
              {t('trip.travelers')}
            </div>
            <div className="flex flex-wrap gap-2">
              {(trip.numberOfAdults ?? 0) > 0 && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: 'rgba(18,33,46,0.06)' }}>
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="16" r="9" fill={C.dark} fillOpacity="0.7"/><path d="M8 42c0-8.84 7.16-16 16-16s16 7.16 16 16" fill={C.dark} fillOpacity="0.5"/></svg>
                  <span style={{ color: C.dark, fontSize: 14, fontWeight: 700 }}>{trip.numberOfAdults} {t('travelers.adults')}</span>
                </div>
              )}
              {(trip.numberOfKids ?? 0) > 0 && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: 'rgba(234,153,64,0.10)' }}>
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="16" r="7" fill={C.amber} fillOpacity="0.8"/><path d="M10 42c0-7.73 6.27-14 14-14s14 6.27 14 14" fill={C.amber} fillOpacity="0.5"/></svg>
                  <span style={{ color: C.amber, fontSize: 14, fontWeight: 700 }}>{trip.numberOfKids} {t('travelers.kids')}</span>
                </div>
              )}
              {trip.travelerGroup && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: 'rgba(48,112,130,0.08)' }}>
                  <span style={{ color: C.teal, fontSize: 14, fontWeight: 700 }}>{t(`travelerGroup.${trip.travelerGroup}`, trip.travelerGroup)}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Actividades ── */}
        {trip.activities && trip.activities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}
            className="rounded-3xl p-5" style={{ background: C.white, boxShadow: '0 4px 20px rgba(18,33,46,0.07)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(18,33,46,0.38)', marginBottom: 12 }}>
              {t('trip.activities')}
            </div>
            <div className="flex flex-wrap gap-2">
              {trip.activities.map((act) => (
                <span key={act} className="rounded-full px-3 py-1.5" style={{ background: `rgba(48,112,130,0.10)`, color: C.teal, fontSize: 12, fontWeight: 600 }}>
                  {t(`activity.${act}`, act)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Módulos — grid 4 cols ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 14 }}>{t('trip.modules')}</div>
          <div className="grid grid-cols-4 gap-3">
            {MODULES.map((mod, i) => (
              <motion.div key={mod.to} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.22 + i * 0.025, duration: 0.3 }}>
                <Link to={mod.to} onClick={() => setCurrentTrip(trip.id)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl p-3 transition active:scale-[0.93]"
                  style={{ background: C.white, boxShadow: '0 2px 10px rgba(18,33,46,0.07)', textDecoration: 'none' }}>
                  <div className="flex items-center justify-center rounded-xl"
                    style={{ width: 44, height: 44, background: `${mod.color}14` }}>
                    {mod.icon}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.dark, textAlign: 'center', lineHeight: 1.3 }}>
                    {t(mod.labelKey)}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Acciones ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}
          className="rounded-3xl overflow-hidden" style={{ background: C.white, boxShadow: '0 4px 20px rgba(18,33,46,0.07)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(18,33,46,0.38)', padding: '20px 20px 12px' }}>
            {t('trip.quickActions')}
          </div>

          {/* Compartir */}
          <button type="button" onClick={() => {
            void navigator.share?.({ title: trip.destination, text: `Viaje a ${trip.destination}` }).catch(() => null);
          }}
            className="flex w-full items-center gap-3 px-5 py-4 transition active:bg-gray-50"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', borderTop: '1px solid rgba(18,33,46,0.06)' }}>
            <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: 'rgba(48,112,130,0.10)' }}>
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="38" cy="10" r="6" fill={C.teal}/><circle cx="38" cy="38" r="6" fill={C.teal}/><circle cx="10" cy="24" r="6" fill={C.teal}/><path d="M16 24l16-14M16 24l16 14" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <span style={{ color: C.dark, fontSize: 15, fontWeight: 600 }}>{t('trip.shareTrip')}</span>
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none" className="ml-auto"><path d="M18 10l16 14-16 14" stroke="rgba(18,33,46,0.30)" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>
          </button>

          {/* Eliminar */}
          <button type="button" onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center gap-3 px-5 py-4 transition active:bg-red-50"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', borderTop: '1px solid rgba(18,33,46,0.06)' }}>
            <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: 'rgba(220,50,50,0.08)' }}>
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M8 14h32M18 14V8h12v6M20 22v16M28 22v16" stroke="#DC3232" strokeWidth="2.5" strokeLinecap="round"/><rect x="10" y="14" width="28" height="26" rx="5" stroke="#DC3232" strokeWidth="2.5"/></svg>
            </div>
            <span style={{ color: '#DC3232', fontSize: 15, fontWeight: 600 }}>{t('trip.deleteTrip')}</span>
          </button>
        </motion.div>

      </div>

      {/* ── Confirm delete sheet ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: 'rgba(18,33,46,0.55)' }}
              onClick={() => setShowDeleteConfirm(false)}/>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6"
              style={{ background: C.white }}>
              <div style={{ color: C.dark, fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{t('trip.deleteTrip')}</div>
              <div style={{ color: 'rgba(18,33,46,0.55)', fontSize: 14, marginBottom: 24 }}>{t('trip.confirmDelete')}</div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-2xl py-3.5" style={{ background: 'rgba(18,33,46,0.07)', color: C.dark, border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', fontSize: 15, fontWeight: 700 }}>
                  {t('common.cancel')}
                </button>
                <button type="button" onClick={() => { setShowDeleteConfirm(false); navigate('/home'); }}
                  className="flex-1 rounded-2xl py-3.5" style={{ background: '#DC3232', color: C.white, border: 'none', cursor: 'pointer', fontFamily: 'Questrial, sans-serif', fontSize: 15, fontWeight: 700 }}>
                  {t('trip.deleteTrip')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
