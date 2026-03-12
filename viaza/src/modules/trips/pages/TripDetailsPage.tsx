import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';
import { useAppStore } from '../../../app/store/useAppStore';

export function TripDetailsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const trip = useAppStore((s) => s.trips.find((x) => x.id === params.id) ?? null);
  const setCurrentTrip = useAppStore((s) => s.setCurrentTrip);

  if (!trip) {
    return (
      <div className="px-4 pt-4 pb-24">
        <AppHeader title={t('trip.title')} />
        <div className="mt-4">
          <AppCard>
            <div className="text-sm">{t('trip.notFound')}</div>
            <div className="mt-4">
              <Link to="/home">
                <AppButton className="w-full" type="button">
                  {t('trip.goHome')}
                </AppButton>
              </Link>
            </div>
          </AppCard>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('trip.title')} />

      <div className="mt-4 space-y-3">
        <AppCard className="bg-[var(--viaza-primary)] text-[var(--viaza-background)]">
          <div className="text-xs font-semibold text-[rgb(var(--viaza-background-rgb)/0.85)]">{t('trip.destination')}</div>
          <div className="mt-2 text-xl font-semibold">{trip.destination}</div>
          <div className="mt-1 text-sm text-[rgb(var(--viaza-background-rgb)/0.85)]">
            {t(`travelType.${trip.travelType}`)} · {t('trip.daysValue', { days: trip.durationDays })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[rgb(var(--viaza-background-rgb)/0.14)] px-3 py-1 text-xs">
              {t(`climate.${trip.climate}`)}
            </span>
            {trip.currencyCode ? (
              <span className="rounded-full bg-[rgb(var(--viaza-background-rgb)/0.14)] px-3 py-1 text-xs">{trip.currencyCode}</span>
            ) : null}
            {trip.languageCode ? (
              <span className="rounded-full bg-[rgb(var(--viaza-background-rgb)/0.14)] px-3 py-1 text-xs">{trip.languageCode.toUpperCase()}</span>
            ) : null}
          </div>
        </AppCard>

        <AppCard>
          <div className="text-sm font-semibold">{t('trip.actions')}</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/packing">
              <AppButton variant="secondary" className="w-full" onClick={() => setCurrentTrip(trip.id)} type="button">
                {t('packing.title')}
              </AppButton>
            </Link>
            <Link to="/airline-rules">
              <AppButton className="w-full" onClick={() => setCurrentTrip(trip.id)} type="button">
                {t('airline.title')}
              </AppButton>
            </Link>
            <Link to="/allowed-items">
              <AppButton className="w-full" onClick={() => setCurrentTrip(trip.id)} type="button">
                {t('allowedItems.title')}
              </AppButton>
            </Link>
            <Link to="/departure">
              <AppButton className="w-full" onClick={() => setCurrentTrip(trip.id)} type="button">
                {t('departure.title')}
              </AppButton>
            </Link>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
