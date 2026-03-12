import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';

/* ─── Hero gradients por tipo de viaje ─── */
const HERO_GRADIENT: Record<string, string> = {
  beach:     'linear-gradient(160deg, #0E4F6B 0%, #1A8FA0 45%, #EA9940 100%)',
  mountain:  'linear-gradient(160deg, #1C2E1A 0%, #3B5E2B 55%, #7D9B4F 100%)',
  city:      'linear-gradient(160deg, #12212E 0%, #223B52 55%, #307082 100%)',
  camping:   'linear-gradient(160deg, #1A2E10 0%, #3A5C20 55%, #7A9B50 100%)',
  work:      'linear-gradient(160deg, #1A2030 0%, #2A3A55 55%, #4A6080 100%)',
  snow:      'linear-gradient(160deg, #1A2A3E 0%, #2A4A6E 55%, #5A8AAE 100%)',
  roadtrip:  'linear-gradient(160deg, #1E2C1A 0%, #3A5028 55%, #6A8040 100%)',
  adventure: 'linear-gradient(160deg, #2A1E10 0%, #5A3A20 55%, #EA9940 100%)',
  default:   'linear-gradient(160deg, #12212E 0%, #307082 70%, #6CA3A2 100%)',
};

const MODULE_LINKS = [
  { to: '/packing',             color: '#EA9940', labelKey: 'packing.title',     icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><rect x="8" y="18" width="32" height="24" rx="7" fill="#EA9940"/><rect x="8" y="18" width="32" height="11" rx="7" fill="rgba(255,255,255,0.30)"/><path d="M18 18v-4a6 6 0 0 1 12 0v4" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/><path d="M18 30l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { to: '/itinerary',           color: '#307082', labelKey: 'itinerary.title',   icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="36" rx="7" fill="#307082" fillOpacity="0.9"/><path d="M4 14h40" stroke="white" strokeWidth="2" strokeOpacity="0.3"/><circle cx="13" cy="10" r="2.5" fill="white" fillOpacity="0.5"/><circle cx="20" cy="10" r="2.5" fill="white" fillOpacity="0.5"/><path d="M13 24v14M13 24l11 7 11-7v14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { to: '/agenda',              color: '#6CA3A2', labelKey: 'agenda.title',      icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="32" rx="6" fill="#6CA3A2" fillOpacity="0.9"/><path d="M16 20h16M16 28h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><circle cx="36" cy="12" r="7" fill="#EA9940"/><path d="M33 12h6M36 9v6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg> },
  { to: '/places',              color: '#12212E', labelKey: 'places.title',      icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#12212E"/><circle cx="24" cy="18" r="5" fill="white" fillOpacity="0.6"/></svg> },
  { to: '/import-reservation',  color: '#EA9940', labelKey: 'import.title',      icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="40" height="28" rx="6" fill="#EA9940" fillOpacity="0.85"/><path d="M12 22l3 3 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M26 22h10M26 28h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg> },
  { to: '/departure',           color: '#307082', labelKey: 'departure.title',   icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="#307082"/><path d="M24 14v10l6 6" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg> },
  { to: '/airline-rules',       color: '#6CA3A2', labelKey: 'airline.title',     icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#6CA3A2"/></svg> },
  { to: '/route',               color: '#12212E', labelKey: 'trip.route',        icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="14" cy="14" r="6" fill="#12212E"/><circle cx="34" cy="34" r="6" fill="#12212E"/><path d="M14 20v8a8 8 0 0 0 8 8h4" stroke="#12212E" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/></svg> },
  { to: '/tips',                color: '#EA9940', labelKey: 'nav.tips',          icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M24 6a13 13 0 0 1 8 23.1V34a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2v-4.9A13 13 0 0 1 24 6z" fill="#EA9940"/><rect x="18" y="36" width="12" height="4" rx="2" fill="#EA9940" opacity="0.7"/></svg> },
  { to: '/tools',               color: '#307082', labelKey: 'nav.tools',         icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M34 6a10 10 0 0 0-10 11.2L8.3 33.5a4.24 4.24 0 1 0 6 6L30.8 24A10 10 0 1 0 34 6z" fill="#307082"/><circle cx="34" cy="14" r="6" fill="rgba(255,255,255,0.25)"/></svg> },
];

function TransportIcon({ type }: { type: string }) {
  const m: Record<string, JSX.Element> = {
    flight: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="white"/></svg>,
    car:    <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="4" y="20" width="40" height="14" rx="6" fill="white" fillOpacity="0.85"/><circle cx="13" cy="36" r="5" fill="white"/><circle cx="35" cy="36" r="5" fill="white"/></svg>,
    bus:    <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="28" rx="6" fill="white" fillOpacity="0.85"/><circle cx="16" cy="38" r="4" fill="white"/><circle cx="32" cy="38" r="4" fill="white"/></svg>,
    train:  <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="12" y="6" width="24" height="28" rx="6" fill="white" fillOpacity="0.85"/><circle cx="18" cy="38" r="4" fill="white"/><circle cx="30" cy="38" r="4" fill="white"/></svg>,
    cruise: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M4 36c10-8 30-8 40 0" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/><rect x="14" y="16" width="20" height="16" rx="3" fill="white" fillOpacity="0.85"/></svg>,
  };
  return m[type] ?? m.flight;
}

export function TripDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const trip = useAppStore((s) => s.trips.find((x) => x.id === params.id) ?? null);
  const setCurrentTrip = useAppStore((s) => s.setCurrentTrip);
  const packingItems = useAppStore((s) => s.packingItems.filter((x) => x.tripId === params.id));

  const packedCount = packingItems.filter((x) => x.checked).length;
  const totalCount = packingItems.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

  if (!trip) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6" style={{ background: '#ECE7DC' }}>
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-30">
          <path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#12212E"/>
          <circle cx="24" cy="18" r="5" fill="#12212E" opacity="0.5"/>
        </svg>
        <div style={{ color: '#12212E', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t('trip.notFound')}</div>
        <button type="button" onClick={() => navigate('/home')} style={{ background: '#EA9940', color: 'white', border: 'none', borderRadius: 16, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}>
          {t('trip.goHome')}
        </button>
      </div>
    );
  }

  const heroGradient = HERO_GRADIENT[trip.travelType] ?? HERO_GRADIENT.default;

  return (
    <div className="min-h-dvh pb-32" style={{ background: '#ECE7DC', fontFamily: 'Questrial, sans-serif' }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden px-6 pt-14 pb-8" style={{ background: heroGradient, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}/>
        <div className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}/>

        <button type="button" onClick={() => navigate(-1)} className="relative mb-6 flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M30 10L14 24l16 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 600, fontFamily: 'Questrial, sans-serif' }}>{t('home.activeTrip.label', 'Viajes')}</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative">
          <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            {t(`travelType.${trip.travelType}`)}
          </div>
          <div style={{ color: 'white', fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>{trip.destination}</div>
          {trip.startDate && (
            <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, marginTop: 6 }}>
              {trip.startDate}{trip.endDate ? ` → ${trip.endDate}` : ''} · {trip.durationDays} {t('onboarding.dates.days')}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {trip.climate && <span className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>{t(`climate.${trip.climate}`)}</span>}
            {trip.currencyCode && <span className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: '#EA9940', color: 'white' }}>{trip.currencyCode}</span>}
            {trip.languageCode && <span className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>{trip.languageCode.toUpperCase()}</span>}
          </div>
        </motion.div>
      </div>

      <div className="space-y-4 px-5 pt-6">

        {/* ── Clima ── */}
        {trip.weatherForecast && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-3xl p-5" style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(18,33,46,0.40)', marginBottom: 10 }}>
              {t('weather.forecast.title')}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: 'rgba(48,112,130,0.10)' }}>
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><circle cx="28" cy="20" r="10" fill="#307082" fillOpacity="0.9"/><ellipse cx="20" cy="26" rx="12" ry="8" fill="#307082" fillOpacity="0.7"/><ellipse cx="32" cy="28" rx="10" ry="7" fill="#6CA3A2" fillOpacity="0.6"/></svg>
              </div>
              <div>
                <div style={{ color: '#12212E', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{trip.weatherForecast.avgTemp}°C</div>
                <div style={{ color: 'rgba(18,33,46,0.55)', fontSize: 13, marginTop: 2 }}>{trip.weatherForecast.description}</div>
                <div style={{ color: 'rgba(18,33,46,0.40)', fontSize: 12, marginTop: 1 }}>
                  {trip.weatherForecast.minTemp}° / {trip.weatherForecast.maxTemp}° · {trip.weatherForecast.rainProbability}% lluvia
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Transporte ── */}
        {trip.transportType && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="rounded-3xl p-5" style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(18,33,46,0.40)', marginBottom: 10 }}>
              {t('transport.title', 'Transporte')}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 48, height: 48, background: '#12212E' }}>
                <TransportIcon type={trip.transportType} />
              </div>
              <div>
                <div style={{ color: '#12212E', fontSize: 15, fontWeight: 700 }}>{t(`transport.${trip.transportType}.label`, trip.transportType)}</div>
                {trip.originCity && <div style={{ color: 'rgba(18,33,46,0.50)', fontSize: 13, marginTop: 2 }}>{trip.originCity} → {trip.destination}</div>}
                {trip.flightNumber && <div style={{ color: '#307082', fontSize: 12, fontWeight: 700, marginTop: 2 }}>{trip.flightNumber}{trip.airline ? ` · ${trip.airline}` : ''}</div>}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Travelers ── */}
        {((trip.numberOfAdults ?? 0) > 0 || (trip.numberOfKids ?? 0) > 0) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}
            className="rounded-3xl p-5" style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(18,33,46,0.40)', marginBottom: 10 }}>
              {t('trip.travelers', 'Viajeros')}
            </div>
            <div className="flex flex-wrap gap-3">
              {(trip.numberOfAdults ?? 0) > 0 && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ background: 'rgba(18,33,46,0.05)' }}>
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="16" r="9" fill="#12212E" fillOpacity="0.7"/><path d="M8 42c0-8.84 7.16-16 16-16s16 7.16 16 16" fill="#12212E" fillOpacity="0.5"/></svg>
                  <span style={{ color: '#12212E', fontSize: 14, fontWeight: 700 }}>{trip.numberOfAdults} {t('travelers.adults', 'adultos')}</span>
                </div>
              )}
              {(trip.numberOfKids ?? 0) > 0 && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ background: 'rgba(234,153,64,0.10)' }}>
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="16" r="7" fill="#EA9940" fillOpacity="0.8"/><path d="M10 42c0-7.73 6.27-14 14-14s14 6.27 14 14" fill="#EA9940" fillOpacity="0.5"/></svg>
                  <span style={{ color: '#EA9940', fontSize: 14, fontWeight: 700 }}>{trip.numberOfKids} {t('travelers.kids', 'niños')}</span>
                </div>
              )}
              {trip.travelerGroup && (
                <div className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ background: 'rgba(48,112,130,0.08)' }}>
                  <span style={{ color: '#307082', fontSize: 14, fontWeight: 700 }}>{t(`travelerGroup.${trip.travelerGroup}`, trip.travelerGroup)}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Actividades ── */}
        {trip.activities && trip.activities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="rounded-3xl p-5" style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(18,33,46,0.40)', marginBottom: 10 }}>
              {t('trip.activities', 'Actividades')}
            </div>
            <div className="flex flex-wrap gap-2">
              {trip.activities.map((act) => (
                <span key={act} className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'rgba(48,112,130,0.10)', color: '#307082' }}>
                  {t(`activity.${act}`, act)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Packing progreso ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="overflow-hidden rounded-3xl" style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}>
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(18,33,46,0.40)', marginBottom: 4 }}>{t('packing.title')}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#12212E' }}>
                {packedCount} / {totalCount} {t('packing.items', 'ítems')}
                {trip.packingStyle && <span style={{ marginLeft: 8, fontSize: 12, color: '#EA9940', fontWeight: 600 }}>· {t(`packingStyle.${trip.packingStyle}`, trip.packingStyle)}</span>}
              </div>
            </div>
            <div className="flex items-center justify-center rounded-full" style={{ width: 46, height: 46, background: progressPct === 100 ? '#307082' : '#EA9940', boxShadow: `0 4px 12px ${progressPct === 100 ? 'rgba(48,112,130,0.35)' : 'rgba(234,153,64,0.35)'}` }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>{progressPct}%</span>
            </div>
          </div>
          <div className="mx-5 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(18,33,46,0.07)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #EA9940, #F0B060)' }}/>
          </div>
          <Link to="/packing" onClick={() => setCurrentTrip(trip.id)} className="mx-5 mb-5 mt-4 flex items-center justify-center rounded-2xl py-3 transition active:scale-[0.98]" style={{ background: '#12212E', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            {t('home.openPacking')} →
          </Link>
        </motion.div>

        {/* ── Accesos a módulos ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#12212E', marginBottom: 12 }}>{t('trip.modules', 'Herramientas del viaje')}</div>
          <div className="grid grid-cols-3 gap-3">
            {MODULE_LINKS.map((mod) => (
              <Link key={mod.to} to={mod.to} onClick={() => setCurrentTrip(trip.id)}
                className="flex flex-col items-center gap-2 rounded-3xl p-4 transition active:scale-[0.95]"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(18,33,46,0.07)', textDecoration: 'none' }}>
                <div className="flex items-center justify-center rounded-2xl" style={{ width: 48, height: 48, background: `${mod.color}15` }}>
                  {mod.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#12212E', textAlign: 'center', lineHeight: 1.3 }}>
                  {t(mod.labelKey)}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
