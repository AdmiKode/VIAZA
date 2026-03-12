/**
 * TripHistoryPage
 * Historial de viajes completados con aprendizajes y posibilidad de crear nuevo viaje.
 * Sin mocks — datos reales del store.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';

const TRAVEL_TYPE_ICONS: Record<string, JSX.Element> = {
  beach: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M6 32c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke="#EA9940" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="14" r="8" fill="#EA9940" />
      <path d="M6 32c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke="rgba(180,192,200,0.55)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  city: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="20" width="36" height="22" rx="2" fill="#EA9940" />
      <rect x="6" y="20" width="36" height="10" rx="2" fill="rgba(180,192,200,0.55)" />
      <rect x="14" y="8" width="20" height="14" rx="2" fill="#EA9940" />
      <rect x="20" y="30" width="8" height="12" rx="1" fill="white" opacity="0.5" />
    </svg>
  ),
  mountain: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M4 40L18 12l8 12 6-8 12 24H4z" fill="#EA9940" />
      <path d="M4 40L18 12l8 12" fill="rgba(180,192,200,0.55)" />
    </svg>
  ),
  business: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="14" width="32" height="26" rx="4" fill="#EA9940" />
      <rect x="8" y="14" width="32" height="12" rx="4" fill="rgba(180,192,200,0.55)" />
      <path d="M18 14v-4a6 6 0 0 1 12 0v4" stroke="#12212E" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  ),
  _default: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill="#EA9940" />
      <circle cx="24" cy="24" r="18" fill="rgba(180,192,200,0.35)" />
      <path d="M24 8v16l10 6" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
};

export function TripHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const trips = useAppStore((s) => s.trips);
  const setCurrentTrip = useAppStore((s) => s.setCurrentTrip);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Separar viajes activos de completados
  const today = new Date().toISOString().slice(0, 10);
  const completedTrips = trips
    .filter((t) => t.endDate && t.endDate < today)
    .sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''));
  const upcomingTrips = trips
    .filter((t) => !t.endDate || t.endDate >= today)
    .sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''));

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return '';
    const s = new Date(start + 'T12:00:00');
    if (!end) return s.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    const e = new Date(end + 'T12:00:00');
    return `${s.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const TripCard = ({ trip, isCompleted }: { trip: typeof trips[0]; isCompleted: boolean }) => {
    const isExpanded = expandedId === trip.id;
    const icon = TRAVEL_TYPE_ICONS[trip.travelType] ?? TRAVEL_TYPE_ICONS['_default'];

    return (
      <motion.div
        layout
        style={{
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: isCompleted
            ? '0 2px 12px rgba(18,33,46,0.06)'
            : '0 4px 20px rgba(18,33,46,0.10)',
          border: isCompleted ? '1.5px solid transparent' : '1.5px solid rgba(48,112,130,0.20)',
        }}
      >
        <button
          type="button"
          onClick={() => setExpandedId(isExpanded ? null : trip.id)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {/* Ícono */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: isCompleted ? 'rgba(18,33,46,0.06)' : 'rgba(234,153,64,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700,
              fontSize: 16,
              color: isCompleted ? 'rgba(18,33,46,0.60)' : '#12212E',
              fontFamily: 'Questrial, sans-serif',
            }}>
              {trip.destination}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(18,33,46,0.45)', marginTop: 2 }}>
              {formatDateRange(trip.startDate, trip.endDate)}
              {trip.durationDays > 0 && ` · ${trip.durationDays}d`}
            </div>
          </div>

          {/* Badge */}
          {isCompleted ? (
            <div style={{
              padding: '4px 10px',
              borderRadius: 99,
              background: 'rgba(48,112,130,0.10)',
              fontSize: 11,
              fontWeight: 700,
              color: '#307082',
              flexShrink: 0,
            }}>
              {t('history.completed')}
            </div>
          ) : (
            <div style={{
              padding: '4px 10px',
              borderRadius: 99,
              background: 'rgba(234,153,64,0.12)',
              fontSize: 11,
              fontWeight: 700,
              color: '#EA9940',
              flexShrink: 0,
            }}>
              {t('history.upcoming')}
            </div>
          )}

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
              <path d="M12 18l12 12 12-12" stroke="rgba(18,33,46,0.35)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </button>

        {/* Detalle expandido */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(18,33,46,0.06)' }}>
                {/* Chips de info */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, marginBottom: 14 }}>
                  {trip.travelType && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: '#307082',
                      background: 'rgba(48,112,130,0.10)', borderRadius: 99, padding: '3px 10px',
                    }}>
                      {t(`travelType.${trip.travelType}`, trip.travelType)}
                    </span>
                  )}
                  {trip.currencyCode && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: '#EA9940',
                      background: 'rgba(234,153,64,0.10)', borderRadius: 99, padding: '3px 10px',
                    }}>
                      {trip.currencyCode}
                    </span>
                  )}
                  {trip.climate && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: 'rgba(18,33,46,0.55)',
                      background: 'rgba(18,33,46,0.06)', borderRadius: 99, padding: '3px 10px',
                    }}>
                      {t(`climate.${trip.climate}`, trip.climate)}
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTrip(trip.id);
                      navigate('/home');
                    }}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 12,
                      background: '#12212E',
                      color: 'white',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'Questrial, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    {t('history.viewTrip')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTrip(trip.id);
                      navigate('/packing');
                    }}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 12,
                      background: 'rgba(234,153,64,0.12)',
                      color: '#EA9940',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'Questrial, sans-serif',
                      cursor: 'pointer',
                    }}
                  >
                    {t('history.viewPacking')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ECE7DC',
      fontFamily: 'Questrial, sans-serif',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 20px' }}>
        <h1 style={{ color: '#12212E', fontSize: 24, fontWeight: 700 }}>
          {t('history.title')}
        </h1>
        <p style={{ color: 'rgba(18,33,46,0.50)', fontSize: 14, marginTop: 4 }}>
          {trips.length} {t('history.totalTrips')}
        </p>
      </div>

      {/* Botón nuevo viaje */}
      <div style={{ padding: '0 16px 20px' }}>
        <button
          type="button"
          onClick={() => navigate('/onboarding/travel-type')}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #EA9940, #c07a2e)',
            color: 'white',
            border: 'none',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'Questrial, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 6px 20px rgba(234,153,64,0.35)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <path d="M24 10v28M10 24h28" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </svg>
          {t('history.newTrip')}
        </button>
      </div>

      {/* Viajes próximos */}
      {upcomingTrips.length > 0 && (
        <div style={{ padding: '0 16px 20px' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(18,33,46,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            {t('history.upcoming')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} isCompleted={false} />
            ))}
          </div>
        </div>
      )}

      {/* Viajes completados */}
      {completedTrips.length > 0 && (
        <div style={{ padding: '0 16px' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(18,33,46,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            {t('history.past')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} isCompleted={true} />
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {trips.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 32px',
          textAlign: 'center',
        }}>
          <svg width="80" height="80" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.25, marginBottom: 16 }}>
            <circle cx="24" cy="24" r="20" fill="#12212E" />
            <path d="M24 14v10l6 4" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </svg>
          <p style={{ color: 'rgba(18,33,46,0.40)', fontSize: 15 }}>
            {t('history.empty')}
          </p>
        </div>
      )}
    </div>
  );
}
