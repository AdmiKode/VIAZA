import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { useAppStore } from '../../../app/store/useAppStore';
import type { LaundryMode } from '../../../types/trip';

const modes: Array<{ value: LaundryMode; labelKey: string; descriptionKey: string }> = [
  { value: 'none', labelKey: 'laundryMode.none', descriptionKey: 'laundryMode.none.note' },
  { value: 'laundry_service', labelKey: 'laundryMode.laundry_service', descriptionKey: 'laundryMode.laundry_service.note' },
  { value: 'washer', labelKey: 'laundryMode.washer', descriptionKey: 'laundryMode.washer.note' }
];

export function LaundryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selected = useAppStore((s) => s.onboardingDraft.laundryMode);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-semibold">{t('onboarding.laundry.title')}</h1>
      <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">
        {t('onboarding.laundry.prompt')}
      </p>

      <div className="mt-4 space-y-3">
        {modes.map((x) => (
          <button key={x.value} className="w-full text-left" onClick={() => setDraft({ laundryMode: x.value })} type="button">
            <AppCard className={selected === x.value ? 'ring-2 ring-[var(--viaza-accent)]' : ''}>
              <div className="text-sm font-semibold">{t(x.labelKey)}</div>
              <div className="mt-1 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {t(x.descriptionKey)}
              </div>
            </AppCard>
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <AppButton variant="ghost" className="flex-1" onClick={() => navigate('/onboarding/travelers')} type="button">
          {t('common.back')}
        </AppButton>
        <AppButton className="flex-1" onClick={() => navigate('/onboarding/summary')} type="button">
          {t('common.continue')}
        </AppButton>
      </div>
    </div>
  );
}
