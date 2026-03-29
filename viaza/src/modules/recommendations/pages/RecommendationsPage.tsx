import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';
import { useAppStore } from '../../../app/store/useAppStore';
import { fetchNearbyPlaces, type RecommendationCategory, type NearbyPlace } from '../../../services/recommendationsService';

// ─── Risk Zones data ─────────────────────────────────────────────────────────
// Alertas curadas basadas en clasificaciones de riesgo para viajeros.
// Nivel: 1=Precaución, 2=Mayor cuidado, 3=Reconsiderar, 4=No viajar

interface RiskZone {
  level: 1 | 2 | 3 | 4;
  label: string;
  tip: string;
}

const RISK_DB: Record<string, RiskZone> = {
  // Nivel 4
  AF: { level: 4, label: 'Afganistán', tip: 'No viajar. Conflicto activo y riesgo extremo de secuestro.' },
  SD: { level: 4, label: 'Sudán', tip: 'No viajar. Conflicto armado generalizado.' },
  SO: { level: 4, label: 'Somalia', tip: 'No viajar. Alto riesgo de terrorismo y secuestro.' },
  YE: { level: 4, label: 'Yemen', tip: 'No viajar. Guerra civil activa.' },
  MM: { level: 4, label: 'Myanmar', tip: 'No viajar. Inestabilidad política severa.' },
  // Nivel 3
  MX: { level: 3, label: 'México', tip: 'Algunas regiones con alta violencia. Verifica tu destino específico.' },
  VE: { level: 3, label: 'Venezuela', tip: 'Reconsiderar. Alta criminalidad y crisis humanitaria.' },
  NG: { level: 3, label: 'Nigeria', tip: 'Reconsiderar. Riesgo de secuestro en ciertas regiones.' },
  PK: { level: 3, label: 'Pakistán', tip: 'Reconsiderar. Terrorismo y conflictos fronterizos.' },
  ET: { level: 3, label: 'Etiopía', tip: 'Reconsiderar. Conflictos armados regionales.' },
  HT: { level: 3, label: 'Haití', tip: 'Reconsiderar. Alta violencia de pandillas.' },
  // Nivel 2
  CO: { level: 2, label: 'Colombia', tip: 'Mayor cuidado. Algunas zonas con actividad de grupos armados.' },
  BR: { level: 2, label: 'Brasil', tip: 'Mayor cuidado. Crimen en zonas urbanas y favelas.' },
  ZA: { level: 2, label: 'Sudáfrica', tip: 'Mayor cuidado. Alta tasa de delincuencia en ciudades.' },
  KE: { level: 2, label: 'Kenia', tip: 'Mayor cuidado. Terrorismo y robos en zonas turísticas.' },
  EG: { level: 2, label: 'Egipto', tip: 'Mayor cuidado. Riesgo de terrorismo en zonas no turísticas.' },
  TH: { level: 2, label: 'Tailandia', tip: 'Mayor cuidado al norte. Estafas a turistas frecuentes.' },
  PE: { level: 2, label: 'Perú', tip: 'Mayor cuidado. Crimen en Lima y algunas zonas andinas.' },
  PH: { level: 2, label: 'Filipinas', tip: 'Mayor cuidado. Zona sur con riesgo de terrorismo.' },
};

const RISK_COLORS: Record<1|2|3|4, string> = {
  1: '#6CA3A2',
  2: '#EA9940',
  3: '#EA9940',
  4: '#12212E',
};

const RISK_LABELS: Record<1|2|3|4, string> = {
  1: 'Precaución',
  2: 'Mayor cuidado',
  3: 'Reconsiderar',
  4: 'No viajar',
};

// Intenta detectar el código de país del destino del viaje
function detectCountryCode(destination: string | undefined): string | null {
  if (!destination) return null;
  const lower = destination.toLowerCase();
  const map: Record<string, string> = {
    'méxico': 'MX', 'mexico': 'MX', 'colombia': 'CO', 'brasil': 'BR', 'brazil': 'BR',
    'venezuela': 'VE', 'perú': 'PE', 'peru': 'PE', 'nigeria': 'NG', 'kenia': 'KE',
    'kenya': 'KE', 'egipto': 'EG', 'egypt': 'EG', 'tailandia': 'TH', 'thailand': 'TH',
    'sudáfrica': 'ZA', 'south africa': 'ZA', 'filipinas': 'PH', 'philippines': 'PH',
    'afganistán': 'AF', 'afghanistan': 'AF', 'somalia': 'SO', 'yemen': 'YE',
    'myanmar': 'MM', 'birmania': 'MM', 'haití': 'HT', 'haiti': 'HT',
    'etiopía': 'ET', 'ethiopia': 'ET', 'pakistán': 'PK', 'pakistan': 'PK',
    'sudán': 'SD', 'sudan': 'SD',
  };
  for (const [key, code] of Object.entries(map)) {
    if (lower.includes(key)) return code;
  }
  return null;
}

function RiskZoneBanner({ destination }: { destination: string | undefined }) {
  const [dismissed, setDismissed] = useState(false);
  const code = detectCountryCode(destination);
  if (!code || !RISK_DB[code] || dismissed) return null;
  const zone = RISK_DB[code];
  if (zone.level === 1) return null; // nivel 1 no lo mostramos
  const color = RISK_COLORS[zone.level];
  const isMaxLevel = zone.level === 4;

  return (
    <div style={{
      background: isMaxLevel ? '#12212E' : `${color}18`,
      border: `1.5px solid ${isMaxLevel ? '#12212E' : color + '55'}`,
      borderRadius: 14, padding: '12px 14px', marginTop: 12,
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isMaxLevel ? '#EA9940' : color} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: isMaxLevel ? '#EA9940' : color, marginBottom: 3 }}>
          {RISK_LABELS[zone.level]}: {zone.label}
        </div>
        <div style={{ fontSize: 12, color: isMaxLevel ? 'rgba(255,255,255,0.75)' : 'rgba(18,33,46,0.7)', lineHeight: 1.5 }}>{zone.tip}</div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', color: isMaxLevel ? 'rgba(255,255,255,0.4)' : 'rgba(18,33,46,0.3)', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1, flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  );
}

const CATEGORIES: Array<{ id: RecommendationCategory; titleKey: string }> = [
  { id: 'attraction', titleKey: 'recommendations.category.attraction' },
  { id: 'restaurant', titleKey: 'recommendations.category.restaurant' },
  { id: 'cafe', titleKey: 'recommendations.category.cafe' },
  { id: 'museum', titleKey: 'recommendations.category.museum' },
  { id: 'park', titleKey: 'recommendations.category.park' },
  { id: 'shopping', titleKey: 'recommendations.category.shopping' },
];

export function RecommendationsPage() {
  const { t } = useTranslation();
  const isPremium = useAppStore((s) => s.isPremium);
  const lang = useAppStore((s) => s.currentLanguage);
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trip = useAppStore((s) => s.trips.find((x) => x.id === currentTripId) ?? null);
  const savedPlaces = useAppStore((s) => s.savedPlaces);
  const addSavedPlace = useAppStore((s) => s.addSavedPlace);

  const [category, setCategory] = useState<RecommendationCategory>('attraction');
  const [items, setItems] = useState<NearbyPlace[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const savedPlaceIds = useMemo(() => {
    const set = new Set<string>();
    for (const p of savedPlaces) {
      if (trip?.id && p.tripId === trip.id && p.googlePlaceId) set.add(p.googlePlaceId);
    }
    return set;
  }, [savedPlaces, trip?.id]);

  if (!isPremium) {
    return (
      <div className="px-4 pt-4 pb-24">
        <AppHeader title={t('recommendations.title')} />
        <AppCard className="mt-4">
          <div className="text-sm font-semibold text-[var(--viaza-primary)]">
            {t('premium.required.title')}
          </div>
          <div className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.65)]">
            {t('premium.required.body')}
          </div>
          <Link to="/premium" className="mt-4 block">
            <AppButton className="w-full" type="button">
              {t('premium.required.cta')}
            </AppButton>
          </Link>
        </AppCard>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('recommendations.title')} />

      <div className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.60)]">
        {t('recommendations.subtitle')}
      </div>

      {/* Risk Zones Banner */}
      <RiskZoneBanner destination={trip?.destination} />

      <div className="mt-4 flex gap-2 overflow-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={
              category === c.id
                ? 'rounded-full bg-[var(--viaza-primary)] px-4 py-2 text-xs text-[var(--viaza-background)]'
                : 'rounded-full border border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-[rgb(var(--viaza-background-rgb)/0.65)] px-4 py-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.75)]'
            }
            onClick={() => setCategory(c.id)}
          >
            {t(c.titleKey)}
          </button>
        ))}
      </div>

      <AppButton
        className="mt-3 w-full"
        type="button"
        disabled={!trip?.id || status === 'loading'}
        onClick={async () => {
          if (!trip?.id) return;
          setStatus('loading');
          try {
            const res = await fetchNearbyPlaces({
              tripId: trip.id,
              category,
              language: lang,
              radiusM: 2500,
            });
            setItems(res);
            setStatus('ready');
          } catch {
            setStatus('error');
          }
        }}
      >
        {status === 'loading' ? t('recommendations.loading') : t('recommendations.cta')}
      </AppButton>

      {status === 'error' && (
        <div className="mt-3 text-sm text-[var(--viaza-accent)]">
          {t('recommendations.error')}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {status === 'ready' && items.length === 0 && (
          <AppCard>
            <div className="text-sm text-[rgb(var(--viaza-primary-rgb)/0.70)]">
              {t('recommendations.empty')}
            </div>
          </AppCard>
        )}

        {items.map((p) => {
          const isSaved = savedPlaceIds.has(p.place_id);
          const canSave = Boolean(trip?.id && p.lat != null && p.lon != null);
          return (
            <AppCard key={p.place_id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--viaza-primary)]">
                    {p.name}
                  </div>
                  {p.address && (
                    <div className="mt-1 truncate text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                      {p.address}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.65)]">
                    {p.rating != null && (
                      <span>
                        {t('recommendations.rating', { rating: p.rating, n: p.user_ratings_total ?? 0 })}
                      </span>
                    )}
                    {p.price_level != null && (
                      <span>
                        {t('recommendations.priceLevel', { n: p.price_level })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canSave || isSaved}
                  className="rounded-2xl px-3 py-2 text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: isSaved ? 'rgb(var(--viaza-primary-rgb) / 0.10)' : 'var(--viaza-accent)',
                    color: isSaved ? 'var(--viaza-primary)' : 'var(--viaza-background)',
                    border: 'none',
                  }}
                  onClick={() => {
                    if (!trip?.id || p.lat == null || p.lon == null) return;
                    addSavedPlace({
                      tripId: trip.id,
                      name: p.name,
                      address: p.address ?? undefined,
                      lat: p.lat,
                      lon: p.lon,
                      category: category === 'attraction' ? 'attraction' : category,
                      googlePlaceId: p.place_id,
                      status: 'want_to_go',
                    });
                  }}
                >
                  {isSaved ? t('recommendations.saved') : t('recommendations.save')}
                </button>
              </div>
            </AppCard>
          );
        })}
      </div>
    </div>
  );
}

