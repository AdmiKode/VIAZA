import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';

export function PremiumPage() {
  const { t } = useTranslation();
  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('premium.title')} />
      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="text-sm font-semibold">{t('premium.subtitle')}</div>
          <div className="mt-3 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">{t('premium.note')}</div>
          <div className="mt-4">
            <AppButton className="w-full" type="button">
              {t('premium.cta')}
            </AppButton>
          </div>
        </AppCard>
      </div>
    </div>
  );
}

