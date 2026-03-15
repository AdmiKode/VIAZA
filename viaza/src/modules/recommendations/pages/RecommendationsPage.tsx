import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';
import { useAppStore } from '../../../app/store/useAppStore';
import { fetchNearbyPlaces, type RecommendationCategory, type NearbyPlace } from '../../../services/recommendationsService';

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

