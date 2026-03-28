import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';

const tools = [
  { to: '/route',              titleKey: 'trip.route',        subtitleKey: 'tools.route.subtitle', icon: 'route' as const },
  { to: '/translator',         titleKey: 'translator.title',  subtitleKey: 'tools.translator.subtitle' },
  { to: '/currency',           titleKey: 'currency.title',    subtitleKey: 'tools.currency.subtitle' },
  { to: '/split-bill',         titleKey: 'splitBill.title',   subtitleKey: 'tools.splitBill.subtitle' },
  { to: '/adapters',           titleKey: 'adapters.title',    subtitleKey: 'tools.adapters.subtitle' },
  { to: '/itinerary',          titleKey: 'itinerary.title',   subtitleKey: 'tools.itinerary.subtitle' },
  { to: '/agenda',             titleKey: 'agenda.title',      subtitleKey: 'tools.agenda.subtitle' },
  { to: '/places',             titleKey: 'places.title',      subtitleKey: 'tools.places.subtitle' },
  { to: '/import-reservation', titleKey: 'import.title',      subtitleKey: 'tools.import.subtitle' },
];

function ToolIcon({ type }: { type?: 'route' }) {
  if (type === 'route') {
    return (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <circle cx="12" cy="12" r="5" fill="#307082" />
        <circle cx="36" cy="36" r="5" fill="#EA9940" />
        <path d="M12 18v8a8 8 0 0 0 8 8h10" stroke="#12212E" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="8" width="32" height="32" rx="8" fill="rgb(18 33 46 / 0.10)" />
    </svg>
  );
}

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
              <div className="mt-4 flex h-10 items-center rounded-2xl bg-[rgb(var(--viaza-primary-rgb)/0.04)] px-3">
                <ToolIcon type={tool.icon} />
              </div>
            </AppCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
