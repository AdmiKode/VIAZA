import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';

export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="px-4 pt-4">
      <AppHeader title={t(titleKey)} />
      <div className="mt-6 rounded-2xl border border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-[rgb(var(--viaza-background-rgb)/0.65)] p-4">
        <p className="text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">{t('common.comingSoon')}</p>
      </div>
    </div>
  );
}
