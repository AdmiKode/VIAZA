import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { survivalTips, type SurvivalTipCategory } from '../utils/survivalTipsData';
import { useAppStore } from '../../../app/store/useAppStore';

const categories: Array<{ id: SurvivalTipCategory | 'all'; titleKey: string }> = [
  { id: 'all', titleKey: 'tips.category.all' },
  { id: 'camping', titleKey: 'survival.category.camping' },
  { id: 'mountain', titleKey: 'survival.category.mountain' },
  { id: 'beach', titleKey: 'survival.category.beach' },
  { id: 'nature', titleKey: 'survival.category.nature' }
];

export function SurvivalTipsPage() {
  const { t } = useTranslation();
  const appLang = useAppStore((s) => s.currentLanguage);
  const [category, setCategory] = useState<(typeof categories)[number]['id']>('all');

  const items = useMemo(() => {
    if (category === 'all') return survivalTips;
    return survivalTips.filter((x) => x.category === category);
  }, [category]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('survivalTips.title')} />

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
        {items.map((tip) => (
          <AppCard key={tip.id}>
            <div className="text-sm font-semibold">
              {tip.titleKey
                ? t(tip.titleKey)
                : (appLang.startsWith('en') ? tip.titleEn : tip.titleEs)}
            </div>
            <div className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">
              {tip.descriptionKey
                ? t(tip.descriptionKey)
                : (appLang.startsWith('en') ? tip.descriptionEn : tip.descriptionEs)}
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
