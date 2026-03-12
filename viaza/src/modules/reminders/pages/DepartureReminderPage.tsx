import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppButton } from '../../../components/ui/AppButton';
import { calculateRecommendedDeparture } from '../utils/departureCalculator';

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function DepartureReminderPage() {
  const { t } = useTranslation();
  const [flightTime, setFlightTime] = useState(() => toLocalInputValue(new Date(Date.now() + 24 * 60 * 60_000)));
  const [airport, setAirport] = useState('');

  const calc = useMemo(() => calculateRecommendedDeparture({ flightDepartureIso: flightTime, bufferMinutes: 180 }), [flightTime]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('departure.title')} />

      <div className="mt-4 space-y-3">
        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('departure.flightTime')}</div>
          <div className="mt-2">
            <AppInput type="datetime-local" value={flightTime} onChange={(e) => setFlightTime(e.target.value)} />
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('departure.airport')}</div>
            <div className="mt-2">
              <AppInput value={airport} onChange={(e) => setAirport(e.target.value)} placeholder={t('departure.airportPlaceholder')} />
            </div>
          </div>
        </AppCard>

        <AppCard>
          <div className="text-xs font-semibold text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('departure.recommended')}</div>
          <div className="mt-2 text-3xl font-semibold">
            {calc?.recommended ? calc.recommended.toLocaleString() : t('departure.invalid')}
          </div>
          <div className="mt-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.60)]">{t('departure.note')}</div>

          <div className="mt-4">
            <AppButton className="w-full" disabled={!calc?.recommended} type="button">
              {t('departure.cta')}
            </AppButton>
          </div>
        </AppCard>
      </div>
    </div>
  );
}

