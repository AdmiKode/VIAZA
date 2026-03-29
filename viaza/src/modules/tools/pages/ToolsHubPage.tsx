import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';

const tools = [
  { to: '/route',              titleKey: 'trip.route',        subtitleKey: 'tools.route.subtitle',    icon: 'route'    as const },
  { to: '/weather',            titleKey: 'weather.title',     subtitleKey: 'tools.weather.subtitle',  icon: 'weather'  as const },
  { to: '/health',             titleKey: 'health.title',      subtitleKey: 'tools.health.subtitle',   icon: 'health'   as const },
  { to: '/airport-flow',       titleKey: 'airport.title',     subtitleKey: 'tools.airport.subtitle',  icon: 'airport'  as const },
  { to: '/translator',         titleKey: 'translator.title',  subtitleKey: 'tools.translator.subtitle' },
  { to: '/currency',           titleKey: 'currency.title',    subtitleKey: 'tools.currency.subtitle' },
  { to: '/split-bill',         titleKey: 'splitBill.title',   subtitleKey: 'tools.splitBill.subtitle' },
  { to: '/adapters',           titleKey: 'adapters.title',    subtitleKey: 'tools.adapters.subtitle' },
  { to: '/itinerary',          titleKey: 'itinerary.title',   subtitleKey: 'tools.itinerary.subtitle' },
  { to: '/agenda',             titleKey: 'agenda.title',      subtitleKey: 'tools.agenda.subtitle' },
  { to: '/places',             titleKey: 'places.title',      subtitleKey: 'tools.places.subtitle' },
  { to: '/import-reservation', titleKey: 'import.title',      subtitleKey: 'tools.import.subtitle' },
];

type ToolIconType = 'route' | 'weather' | 'health' | 'airport';

function ToolIcon({ type }: { type?: ToolIconType }) {
  if (type === 'route') {
    return (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <circle cx="12" cy="12" r="5" fill="#307082" />
        <circle cx="36" cy="36" r="5" fill="#EA9940" />
        <path d="M12 18v8a8 8 0 0 0 8 8h10" stroke="#12212E" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'weather') {
    return (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <circle cx="20" cy="20" r="7" fill="#EA9940" />
        <path d="M34 30H14a8 8 0 0 1 0-16h1a10 10 0 0 1 19 3 6 6 0 0 1 0 13z" fill="#307082" opacity="0.6" />
      </svg>
    );
  }
  if (type === 'health') {
    return (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="6" width="36" height="36" rx="8" fill="#6CA3A2" opacity="0.3" />
        <rect x="20" y="12" width="8" height="24" rx="3" fill="#307082" />
        <rect x="12" y="20" width="24" height="8" rx="3" fill="#307082" />
      </svg>
    );
  }
  if (type === 'airport') {
    return (
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <path d="M40 36H8M24 8l-8 16h16z" stroke="#EA9940" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 24v12" stroke="#12212E" strokeWidth="3" strokeLinecap="round" />
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
