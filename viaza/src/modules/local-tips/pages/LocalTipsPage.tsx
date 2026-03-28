import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { localTips, type LocalTipCategory } from '../utils/localTipsData';
import { useAppStore } from '../../../app/store/useAppStore';

const categories: Array<{ id: LocalTipCategory | 'all'; titleKey: string }> = [
  { id: 'all', titleKey: 'tips.category.all' },
  { id: 'safety', titleKey: 'tips.category.safety' },
  { id: 'transport', titleKey: 'tips.category.transport' },
  { id: 'culture', titleKey: 'tips.category.culture' },
  { id: 'money', titleKey: 'tips.category.money' },
  { id: 'food', titleKey: 'tips.category.food' },
  { id: 'utilities', titleKey: 'tips.category.utilities' }
];

export function LocalTipsPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<(typeof categories)[number]['id']>('all');

  const currentTripId = useAppStore((s) => s.currentTripId);
  const appLang = useAppStore((s) => s.currentLanguage);
  const trips = useAppStore((s) => s.trips);
  const trip = useMemo(() => trips.find((x) => x.id === currentTripId) ?? null, [trips, currentTripId]);
  const countryCode = trip?.countryCode ?? null;

  const contextTips = useMemo(() => {
    if (!trip) return [];
    const es = (esText: string, enText: string) => (appLang.startsWith('en') ? enText : esText);
    const out: Array<{ id: string; title: string; description: string }> = [];

    if (!trip.originCity) {
      out.push({
        id: 'ctx-origin',
        title: es('Configura ciudad de salida', 'Set departure city'),
        description: es('Agrega tu origen para habilitar rutas y tiempos de traslado más precisos.', 'Add origin city to unlock route and travel time estimation.'),
      });
    }
    if ((trip.transportType === 'flight' || trip.transportType === 'bus' || trip.transportType === 'train') && !trip.originCity) {
      out.push({
        id: 'ctx-transport-origin',
        title: es('Ruta incompleta', 'Route data incomplete'),
        description: es('Sin origen no podemos calcular traslados reales hacia terminal o estación.', 'Without origin we cannot calculate real transfer routes to terminal or station.'),
      });
    }
    if (!trip.weatherForecastDaily || trip.weatherForecastDaily.length === 0) {
      out.push({
        id: 'ctx-weather',
        title: es('Clima pendiente de sincronizar', 'Forecast pending sync'),
        description: es('Abre “Pronóstico del clima” para refrescar y guardar el clima diario del viaje.', 'Open weather forecast to refresh and save daily forecast for this trip.'),
      });
    }
    if (!trip.riskLevel || trip.riskLevel === 'unknown') {
      out.push({
        id: 'ctx-risk',
        title: es('Riesgo sin confirmar', 'Risk level not confirmed'),
        description: es('Haz refresh en Risk Zones para obtener nivel de riesgo actualizado del destino.', 'Refresh Risk Zones to fetch updated risk level for the destination.'),
      });
    }
    if (trip.transportType === 'flight' && !trip.airportCode) {
      out.push({
        id: 'ctx-airport',
        title: es('Falta código de aeropuerto', 'Airport code missing'),
        description: es('Agregar IATA del destino mejora rutas al aeropuerto y recordatorios de salida.', 'Adding destination IATA improves airport routing and departure reminders.'),
      });
    }
    return out.slice(0, 3);
  }, [trip, appLang]);

  const items = useMemo(() => {
    const sameCountry = localTips.filter((tip) => tip.countryCode && tip.countryCode === countryCode);
    const generic = localTips.filter((tip) => !tip.countryCode);
    if (category === 'all') return [...sameCountry, ...generic.slice(0, 2)];

    const sameCountryByCategory = sameCountry.filter((x) => x.category === category);
    if (sameCountryByCategory.length >= 4) return sameCountryByCategory;
    const genericByCategory = generic.filter((x) => x.category === category);
    return [...sameCountryByCategory, ...genericByCategory].slice(0, 5);
  }, [category, countryCode]);

  return (
    <div className="px-4 pt-4 pb-24">
      <AppHeader title={t('localTips.title')} />

      {trip && (
        <div className="mt-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.55)]">
          {trip.destination}
        </div>
      )}

      <div className="mt-4 flex gap-2 overflow-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={
              category === c.id
                ? 'rounded-full bg-[var(--viaza-primary)] px-4 py-2 text-xs text-[var(--viaza-background)]'
                : 'rounded-full border border-[rgb(var(--viaza-primary-rgb)/0.10)] bg-[rgb(var(--viaza-background-rgb)/0.65)] px-4 py-2 text-xs text-[rgb(var(--viaza-primary-rgb)/0.75)]'
            }
            onClick={() => setCategory(c.id)}
          >
            {t(c.titleKey)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {contextTips.map((tip) => (
          <AppCard key={tip.id}>
            <div className="text-sm font-semibold">{tip.title}</div>
            <div className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">
              {tip.description}
            </div>
          </AppCard>
        ))}

        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-[rgb(var(--viaza-primary-rgb)/0.50)]">
            {t('localTips.noTips')}
          </div>
        ) : (
          items.map((tip) => (
            <AppCard key={tip.id}>
              <div className="text-sm font-semibold">{t(tip.titleKey)}</div>
              <div className="mt-2 text-sm text-[rgb(var(--viaza-primary-rgb)/0.75)]">
                {t(tip.descriptionKey)}
              </div>
            </AppCard>
          ))
        )}
      </div>
    </div>
  );
}
