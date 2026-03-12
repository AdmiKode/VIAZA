import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppSelect } from '../../../components/ui/AppSelect';
import { adapterGuides } from '../utils/countryAdapterData';

export function AdapterGuidePage() {
  const { t } = useTranslation();
  const [countryCode, setCountryCode] = useState(adapterGuides[0]?.countryCode ?? '');

  const guide = useMemo(() => adapterGuides.find((g) => g.countryCode === countryCode) ?? null, [countryCode]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('adapters.title')} />

      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('adapters.select')}</div>
          <div className="mt-2">
            <AppSelect value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              {adapterGuides.map((g) => (
                <option key={g.countryCode} value={g.countryCode}>
                  {t(g.countryNameKey)}
                </option>
              ))}
            </AppSelect>
          </div>
        </AppCard>

        <AppCard>
          <div className="text-sm font-semibold">{guide ? t(guide.countryNameKey) : '-'}</div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('adapters.plugTypes')}</div>
              <div className="mt-1 font-semibold">{guide?.plugTypes.join(', ') ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('adapters.voltage')}</div>
              <div className="mt-1 font-semibold">{guide?.voltage ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('adapters.frequency')}</div>
              <div className="mt-1 font-semibold">{guide?.frequency ?? '-'}</div>
            </div>
          </div>

          {guide?.recommendationKey ? (
            <div className="mt-4 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">{t(guide.recommendationKey)}</div>
          ) : null}
        </AppCard>
      </div>
    </div>
  );
}
