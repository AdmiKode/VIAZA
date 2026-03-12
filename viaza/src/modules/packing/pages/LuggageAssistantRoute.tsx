/**
 * LuggageAssistantRoute
 * Wrapper standalone para usar LuggageAssistantPage como ruta.
 * Lee el viaje activo y el primer integrante del store.
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../../app/store/useAppStore';
import { LuggageAssistantPage } from './LuggageAssistantPage';
import { useTranslation } from 'react-i18next';

export function LuggageAssistantRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const currentTripId = useAppStore((s) => s.currentTripId);
  const travelers = useAppStore((s) =>
    s.travelers.filter((tr) => tr.tripId === s.currentTripId)
  );

  // Permite pasar ?travelerId=xxx para elegir integrante específico
  const travelerId = params.get('travelerId') ?? travelers[0]?.id ?? 'main';
  const travelerName = travelers.find((tr) => tr.id === travelerId)?.name ?? t('packing.traveler.main');

  if (!currentTripId) {
    return (
      <div style={{ minHeight: '100vh', background: '#ECE7DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Questrial, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 16, color: 'rgba(18,33,46,0.55)' }}>{t('home.noTrip')}</p>
          <button type="button" onClick={() => navigate('/home')} style={{ marginTop: 16, padding: '12px 24px', borderRadius: 14, background: '#EA9940', border: 'none', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Questrial, sans-serif' }}>
            {t('nav.home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <LuggageAssistantPage
      tripId={currentTripId}
      travelerId={travelerId}
      travelerName={travelerName}
      onClose={() => navigate(-1)}
    />
  );
}
