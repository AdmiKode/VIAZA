import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { fetchForecast, fetchCurrentConditions } from '../../../engines/weatherEngine';

// Duotone SVG icons for each card type
const WEATHER_ICON: Record<string, JSX.Element> = {
  hot: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill="var(--viaza-accent)" opacity="0.20" />
      <circle cx="24" cy="24" r="11" fill="var(--viaza-accent)" />
      <circle cx="20" cy="19" r="5" fill="white" opacity="0.55" />
    </svg>
  ),
  warm: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="14" fill="var(--viaza-accent)" />
      <circle cx="20" cy="19" r="6" fill="white" opacity="0.50" />
      <path d="M37 22a9 9 0 0 0-17.3-3.5A6.5 6.5 0 1 0 11 24h22" fill="white" opacity="0.25" />
    </svg>
  ),
  mild: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="12" fill="var(--viaza-accent)" />
      <circle cx="20" cy="19" r="5" fill="white" opacity="0.55" />
      <path d="M37 22a9 9 0 0 0-17.3-3.5A6.5 6.5 0 1 0 12 27h20" fill="white" opacity="0.30" />
    </svg>
  ),
  cold: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <line x1="24" y1="5" x2="24" y2="43" stroke="var(--viaza-accent)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="5" y1="24" x2="43" y2="24" stroke="var(--viaza-accent)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="9" y1="9" x2="39" y2="39" stroke="var(--viaza-accent)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="39" y1="9" x2="9" y2="39" stroke="var(--viaza-accent)" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="6" fill="white" opacity="0.55" />
    </svg>
  ),
  snowy: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="18" r="10" fill="white" opacity="0.60" />
      <circle cx="30" cy="26" r="9" fill="white" opacity="0.50" />
      <circle cx="16" cy="27" r="9" fill="white" opacity="0.50" />
      <rect x="9" y="26" width="30" height="10" rx="3" fill="var(--viaza-accent)" opacity="0.15" />
      <circle cx="17" cy="38" r="3" fill="var(--viaza-accent)" opacity="0.70" />
      <circle cx="24" cy="40" r="3" fill="var(--viaza-accent)" opacity="0.70" />
      <circle cx="31" cy="38" r="3" fill="var(--viaza-accent)" opacity="0.70" />
    </svg>
  ),
  rainy: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <path d="M37 21a9 9 0 0 0-17.3-3.5A6.5 6.5 0 1 0 9 23h28a9 9 0 0 0 0-2z" fill="var(--viaza-accent)" />
      <line x1="14" y1="31" x2="11" y2="43" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="24" y1="31" x2="21" y2="43" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="34" y1="31" x2="31" y2="43" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),
};

const CURRENCY_ICON = (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
    <circle cx="18" cy="26" r="14" fill="var(--viaza-accent)" />
    <circle cx="30" cy="22" r="14" fill="white" opacity="0.55" />
  </svg>
);

const LANGUAGE_ICON = (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="19" fill="var(--viaza-accent)" />
    <ellipse cx="24" cy="24" rx="8" ry="19" fill="white" opacity="0.55" />
    <line x1="5" y1="24" x2="43" y2="24" stroke="white" strokeWidth="2.5" opacity="0.55" />
  </svg>
);

const PLUG_ICON = (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
    <rect x="13" y="20" width="22" height="22" rx="7" fill="var(--viaza-accent)" />
    <rect x="17" y="9" width="5" height="13" rx="2.5" fill="var(--viaza-accent)" />
    <rect x="26" y="9" width="5" height="13" rx="2.5" fill="var(--viaza-accent)" />
    <rect x="13" y="20" width="22" height="10" rx="7" fill="white" opacity="0.55" />
  </svg>
);

interface DetectionItem {
  key: string;
  labelKey: string;
  value: string;
  icon: JSX.Element;
}

export function SmartTripDetectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const draft = useAppStore((s) => s.onboardingDraft);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherDone, setWeatherDone] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [currentDesc, setCurrentDesc] = useState<string | null>(null);

  // Fetch real weather if lat/lon available
  useEffect(() => {
    if (!draft.lat || !draft.lon || !draft.startDate || !draft.endDate) {
      setWeatherDone(true);
      return;
    }
    setWeatherLoading(true);
    Promise.all([
      fetchForecast(draft.lat, draft.lon, draft.startDate, draft.endDate),
      fetchCurrentConditions(draft.lat, draft.lon),
    ])
      .then(([forecast, current]) => {
        setDraft({ weatherForecast: forecast });
        if (current?.description) setCurrentDesc(current.description);
        setWeatherLoading(false);
        setWeatherDone(true);
      })
      .catch(() => {
        setWeatherLoading(false);
        setWeatherDone(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weatherType = draft.weatherForecast?.weatherType ?? (draft.inferredClimate === 'cold' ? 'cold' : draft.inferredClimate === 'rainy' ? 'rainy' : 'mild');
  const weatherLabel = draft.weatherForecast
    ? `${draft.weatherForecast.avgTemp}°C · ${currentDesc ?? draft.weatherForecast.description}${draft.weatherForecast.rainProbability > 30 ? ` · ${draft.weatherForecast.rainProbability}% lluvia` : ''}`
    : t(`climate.${draft.inferredClimate ?? 'mild'}`);

  const items: DetectionItem[] = [
    {
      key: 'weather',
      labelKey: 'smart.climate',
      value: weatherLabel,
      icon: WEATHER_ICON[weatherType] ?? WEATHER_ICON.mild,
    },
    {
      key: 'currency',
      labelKey: 'smart.currency',
      value: draft.inferredCurrency,
      icon: CURRENCY_ICON,
    },
    {
      key: 'language',
      labelKey: 'smart.language',
      value: draft.inferredLanguage.toUpperCase(),
      icon: LANGUAGE_ICON,
    },
    {
      key: 'plug',
      labelKey: 'smart.plug',
      value: t('smart.checkAdapters'),
      icon: PLUG_ICON,
    },
  ];

  // Reveal cards one by one after weather is done
  useEffect(() => {
    if (!weatherDone) return;
    if (revealed >= items.length) return;
    const timer = setTimeout(() => setRevealed((r) => r + 1), 350);
    return () => clearTimeout(timer);
  }, [weatherDone, revealed, items.length]);

  const allRevealed = weatherDone && revealed >= items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-full flex-col px-5 pt-8 pb-10"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--viaza-secondary-rgb)/0.12)] px-3 py-1">
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="h-1.5 w-1.5 rounded-full bg-[var(--viaza-secondary)]"
          />
          <span className="text-xs font-semibold text-[var(--viaza-secondary)]">
            {weatherLoading ? t('smart.detecting') : t('smart.analyzing')}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-[var(--viaza-primary)]">
          {t('smart.title')}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
          {draft.destination}
          {draft.startDate && draft.endDate
            ? ` · ${draft.durationDays} ${t('onboarding.dates.days')}`
            : ''}
        </p>
      </div>

      {/* Weather loading state */}
      {weatherLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex items-center gap-3 rounded-2xl bg-[rgb(var(--viaza-secondary-rgb)/0.08)] p-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="h-5 w-5 rounded-full border-2 border-[var(--viaza-secondary)] border-t-transparent"
          />
          <span className="text-sm font-medium text-[var(--viaza-secondary)]">
            {t('smart.fetchingWeather')}
          </span>
        </motion.div>
      )}

      {/* Detection cards */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {items.slice(0, revealed).map((item) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-2)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--viaza-accent-rgb)/0.08)]">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--viaza-primary-rgb)/0.45)]">
                  {t(item.labelKey)}
                </div>
                <div className="mt-0.5 text-base font-semibold text-[var(--viaza-primary)] truncate">
                  {item.value}
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                className="ml-auto flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[rgb(var(--viaza-secondary-rgb)/0.12)]"
              >
                <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                  <path d="M13 24l9 9 13-15" stroke="var(--viaza-secondary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loader dots while revealing */}
        {weatherDone && !allRevealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-2xl border border-dashed border-[rgb(var(--viaza-primary-rgb)/0.12)] p-4"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-[var(--viaza-accent)]"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-sm text-[rgb(var(--viaza-primary-rgb)/0.50)]">
              {t('smart.detecting')}
            </span>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-auto flex gap-3 pt-8"
          >
            <button
              type="button"
              onClick={() => navigate('/onboarding/dates')}
              className="flex-1 rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.12)] py-4 text-base font-semibold text-[var(--viaza-primary)] transition-all active:scale-[0.98]"
            >
              {t('common.back')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/onboarding/travel-type')}
              className="flex-1 rounded-2xl bg-[var(--viaza-primary)] py-4 text-base font-semibold text-[var(--viaza-background)] shadow-[var(--shadow-2)] transition-all active:scale-[0.98]"
            >
              {t('smart.looksGood')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
