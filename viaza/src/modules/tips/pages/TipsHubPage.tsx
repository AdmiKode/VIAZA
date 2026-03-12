import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';

const tips = [
  { to: '/tips/local', titleKey: 'localTips.title', subtitleKey: 'tips.local.subtitle' },
  { to: '/tips/survival', titleKey: 'survivalTips.title', subtitleKey: 'tips.survival.subtitle' }
];

export function TipsHubPage() {
  const { t } = useTranslation();

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('tips.title')} />

      <div className="mt-4 space-y-3">
        {tips.map((tip) => (
          <Link key={tip.to} to={tip.to} className="block">
            <AppCard>
              <div className="text-sm font-semibold">{t(tip.titleKey)}</div>
              <div className="mt-1 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {t(tip.subtitleKey)}
              </div>
            </AppCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

