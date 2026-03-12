import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { searchAirportItems } from '../utils/airportItemsSearch';
import type { AllowStatus } from '../utils/airportItemsData';

function badgeClass(status: AllowStatus) {
  if (status === 'allowed') return 'bg-[rgb(var(--viaza-soft-rgb)/0.30)] text-[var(--viaza-primary)]';
  if (status === 'restricted') return 'bg-[rgb(var(--viaza-accent-rgb)/0.22)] text-[var(--viaza-primary)]';
  return 'bg-[rgb(var(--viaza-primary-rgb)/0.08)] text-[rgb(var(--viaza-primary-rgb)/0.75)]';
}

export function AllowedItemsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const items = useMemo(() => searchAirportItems(query), [query]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('allowedItems.title')} />

      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('allowedItems.search')}</div>
          <div className="mt-2">
            <AppInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('allowedItems.searchPlaceholder')} />
          </div>
        </AppCard>

        <div className="space-y-3">
          {items.map((item) => (
            <AppCard key={item.id}>
              <div className="text-sm font-semibold">{t(item.labelKey)}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.10)] p-3">
                  <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('allowedItems.carryOn')}</div>
                  <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(item.carryOn)}`}>
                    {t(`allowedItems.status.${item.carryOn}`)}
                  </div>
                </div>
                <div className="rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.10)] p-3">
                  <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('allowedItems.checked')}</div>
                  <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(item.checked)}`}>
                    {t(`allowedItems.status.${item.checked}`)}
                  </div>
                </div>
              </div>
              {item.notesKey ? (
                <div className="mt-3 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t(item.notesKey)}</div>
              ) : null}
            </AppCard>
          ))}
        </div>
      </div>
    </div>
  );
}

