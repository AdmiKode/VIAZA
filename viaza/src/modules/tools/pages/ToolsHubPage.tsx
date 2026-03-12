import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';

const tools = [
  { to: '/translator', titleKey: 'translator.title', subtitleKey: 'tools.translator.subtitle' },
  { to: '/currency', titleKey: 'currency.title', subtitleKey: 'tools.currency.subtitle' },
  { to: '/split-bill', titleKey: 'splitBill.title', subtitleKey: 'tools.splitBill.subtitle' },
  { to: '/adapters', titleKey: 'adapters.title', subtitleKey: 'tools.adapters.subtitle' }
];

export function ToolsHubPage() {
  const { t } = useTranslation();

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('tools.title')} />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="block">
            <AppCard className="h-full">
              <div className="text-sm font-semibold">{t(tool.titleKey)}</div>
              <div className="mt-1 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">
                {t(tool.subtitleKey)}
              </div>
              <div className="mt-4 h-10 rounded-2xl bg-[rgb(var(--viaza-primary-rgb)/0.04)]" />
            </AppCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

