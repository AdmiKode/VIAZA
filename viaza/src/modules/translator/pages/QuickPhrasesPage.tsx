import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { quickPhrases, type QuickPhraseCategory } from '../utils/quickPhrasesData';

const categories: Array<{ id: QuickPhraseCategory; titleKey: string }> = [
  { id: 'airport', titleKey: 'quickPhrases.category.airport' },
  { id: 'hotel', titleKey: 'quickPhrases.category.hotel' },
  { id: 'restaurant', titleKey: 'quickPhrases.category.restaurant' },
  { id: 'transport', titleKey: 'quickPhrases.category.transport' },
  { id: 'shopping', titleKey: 'quickPhrases.category.shopping' },
  { id: 'directions', titleKey: 'quickPhrases.category.directions' },
  { id: 'health', titleKey: 'quickPhrases.category.health' },
  { id: 'emergency', titleKey: 'quickPhrases.category.emergency' },
  { id: 'basic_conversation', titleKey: 'quickPhrases.category.basic' }
];

export function QuickPhrasesPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<QuickPhraseCategory>('airport');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const items = useMemo(() => quickPhrases.filter((p) => p.category === category), [category]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('translator.quickPhrases')} />

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
        {items.map((p) => (
          <button
            key={p.id}
            type="button"
            className="w-full text-left"
            onClick={async () => {
              const phrase = t(p.phraseKey);
              try {
                await navigator.clipboard.writeText(phrase);
                setCopiedId(p.id);
                window.setTimeout(() => setCopiedId((prev) => (prev === p.id ? null : prev)), 1200);
              } catch {
                // Ignorar si el navegador no permite clipboard
              }
            }}
          >
            <AppCard>
              <div className="text-sm font-semibold">{t(p.phraseKey)}</div>
              <div className="mt-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {copiedId === p.id ? t('quickPhrases.copied') : t('quickPhrases.tapHint')}
              </div>
            </AppCard>
          </button>
        ))}
      </div>
    </div>
  );
}
