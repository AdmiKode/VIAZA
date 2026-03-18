import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { WeatherForecastModal } from '../../weather/components/WeatherForecastModal';
import { fetchWeatherCache } from '../../../services/weatherCacheService';
import { supabase } from '../../../services/supabaseClient';
import type { ActiveModuleId } from '../../../engines/activeModulesEngine';

/* ─── Gradientes hero por tipo de viaje ─── */
const HERO_GRADIENT: Record<string, string> = {
  beach:     'linear-gradient(160deg, var(--viaza-secondary) 0%, var(--viaza-soft) 55%, var(--viaza-accent) 100%)',
  mountain:  'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 65%, var(--viaza-soft) 100%)',
  city:      'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 70%, var(--viaza-soft) 100%)',
  camping:   'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 65%, var(--viaza-soft) 100%)',
  work:      'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 70%, var(--viaza-soft) 100%)',
  snow:      'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 70%, var(--viaza-soft) 100%)',
  roadtrip:  'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 65%, var(--viaza-accent) 100%)',
  adventure: 'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 55%, var(--viaza-accent) 100%)',
  default:   'linear-gradient(160deg, var(--viaza-primary) 0%, var(--viaza-secondary) 70%, var(--viaza-soft) 100%)',
};

/* ─── Icono clima grande ─── */
function WeatherIcon({ type }: { type: string }) {
  if (type === 'snowy') return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M24 4v40M4 24h40M9 9l30 30M39 9L9 39" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      <circle cx="24" cy="24" r="5" fill="white"/>
      <circle cx="24" cy="4" r="3" fill="white" opacity="0.7"/>
      <circle cx="24" cy="44" r="3" fill="white" opacity="0.7"/>
      <circle cx="4" cy="24" r="3" fill="white" opacity="0.7"/>
      <circle cx="44" cy="24" r="3" fill="white" opacity="0.7"/>
    </svg>
  );
  if (type === 'rainy') return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="18" rx="16" ry="10" fill="white" fillOpacity="0.85"/>
      <ellipse cx="16" cy="20" rx="8" ry="6" fill="white" fillOpacity="0.5"/>
      <path d="M14 30l-3 9M22 30l-3 9M30 30l-3 9M38 30l-3 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
    </svg>
  );
  if (type === 'cold') return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="28" r="12" fill="white" fillOpacity="0.9"/>
      <circle cx="16" cy="22" r="8" fill="white" fillOpacity="0.5"/>
      <path d="M8 14c4-6 10-8 16-6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" fill="none"/>
    </svg>
  );
  if (type === 'warm' || type === 'hot') return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="12" fill="white" fillOpacity="0.95"/>
      <circle cx="24" cy="24" r="7" fill="white" fillOpacity="0.4"/>
      <path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.5 9.5l4 4M34.5 34.5l4 4M9.5 38.5l4-4M34.5 13.5l4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="28" cy="20" r="10" fill="white" fillOpacity="0.95"/>
      <ellipse cx="20" cy="26" rx="12" ry="8" fill="white" fillOpacity="0.85"/>
      <ellipse cx="32" cy="28" rx="10" ry="7" fill="white" fillOpacity="0.7"/>
    </svg>
  );
}

/* ─── Icono tipo de viaje ─── */
function TravelTypeIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    beach: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="14" r="9" fill="white" fillOpacity="0.9"/><path d="M2 36c6-8 14-8 20-4s14 4 24-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/></svg>,
    mountain: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M4 44L22 8l22 36z" fill="white" fillOpacity="0.85"/><path d="M18 22l4-10 4 10z" fill="white" fillOpacity="0.5"/></svg>,
    city: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="4" y="20" width="12" height="24" rx="2" fill="white" fillOpacity="0.7"/><rect x="18" y="10" width="14" height="34" rx="2" fill="white" fillOpacity="0.9"/><rect x="34" y="24" width="10" height="20" rx="2" fill="white" fillOpacity="0.7"/></svg>,
    camping: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M4 44L24 6l20 38z" fill="white" fillOpacity="0.85"/><rect x="18" y="34" width="12" height="10" rx="2" fill="white" fillOpacity="0.5"/></svg>,
    snow: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path d="M24 6v36M6 24h36M10 10l28 28M38 10L10 38" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9"/></svg>,
    roadtrip: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="4" y="20" width="40" height="14" rx="6" fill="white" fillOpacity="0.85"/><circle cx="13" cy="36" r="5" fill="white"/><circle cx="35" cy="36" r="5" fill="white"/></svg>,
    adventure: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="12" y="12" width="24" height="28" rx="7" fill="white" fillOpacity="0.85"/><path d="M20 12V8a4 4 0 0 1 8 0v4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>,
    work: <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><rect x="4" y="14" width="40" height="24" rx="5" fill="white" fillOpacity="0.85"/><path d="M18 14v-4a6 6 0 0 1 12 0v4" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/></svg>,
  };
  return icons[type] ?? icons.city;
}

/* ─── Quick Tools ─── */
const TOOLS = [
  {
    to: '/wallet', labelKey: 'wallet.title', subtitleKey: 'tools.wallet.subtitle',
    requiresModule: 'wallet' as ActiveModuleId,
    color: '#12212E',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="36" height="30" rx="8" fill="#12212E" />
        <rect x="6" y="10" width="36" height="14" rx="8" fill="white" opacity="0.18" />
        <rect x="14" y="24" width="20" height="10" rx="5" fill="#EA9940" opacity="0.92" />
        <rect x="18" y="27" width="12" height="2.6" rx="1.3" fill="white" opacity="0.55" />
      </svg>
    ),
  },
  {
    to: '/recommendations', labelKey: 'recommendations.title', subtitleKey: 'tools.recommendations.subtitle',
    requiresPremium: true,
    requiresModule: 'recommendations' as ActiveModuleId,
    color: '#EA9940',
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="#EA9940"/>
        <circle cx="24" cy="18" r="6" fill="white" opacity="0.35"/>
        <path d="M24 12l2.1 4.6 5 .5-3.8 3.3 1.2 4.9-4.5-2.6-4.5 2.6 1.2-4.9-3.8-3.3 5-.5L24 12z" fill="#12212E" opacity="0.75"/>
      </svg>
    ),
  },
  {
    to: '/translator', labelKey: 'translator.title', subtitleKey: 'tools.translator.subtitle',
    requiresPremium: true,
    requiresModule: 'translator' as ActiveModuleId,
    color: '#307082',
    icon: <svg width="32" height="32" viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="24" height="18" rx="6" fill="#307082"/><rect x="4" y="8" width="24" height="9" rx="6" fill="white" opacity="0.35"/><rect x="20" y="20" width="24" height="18" rx="6" fill="#EA9940"/><rect x="20" y="20" width="24" height="9" rx="6" fill="white" opacity="0.30"/><path d="M13 17h8M17 13v8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/><path d="M28 30l3 5 3-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
  },
  {
    to: '/currency', labelKey: 'currency.title', subtitleKey: 'tools.currency.subtitle',
    color: '#EA9940',
    icon: <svg width="32" height="32" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="#EA9940"/><circle cx="18" cy="18" r="9" fill="white" opacity="0.35"/><path d="M24 13v22M18 17h8a4 4 0 0 1 0 8h-8" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>,
  },
  {
    to: '/split-bill', labelKey: 'splitBill.title', subtitleKey: 'tools.splitBill.subtitle',
    color: '#12212E',
    icon: <svg width="32" height="32" viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="28" rx="8" fill="#12212E"/><rect x="6" y="10" width="36" height="14" rx="8" fill="white" opacity="0.30"/><path d="M24 10v28M6 24h36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>,
  },
  {
    to: '/adapters', labelKey: 'adapters.title', subtitleKey: 'tools.adapters.subtitle',
    color: '#6CA3A2',
    icon: <svg width="32" height="32" viewBox="0 0 48 48" fill="none"><rect x="13" y="6" width="22" height="28" rx="7" fill="#6CA3A2"/><rect x="13" y="6" width="22" height="13" rx="7" fill="white" opacity="0.30"/><rect x="9" y="32" width="30" height="10" rx="5" fill="#307082"/><rect x="19" y="15" width="4" height="8" rx="2" fill="#EA9940"/><rect x="25" y="15" width="4" height="8" rx="2" fill="#EA9940"/></svg>,
  },
];

const BEFORE_YOU_GO: Array<{
  to: string;
  icon: JSX.Element;
  labelKey: string;
  descKey: string;
  requiresTransport?: Array<'flight' | 'car' | 'bus' | 'cruise' | 'train'>;
}> = [
  {
    to: '/airline-rules',
    requiresTransport: ['flight'],
    icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><path d="M8 38L22 24l-4-8 6-6 4 8 8-4 2 2-14 10 6 12-4 2-4-8-4 4z" fill="#307082"/><path d="M8 38L22 24l-4-8 6-6" fill="white" opacity="0.3"/></svg>,
    labelKey: 'airline.title',
    descKey: 'home.beforeYouGo.airline',
  },
  {
    to: '/allowed-items',
    requiresTransport: ['flight'],
    icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><rect x="10" y="8" width="28" height="36" rx="6" fill="#EA9940"/><rect x="10" y="8" width="28" height="16" rx="6" fill="white" opacity="0.30"/><path d="M18 26l4 4 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    labelKey: 'allowedItems.title',
    descKey: 'home.beforeYouGo.allowed',
  },
  {
    to: '/departure',
    requiresTransport: ['flight'],
    icon: <svg width="22" height="22" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" fill="#12212E"/><circle cx="24" cy="24" r="18" fill="white" opacity="0.12"/><path d="M24 14v10l6 6" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>,
    labelKey: 'departure.title',
    descKey: 'home.beforeYouGo.departure',
  },
];

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const trip = useAppStore((s) => s.trips.find((x) => x.id === s.currentTripId) ?? null);
  const packingItems = useAppStore((s) => s.packingItems.filter((x) => x.tripId === s.currentTripId));
  const isPremium = useAppStore((s) => s.isPremium);
  const appLang = useAppStore((s) => s.currentLanguage);
  const [showForecast, setShowForecast] = useState(false);
  const [forecastStatus, setForecastStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const updateTrip = useAppStore((s) => s.updateTrip);

  const activeModules = new Set<string>(trip?.activeModules ?? []);
  const hasCoords =
    Boolean(trip) &&
    Number.isFinite(trip?.lat) &&
    Number.isFinite(trip?.lon) &&
    !(Number(trip?.lat) === 0 && Number(trip?.lon) === 0);

  // Auto-reparación: si el viaje no tiene coords, intentar resolver destino en background (Premium)
  const autoResolveKeyRef = useRef<string>('');
  useEffect(() => {
    if (!isPremium) return;
    if (!trip?.id) return;
    if (hasCoords) return;
    const q = (trip.destination ?? '').trim();
    if (q.length < 2) return;

    const key = `${trip.id}:${q.toLowerCase()}`;
    if (autoResolveKeyRef.current === key) return;
    autoResolveKeyRef.current = key;

    void (async () => {
      try {
        const { data: ac, error: acErr } = await supabase.functions.invoke('places-autocomplete', {
          body: { input: q, language: appLang },
        });
        if (acErr) throw acErr;
        const first = (ac as { predictions?: Array<{ place_id: string }> } | null)?.predictions?.[0];
        if (!first?.place_id) return;

        const { data: resolved, error: resErr } = await supabase.functions.invoke('destination-resolve', {
          body: { place_id: first.place_id, language: appLang },
        });
        if (resErr) throw resErr;
        const dest = (resolved as { destination?: {
          destination_place_id: string;
          destination_name: string;
          destination_country: string | null;
          destination_country_code: string | null;
          destination_timezone: string | null;
          destination_currency: string | null;
          destination_language: string | null;
          lat: number;
          lon: number;
        } } | null)?.destination;
        if (!dest || !Number.isFinite(dest.lat) || !Number.isFinite(dest.lon)) return;

        updateTrip(trip.id, {
          destination: dest.destination_name || trip.destination,
          destinationPlaceId: dest.destination_place_id,
          destinationCountry: dest.destination_country ?? undefined,
          countryCode: dest.destination_country_code ?? trip.countryCode,
          destinationTimezone: dest.destination_timezone ?? trip.destinationTimezone,
          currencyCode: dest.destination_currency ?? trip.currencyCode,
          languageCode: dest.destination_language ?? trip.languageCode,
          lat: dest.lat,
          lon: dest.lon,
        });
      } catch {
        // silencioso (MVP): si falla, el usuario puede continuar sin bloquear la app
      }
    })();
  }, [isPremium, trip?.id, trip?.destination, hasCoords, appLang, updateTrip, trip?.countryCode, trip?.destinationTimezone, trip?.currencyCode, trip?.languageCode]);
  const visibleTools = TOOLS.filter((tool) => {
    if (tool.requiresPremium && !isPremium) return false;
    if (tool.requiresModule && !activeModules.has(tool.requiresModule)) return false;
    return true;
  });

  const beforeYouGoItems = trip
    ? BEFORE_YOU_GO.filter((item) => {
        if (!item.requiresTransport) return true;
        if (!trip.transportType) return false;
        return item.requiresTransport.includes(trip.transportType);
      })
    : [];

  /* Weather V2 (Premium): cache diario desde Edge, no fetch por render */
  useEffect(() => {
    if (!isPremium) return;
    if (!trip?.id || !hasCoords || !trip.startDate || !trip.endDate) return;
    if (trip.weatherForecastDaily && trip.weatherForecastDaily.length > 0) return;
    setForecastStatus('loading');
    void fetchWeatherCache({
      tripId: trip.id,
      lat: Number(trip.lat),
      lon: Number(trip.lon),
      startDate: trip.startDate,
      endDate: trip.endDate,
      timezone: trip.destinationTimezone,
    })
      .then((forecastDaily) => {
        updateTrip(trip.id, { weatherForecastDaily: forecastDaily });
        setForecastStatus('ready');
      })
      .catch(() => { setForecastStatus('error'); });
  }, [isPremium, trip?.id, trip?.lat, trip?.lon, trip?.startDate, trip?.endDate, trip?.destinationTimezone, trip?.weatherForecastDaily?.length]);

  useEffect(() => {
    if (!trip) { setForecastStatus('idle'); return; }
    if (trip.weatherForecastDaily && trip.weatherForecastDaily.length > 0) { setForecastStatus('ready'); return; }
    if (!isPremium) { setForecastStatus('idle'); return; }
    // si es premium y aún no hay datos, el effect de arriba lo manejará
  }, [trip?.id, trip?.weatherForecastDaily?.length, isPremium]);

  function formatDayLabel(dateIso: string) {
    try {
      const d = new Date(`${dateIso}T00:00:00`);
      return d.toLocaleDateString(appLang || 'es', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dateIso;
    }
  }

  const packedCount = packingItems.filter((x) => x.checked).length;
  const totalCount = packingItems.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

  const heroWeather = useMemo(() => {
    if (!trip) return null;
    const first = trip.weatherForecastDaily?.[0];
    if (!first) return trip.weatherForecast ?? null;

    const temps = [first.morning.temp_avg, first.afternoon.temp_avg, first.night.temp_avg].filter((x) => typeof x === 'number') as number[];
    const avgTemp = temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : 0;
    const maxTemp = temps.length ? Math.round(Math.max(...temps)) : avgTemp;
    const minTemp = temps.length ? Math.round(Math.min(...temps)) : avgTemp;
    const rainProbability = Math.round(
      Math.max(
        first.morning.rain_prob_max ?? 0,
        first.afternoon.rain_prob_max ?? 0,
        first.night.rain_prob_max ?? 0,
      )
    );

    const weatherType =
      rainProbability >= 60 ? 'rainy' :
      avgTemp >= 28 ? 'hot' :
      avgTemp >= 20 ? 'warm' :
      avgTemp >= 10 ? 'mild' :
      'cold';

    return {
      avgTemp,
      minTemp,
      maxTemp,
      rainProbability,
      weatherType,
      description: t(`weather.${weatherType}`),
    };
  }, [trip, t]);

  /* Días restantes calculados en tiempo real */
  const daysLeft = useMemo(() => {
    if (!trip?.startDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(trip.startDate + 'T00:00:00');
    const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [trip?.startDate]);

  const heroGradient = trip?.travelType
    ? (HERO_GRADIENT[trip.travelType] ?? HERO_GRADIENT.default)
    : HERO_GRADIENT.default;

  return (
    <div className="min-h-dvh" style={{ background: '#ECE7DC' }}>

      {/* ═══════════════════════════════════════════════
          HERO CARD — trip activo
      ══════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: heroGradient,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          paddingTop: 56,
          paddingBottom: 40,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Decos de fondo */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}/>
        <div className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}/>

        {/* Header row */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C16.27 4 10 10.27 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14z" fill="white" fillOpacity="0.95"/>
              <circle cx="24" cy="18" r="5" fill="white" fillOpacity="0.4"/>
            </svg>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>VIAZA</span>
          </div>
          <Link
            to="/profile"
            className="flex items-center justify-center rounded-full"
            style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="9" fill="white" fillOpacity="0.9"/>
              <path d="M8 42c0-8.84 7.16-16 16-16s16 7.16 16 16" fill="white" fillOpacity="0.7"/>
            </svg>
          </Link>
        </div>

        {trip ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-8"
          >
            {/* Label + días restantes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                {t('home.activeTrip.label')}
              </div>
              {daysLeft !== null && (
                <div style={{
                  background: daysLeft <= 3 ? '#EA9940' : 'rgba(255,255,255,0.18)',
                  borderRadius: 12,
                  padding: '5px 12px',
                  color: 'white',
                  fontFamily: 'Questrial, sans-serif',
                  textAlign: 'center',
                  minWidth: 64,
                }}>
                  {daysLeft > 0 ? (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{daysLeft}</div>
                      <div style={{ fontWeight: 500, fontSize: 10, opacity: 0.85, lineHeight: 1.2 }}>
                        {t('home.activeTrip.daysLeftLabel')}
                      </div>
                    </>
                  ) : daysLeft === 0 ? (
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{t('home.activeTrip.today')}</div>
                  ) : (
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{t('home.activeTrip.inProgress')}</div>
                  )}
                </div>
              )}
            </div>

            {/* Destino grande */}
            <div style={{ color: 'white', fontSize: 38, fontWeight: 700, lineHeight: 1.1, marginTop: 4 }}>
              {trip.destination}
            </div>

            {/* Fechas + duración */}
            {trip.startDate && trip.endDate && (
              <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, marginTop: 6 }}>
                {trip.startDate} — {trip.endDate} · {trip.durationDays} {t('onboarding.dates.days')}
              </div>
            )}

            {/* CLIMA — protagonista */}
            {heroWeather ? (
              <div
                className="mt-5 flex items-center gap-4 rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)' }}
              >
                <WeatherIcon type={heroWeather.weatherType} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                    {heroWeather.avgTemp}°C
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>
                    {heroWeather.description}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 1 }}>
                    {heroWeather.minTemp}° / {heroWeather.maxTemp}° · {t('weather.forecast.rain', { pct: heroWeather.rainProbability })}
                  </div>
                  {isPremium && hasCoords && trip.startDate && trip.endDate && (
                    <button
                      type="button"
                      onClick={() => setShowForecast(true)}
                      style={{
                        marginTop: 8,
                        background: 'rgba(255,255,255,0.22)',
                        border: 'none',
                        borderRadius: 99,
                        padding: '4px 14px',
                        color: 'white',
                        fontFamily: 'Questrial, sans-serif',
                        fontWeight: 600,
                        fontSize: 11,
                        cursor: 'pointer',
                        letterSpacing: 0.5,
                      }}
                    >
                      {t('weather.forecast.title')} →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {trip.climate && (
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    {t(`climate.${trip.climate}`)}
                  </span>
                )}
              </div>
            )}

            {/* Chips: tipo de viaje + moneda + idioma */}
            <div className="mt-3 flex flex-wrap gap-2">
              {trip.travelType && (
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.18)' }}>
                  <TravelTypeIcon type={trip.travelType} />
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{t(`travelType.${trip.travelType}`)}</span>
                </div>
              )}
              {trip.currencyCode && (
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: '#EA9940' }}>
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>{trip.currencyCode}</span>
                </div>
              )}
              {trip.languageCode && (
                <div className="flex items-center rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.18)' }}>
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{trip.languageCode.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="mt-5 w-full rounded-2xl py-4 text-sm font-bold transition active:scale-[0.98]"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#12212E' }}
            >
              {t('home.viewTrip')} →
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-10"
          >
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>{t('home.tagline')}</div>
            <div style={{ color: 'white', fontSize: 30, fontWeight: 700, marginTop: 6, lineHeight: 1.2 }}>
	              {t('home.noTrip.title').split('\n').map((line, i) => (
	                <span key={i}>{line}{i === 0 && <br/>}</span>
	              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="mt-6 rounded-2xl px-8 py-4 text-sm font-bold transition active:scale-[0.98]"
              style={{ background: '#EA9940', color: 'white', boxShadow: '0 4px 20px rgba(234,153,64,0.5)' }}
            >
              {t('home.newTrip')}
            </button>
          </motion.div>
        )}
      </div>

      <div className="space-y-6 px-5 pt-6 pb-36">

        {/* ═══════════════════════════════
            CLIMA — carrusel por día
        ══════════════════════════════ */}
        {trip && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="overflow-hidden rounded-3xl border border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-[rgb(var(--viaza-background-rgb)/0.60)] shadow-[var(--shadow-2)]"
          >
            <div className="flex items-start justify-between gap-3 p-5 pb-3">
              <div>
                <div className="text-sm font-semibold text-[var(--viaza-primary)]">
                  {t('weather.forecast.title')}
                </div>
                <div className="mt-1 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                  {t('weather.forecast.subtitle')}
                </div>
              </div>
              {isPremium && (
                <button
                  type="button"
                  onClick={() => setShowForecast(true)}
                  className="rounded-full bg-[rgb(var(--viaza-primary-rgb)/0.08)] px-3 py-2 text-[11px] font-semibold text-[var(--viaza-primary)] transition active:scale-[0.98]"
                >
                  {t('common.view')}
                </button>
              )}
            </div>

            {!isPremium ? (
              <div className="px-5 pb-5">
                <div className="rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-[rgb(var(--viaza-background-rgb)/0.70)] p-4">
                  <div className="text-sm font-semibold text-[var(--viaza-primary)]">{t('premium.required.title')}</div>
                  <div className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.65)]">{t('premium.required.body')}</div>
                  <button
                    type="button"
                    onClick={() => navigate('/premium')}
                    className="mt-3 w-full rounded-2xl bg-[var(--viaza-accent)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-1)] transition active:scale-[0.98]"
                  >
                    {t('premium.required.cta')}
                  </button>
                </div>
              </div>
            ) : forecastStatus === 'loading' ? (
              <div className="px-5 pb-5">
                <div className="flex items-center gap-3 rounded-2xl bg-[rgb(var(--viaza-primary-rgb)/0.06)] p-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-[var(--viaza-accent)] border-t-transparent"
                  />
                  <div className="text-sm text-[rgb(var(--viaza-primary-rgb)/0.65)]">
                    {t('weather.forecast.loading')}
                  </div>
                </div>
              </div>
            ) : forecastStatus === 'error' ? (
              <div className="px-5 pb-5">
                <div className="rounded-2xl border border-[rgb(var(--viaza-accent-rgb)/0.25)] bg-[rgb(var(--viaza-accent-rgb)/0.08)] p-4 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">
                  {t('weather.forecast.noData')}
                </div>
              </div>
            ) : (
              <div className="px-5 pb-5">
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {(trip.weatherForecastDaily ?? []).map((d) => (
                    <div
                      key={d.date}
                      className="min-w-[170px] flex-shrink-0 rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-[rgb(var(--viaza-background-rgb)/0.80)] p-4"
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--viaza-primary-rgb)/0.55)]">
                        {formatDayLabel(d.date)}
                      </div>
                      <div className="mt-3 space-y-2">
                        {([
                          ['morning', d.morning, 'weather.forecast.morning'],
                          ['afternoon', d.afternoon, 'weather.forecast.afternoon'],
                          ['night', d.night, 'weather.forecast.night'],
                        ] as const).map(([k, seg, labelKey]) => (
                          <div key={k} className="flex items-center justify-between gap-2">
                            <div className="text-xs text-[rgb(var(--viaza-primary-rgb)/0.65)]">{t(labelKey)}</div>
                            <div className="text-xs font-semibold text-[var(--viaza-primary)]">
                              {seg.temp_avg == null ? '—' : `${Math.round(seg.temp_avg)}°`}
                              <span className="ml-2 text-[rgb(var(--viaza-primary-rgb)/0.55)]">
                                {seg.rain_prob_max == null ? '—' : t('weather.forecast.rain', { pct: Math.round(seg.rain_prob_max) })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════
            PACKING PROGRESS CARD
        ══════════════════════════════ */}
        {trip && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="overflow-hidden rounded-3xl"
            style={{ background: 'white', boxShadow: '0 4px 24px rgba(18,33,46,0.10)' }}
          >
            <div className="flex items-center justify-between p-5 pb-3">
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#12212E' }}>{t('home.packingProgress.title')}</div>
                <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.50)', marginTop: 2 }}>
                  {t('home.packingProgress.detail', { packed: packedCount, total: totalCount })}
                </div>
              </div>
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 46, height: 46, background: '#EA9940', boxShadow: '0 4px 12px rgba(234,153,64,0.35)' }}
              >
                <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>{progressPct}%</span>
              </div>
            </div>
            {/* Barra */}
            <div className="mx-5 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(18,33,46,0.07)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-2 rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--viaza-accent), var(--viaza-soft))' }}
              />
            </div>
            <Link
              to="/packing"
              className="mx-5 mb-5 mt-4 flex items-center justify-center rounded-2xl py-3 transition active:scale-[0.98]"
              style={{ background: '#12212E', color: 'white', fontWeight: 700, fontSize: 14 }}
            >
              {t('home.openPacking')}
            </Link>
          </motion.div>
        )}

        {/* ═══════════════════════════════
            ACTIVIDADES DEL VIAJE
        ══════════════════════════════ */}
        {trip && trip.activities && trip.activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
	            <div style={{ fontSize: 16, fontWeight: 700, color: '#12212E', marginBottom: 12 }}>
	              {t('home.activities.title')}
	            </div>
            <div
              className="rounded-3xl p-4"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}
            >
              <div className="flex flex-wrap gap-2">
                {trip.activities.map((act) => (
                  <span
                    key={act}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ background: 'rgba(48,112,130,0.10)', color: '#307082' }}
                  >
                    {t(`activity.${act}`, act)}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/activities')}
                className="mt-3 w-full rounded-2xl py-2.5 text-sm font-bold transition active:scale-[0.98]"
                style={{ background: 'rgba(18,33,46,0.05)', color: '#12212E', border: 'none', cursor: 'pointer' }}
              >
	                {t('home.activities.cta')} →
	              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════
            QUICK TOOLS 2×2
        ══════════════════════════════ */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#12212E', marginBottom: 12 }}>
            {t('home.quickTools.title')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {visibleTools.map((tool, i) => (
              <motion.div
                key={tool.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07 }}
              >
                <Link
                  to={tool.to}
                  className="flex flex-col gap-4 rounded-3xl p-5 transition active:scale-[0.96]"
                  style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}
                >
                  <div
                    className="flex items-center justify-center rounded-2xl"
                    style={{ width: 52, height: 52, background: `${tool.color}18` }}
                  >
                    {tool.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#12212E' }}>{t(tool.labelKey)}</div>
                    <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.50)', marginTop: 2 }}>{t(tool.subtitleKey)}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════
            BEFORE YOU GO
        ══════════════════════════════ */}
        {beforeYouGoItems.length > 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#12212E', marginBottom: 12 }}>
            {t('home.beforeYouGo.title')}
          </div>
          <div className="overflow-hidden rounded-3xl" style={{ background: 'white', boxShadow: '0 4px 20px rgba(18,33,46,0.08)' }}>
            {beforeYouGoItems.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-4 px-5 py-4 transition active:scale-[0.98]"
                style={{ borderBottom: i < beforeYouGoItems.length - 1 ? '1px solid rgba(18,33,46,0.06)' : 'none' }}
              >
                <div
                  className="flex items-center justify-center rounded-2xl flex-shrink-0"
                  style={{ width: 44, height: 44, background: 'rgba(18,33,46,0.05)' }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#12212E' }}>{t(item.labelKey)}</div>
                  <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.50)', marginTop: 1 }}>{t(item.descKey)}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
                  <path d="M18 10l16 14-16 14" stroke="#12212E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
        )}

      </div>

      {/* Modal pronóstico completo */}
      {trip && hasCoords && trip.startDate && trip.endDate && (
        <WeatherForecastModal
          open={showForecast}
          onClose={() => setShowForecast(false)}
          tripId={trip.id}
          lat={Number(trip.lat)}
          lon={Number(trip.lon)}
          startDate={trip.startDate}
          endDate={trip.endDate}
          timezone={trip.destinationTimezone}
          destination={trip.destination}
          cachedDaily={trip.weatherForecastDaily}
        />
      )}
    </div>
  );
}
