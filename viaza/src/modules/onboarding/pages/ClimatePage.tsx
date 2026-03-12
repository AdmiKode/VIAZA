import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { useAppStore } from '../../../app/store/useAppStore';
import type { ClimateType } from '../../../types/trip';

const climates: Array<{ value: ClimateType; labelKey: string }> = [
  { value: 'hot', labelKey: 'climate.hot' },
  { value: 'mild', labelKey: 'climate.mild' },
  { value: 'cold', labelKey: 'climate.cold' },
  { value: 'rainy', labelKey: 'climate.rainy' }
];

export function ClimatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selected = useAppStore((s) => s.onboardingDraft.inferredClimate);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-semibold">{t('onboarding.climate.title')}</h1>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {climates.map((x) => (
          <button key={x.value} className="text-left" onClick={() => setDraft({ inferredClimate: x.value })} type="button">
            <AppCard className={selected === x.value ? 'ring-2 ring-[var(--viaza-accent)]' : ''}>
              <div className="text-sm font-semibold">{t(x.labelKey)}</div>
              <div className="mt-1 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {t('onboarding.climate.note')}
              </div>
            </AppCard>
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <AppButton variant="ghost" className="flex-1" onClick={() => navigate('/onboarding/duration')} type="button">
          {t('common.back')}
        </AppButton>
        <AppButton className="flex-1" onClick={() => navigate('/onboarding/travelers')} disabled={!selected} type="button">
          {t('common.continue')}
        </AppButton>
      </div>
    </div>
  );
}
