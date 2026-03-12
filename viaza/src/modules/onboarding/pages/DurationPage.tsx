import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../../../components/ui/AppButton';
import { useAppStore } from '../../../app/store/useAppStore';

export function DurationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const durationDays = useAppStore((s) => s.onboardingDraft.durationDays);
  const setDraft = useAppStore((s) => s.setOnboardingDraft);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-semibold">{t('onboarding.duration.title')}</h1>
      <p className="mt-1 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">
        {t('onboarding.duration.prompt')}
      </p>

      <div className="mt-6 rounded-3xl border border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-[rgb(var(--viaza-background-rgb)/0.65)] p-4">
        <div className="text-3xl font-semibold">{durationDays}</div>
        <input
          className="mt-4 w-full"
          type="range"
          min={1}
          max={30}
          value={durationDays}
          onChange={(e) => setDraft({ durationDays: Number(e.target.value) })}
        />
        <div className="mt-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
          {t('onboarding.duration.note')}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <AppButton variant="ghost" className="flex-1" onClick={() => navigate('/onboarding/destination')} type="button">
          {t('common.back')}
        </AppButton>
        <AppButton className="flex-1" onClick={() => navigate('/onboarding/climate')} type="button">
          {t('common.continue')}
        </AppButton>
      </div>
    </div>
  );
}
