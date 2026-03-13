import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { localTips, type LocalTipCategory } from '../utils/localTipsData';
import { useAppStore } from '../../../app/store/useAppStore';

const categories: Array<{ id: LocalTipCategory | 'all'; titleKey: string }> = [
  { id: 'all', titleKey: 'tips.category.all' },
  { id: 'safety', titleKey: 'tips.category.safety' },
  { id: 'transport', titleKey: 'tips.category.transport' },
  { id: 'culture', titleKey: 'tips.category.culture' },
  { id: 'money', titleKey: 'tips.category.money' },
  { id: 'food', titleKey: 'tips.category.food' },
  { id: 'utilities', titleKey: 'tips.category.utilities' }
];

export function LocalTipsPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<(typeof categories)[number]['id']>('all');

  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const trip = useMemo(() => trips.find((x) => x.id === currentTripId) ?? null, [trips, currentTripId]);
  const countryCode = trip?.countryCode ?? null;

  const items = useMemo(() => {
    const filtered = localTips.filter((tip) => !tip.countryCode || tip.countryCode === countryCode);
    if (category === 'all') return filtered;
    return filtered.filter((x) => x.category === category);
  }, [category, countryCode]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('localTips.title')} />

      {trip && (
        <div className="mt-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.55)]">
          {trip.destination}
        </div>
      )}

      <div className="mt-4 flex gap-2 overflow-auto pb-1">
        {categories.map((c) => (
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

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-[rgb(var(--viaza-primary-rgb)/0.50)]">
            {t('localTips.noTips')}
          </div>
        ) : (
          items.map((tip) => (
            <AppCard key={tip.id}>
              <div className="text-sm font-semibold">{t(tip.titleKey)}</div>
              <div className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">
                {t(tip.descriptionKey)}
              </div>
            </AppCard>
          ))
        )}
      </div>
    </div>
  );
}
