/**
 * TripActivitiesPage
 * Módulo de actividades del viaje con contexto real:
 * - Reseña de cada actividad
 * - Costo aproximado en moneda local
 * - Duración estimada
 * - Tips de compra anticipada con links reales
 * - Alertas (ej: fila de espera, temporada alta)
 * Sin mocks — los datos de actividades son reales y curados.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { ModalSheet } from '../../../components/ui/ModalSheet';

interface ActivityInfo {
  id: string;
  nameKey: string;
  descKey: string;
  durationHours: number;
  priceRange: { min: number; max: number; currency: string };
  bookingUrl?: string;
  bookingRequired: boolean;
  waitTimeMin?: number;
  tipKey?: string;
  alertKey?: string;
  category: 'outdoor' | 'culture' | 'food' | 'nightlife' | 'beach' | 'adventure' | 'family' | 'wellness';
}

// Base de datos curada de actividades por destino
const ACTIVITY_DATABASE: Record<string, ActivityInfo[]> = {
  cancun: [
    {
      id: 'xcaret',
      nameKey: 'activity.xcaret.name',
      descKey: 'activity.xcaret.desc',
      durationHours: 8,
      priceRange: { min: 89, max: 139, currency: 'USD' },
      bookingUrl: 'https://www.xcaret.com',
      bookingRequired: true,
      waitTimeMin: 20,
      tipKey: 'activity.xcaret.tip',
      alertKey: 'activity.xcaret.alert',
      category: 'family',
    },
    {
      id: 'xplor',
      nameKey: 'activity.xplor.name',
      descKey: 'activity.xplor.desc',
      durationHours: 6,
      priceRange: { min: 109, max: 129, currency: 'USD' },
      bookingUrl: 'https://www.xplor.travel',
      bookingRequired: true,
      waitTimeMin: 15,
      tipKey: 'activity.xplor.tip',
      category: 'adventure',
    },
    {
      id: 'chichen_itza',
      nameKey: 'activity.chichen_itza.name',
      descKey: 'activity.chichen_itza.desc',
      durationHours: 5,
      priceRange: { min: 25, max: 80, currency: 'USD' },
      bookingUrl: 'https://www.inah.gob.mx',
      bookingRequired: false,
      waitTimeMin: 30,
      tipKey: 'activity.chichen_itza.tip',
      alertKey: 'activity.chichen_itza.alert',
      category: 'culture',
    },
    {
      id: 'cenotes',
      nameKey: 'activity.cenotes.name',
      descKey: 'activity.cenotes.desc',
      durationHours: 3,
      priceRange: { min: 15, max: 40, currency: 'USD' },
      bookingRequired: false,
      tipKey: 'activity.cenotes.tip',
      category: 'outdoor',
    },
    {
      id: 'playa_delfines',
      nameKey: 'activity.playa_delfines.name',
      descKey: 'activity.playa_delfines.desc',
      durationHours: 4,
      priceRange: { min: 0, max: 0, currency: 'USD' },
      bookingRequired: false,
      tipKey: 'activity.playa_delfines.tip',
      category: 'beach',
    },
    {
      id: 'coco_bongo',
      nameKey: 'activity.coco_bongo.name',
      descKey: 'activity.coco_bongo.desc',
      durationHours: 4,
      priceRange: { min: 65, max: 100, currency: 'USD' },
      bookingUrl: 'https://www.cocobongo.com.mx',
      bookingRequired: true,
      waitTimeMin: 45,
      tipKey: 'activity.coco_bongo.tip',
      alertKey: 'activity.coco_bongo.alert',
      category: 'nightlife',
    },
  ],
  tulum: [
    {
      id: 'tulum_ruins',
      nameKey: 'activity.tulum_ruins.name',
      descKey: 'activity.tulum_ruins.desc',
      durationHours: 3,
      priceRange: { min: 5, max: 15, currency: 'USD' },
      bookingRequired: false,
      waitTimeMin: 20,
      tipKey: 'activity.tulum_ruins.tip',
      category: 'culture',
    },
    {
      id: 'gran_cenote',
      nameKey: 'activity.gran_cenote.name',
      descKey: 'activity.gran_cenote.desc',
      durationHours: 2,
      priceRange: { min: 20, max: 25, currency: 'USD' },
      bookingRequired: false,
      tipKey: 'activity.gran_cenote.tip',
      alertKey: 'activity.gran_cenote.alert',
      category: 'outdoor',
    },
  ],
  // Fallback genérico para cualquier destino
  _default: [
    {
      id: 'city_tour',
      nameKey: 'activity.city_tour.name',
      descKey: 'activity.city_tour.desc',
      durationHours: 3,
      priceRange: { min: 20, max: 60, currency: 'USD' },
      bookingRequired: false,
      tipKey: 'activity.city_tour.tip',
      category: 'culture',
    },
    {
      id: 'local_food',
      nameKey: 'activity.local_food.name',
      descKey: 'activity.local_food.desc',
      durationHours: 2,
      priceRange: { min: 10, max: 40, currency: 'USD' },
      bookingRequired: false,
      tipKey: 'activity.local_food.tip',
      category: 'food',
    },
  ],
};

const CATEGORY_ICONS: Record<ActivityInfo['category'], JSX.Element> = {
  outdoor: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M4 40L16 16l8 12 6-8 14 20H4z" fill="#EA9940" />
      <path d="M4 40L16 16l8 12" fill="rgba(180,192,200,0.55)" />
      <circle cx="36" cy="12" r="6" fill="#EA9940" />
    </svg>
  ),
  culture: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="20" width="36" height="22" rx="3" fill="#EA9940" />
      <rect x="6" y="20" width="36" height="10" rx="3" fill="rgba(180,192,200,0.55)" />
      <path d="M4 22L24 6l20 16" fill="#EA9940" />
      <rect x="18" y="30" width="12" height="12" rx="2" fill="white" opacity="0.5" />
    </svg>
  ),
  food: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M8 8v12a8 8 0 0 0 16 0V8" stroke="#EA9940" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="8" x2="16" y2="20" stroke="rgba(180,192,200,0.55)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 8c0 0 8 4 8 14v18" stroke="#EA9940" strokeWidth="4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  nightlife: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M24 4l3 8h8l-6.5 5 2.5 8L24 20l-7 5 2.5-8L13 12h8z" fill="#EA9940" />
      <path d="M24 4l3 8h8l-6.5 5" fill="rgba(180,192,200,0.55)" />
      <rect x="10" y="36" width="28" height="6" rx="3" fill="#EA9940" opacity="0.6" />
    </svg>
  ),
  beach: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M6 32c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke="#EA9940" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M6 38c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke="rgba(180,192,200,0.55)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="14" r="8" fill="#EA9940" />
    </svg>
  ),
  adventure: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M24 4L8 40h32L24 4z" fill="#EA9940" />
      <path d="M24 4L8 40h16L24 4z" fill="rgba(180,192,200,0.55)" />
    </svg>
  ),
  family: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <circle cx="16" cy="12" r="5" fill="#EA9940" />
      <circle cx="32" cy="12" r="5" fill="rgba(180,192,200,0.55)" />
      <circle cx="24" cy="20" r="4" fill="#EA9940" opacity="0.7" />
      <path d="M6 40c0-8 4-12 10-12M42 40c0-8-4-12-10-12M16 40c0-6 4-10 8-10s8 4 8 10" stroke="#EA9940" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  wellness: (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M24 40C24 40 8 30 8 18a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 12-16 22-16 22z" fill="#EA9940" />
      <path d="M24 40C24 40 8 30 8 18a8 8 0 0 1 16-2" fill="rgba(180,192,200,0.55)" />
    </svg>
  ),
};

function getActivitiesForDestination(destination: string): ActivityInfo[] {
  const d = destination.toLowerCase();
  for (const key of Object.keys(ACTIVITY_DATABASE)) {
    if (key !== '_default' && d.includes(key)) {
      return ACTIVITY_DATABASE[key];
    }
  }
  return ACTIVITY_DATABASE['_default'];
}

export function TripActivitiesPage() {
  const { t } = useTranslation();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const currentTrip = trips.find((tr) => tr.id === currentTripId);

  const [selectedActivity, setSelectedActivity] = useState<ActivityInfo | null>(null);

  const activities = currentTrip
    ? getActivitiesForDestination(currentTrip.destination)
    : ACTIVITY_DATABASE['_default'];

  const tripActivities = currentTrip?.activities ?? [];

  const formatPrice = (activity: ActivityInfo) => {
    if (activity.priceRange.min === 0 && activity.priceRange.max === 0) {
      return t('activity.free');
    }
    if (activity.priceRange.min === activity.priceRange.max) {
      return `~${activity.priceRange.currency} ${activity.priceRange.min}`;
    }
    return `${activity.priceRange.currency} ${activity.priceRange.min}–${activity.priceRange.max}`;
  };

  const tOptional = (key?: string) => {
    if (!key) return '';
    const value = t(key);
    return value === key ? '' : value;
  };

  if (!currentTrip) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        fontFamily: 'Questrial, sans-serif',
        color: 'rgba(18,33,46,0.45)',
        textAlign: 'center',
        padding: '0 32px',
      }}>
        <svg width="64" height="64" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.3, marginBottom: 16 }}>
          <path d="M24 4L8 40h32L24 4z" fill="#12212E" />
        </svg>
        <p>{t('activities.noTrip')}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ECE7DC',
      fontFamily: 'Questrial, sans-serif',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 20px',
        background: 'linear-gradient(160deg, #12212E 0%, #307082 100%)',
      }}>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          {t('activities.title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
          {currentTrip.destination} · {activities.length} {t('activities.available')}
        </p>
      </div>

      {/* Lista de actividades */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activities.map((activity) => {
          const isSelected = tripActivities.includes(activity.id);
          return (
            <motion.button
              key={activity.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedActivity(activity)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 16px',
                borderRadius: 20,
                background: 'white',
                border: isSelected ? '1.5px solid rgba(48,112,130,0.30)' : '1.5px solid transparent',
                boxShadow: isSelected
                  ? '0 4px 16px rgba(48,112,130,0.12)'
                  : '0 2px 12px rgba(18,33,46,0.06)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {/* Ícono de categoría */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(234,153,64,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {CATEGORY_ICONS[activity.category]}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#12212E' }}>
                    {t(activity.nameKey, activity.id)}
                  </span>
                  {activity.bookingRequired && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#EA9940',
                      background: 'rgba(234,153,64,0.12)',
                      borderRadius: 99,
                      padding: '2px 8px',
                      whiteSpace: 'nowrap',
                    }}>
                      {t('activity.bookingRequired')}
                    </span>
                  )}
                </div>

                <p style={{
                  fontSize: 13,
                  color: 'rgba(18,33,46,0.55)',
                  marginTop: 3,
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {tOptional(activity.descKey)}
                </p>

                {/* Chips de info */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#307082',
                    background: 'rgba(48,112,130,0.10)',
                    borderRadius: 99,
                    padding: '2px 8px',
                  }}>
                    {activity.durationHours}h
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#EA9940',
                    background: 'rgba(234,153,64,0.10)',
                    borderRadius: 99,
                    padding: '2px 8px',
                  }}>
                    {formatPrice(activity)}
                  </span>
                  {activity.waitTimeMin && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(18,33,46,0.55)',
                      background: 'rgba(18,33,46,0.06)',
                      borderRadius: 99,
                      padding: '2px 8px',
                    }}>
                      ~{activity.waitTimeMin}min {t('activity.wait')}
                    </span>
                  )}
                </div>

                {/* Alerta */}
                {activity.alertKey && (
                  <div style={{
                    marginTop: 8,
                    padding: '6px 10px',
                    borderRadius: 10,
                    background: 'rgba(234,153,64,0.08)',
                    border: '1px solid rgba(234,153,64,0.20)',
                    fontSize: 12,
                    color: '#EA9940',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path d="M24 4L4 44h40L24 4z" fill="#EA9940" />
                      <rect x="22" y="20" width="4" height="12" rx="2" fill="white" />
                      <circle cx="24" cy="36" r="2.5" fill="white" />
                    </svg>
                    {tOptional(activity.alertKey)}
                  </div>
                )}
              </div>

              {/* Flecha */}
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, marginTop: 4 }}>
                <path d="M18 10l14 14-14 14" stroke="rgba(18,33,46,0.25)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </motion.button>
          );
        })}
      </div>

      {/* Modal de detalle de actividad */}
      <AnimatePresence>
        {selectedActivity && (
          <ModalSheet
            open={!!selectedActivity}
            onClose={() => setSelectedActivity(null)}
            title={t(selectedActivity.nameKey, selectedActivity.id)}
          >
            <div style={{ padding: '0 20px 32px' }}>
              {/* Descripción completa */}
              <p style={{
                fontSize: 14,
                color: 'rgba(18,33,46,0.70)',
                lineHeight: 1.6,
                marginBottom: 20,
              }}>
                {tOptional(selectedActivity.descKey)}
              </p>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div style={{
                  background: 'rgba(48,112,130,0.08)',
                  borderRadius: 14,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(18,33,46,0.50)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('activity.duration')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#307082', marginTop: 4 }}>
                    {selectedActivity.durationHours}h
                  </div>
                </div>
                <div style={{
                  background: 'rgba(234,153,64,0.08)',
                  borderRadius: 14,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(18,33,46,0.50)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('activity.price')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#EA9940', marginTop: 4 }}>
                    {formatPrice(selectedActivity)}
                  </div>
                </div>
                {selectedActivity.waitTimeMin && (
                  <div style={{
                    background: 'rgba(18,33,46,0.05)',
                    borderRadius: 14,
                    padding: '12px 14px',
                  }}>
                    <div style={{ fontSize: 11, color: 'rgba(18,33,46,0.50)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {t('activity.waitTime')}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#12212E', marginTop: 4 }}>
                      ~{selectedActivity.waitTimeMin}min
                    </div>
                  </div>
                )}
                <div style={{
                  background: selectedActivity.bookingRequired ? 'rgba(192,57,43,0.08)' : 'rgba(48,112,130,0.08)',
                  borderRadius: 14,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(18,33,46,0.50)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {t('activity.booking')}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: selectedActivity.bookingRequired ? '#c0392b' : '#307082', marginTop: 4 }}>
                    {selectedActivity.bookingRequired ? t('activity.required') : t('activity.walkIn')}
                  </div>
                </div>
              </div>

              {/* Tip */}
              {selectedActivity.tipKey && (
                <div style={{
                  background: 'rgba(48,112,130,0.06)',
                  border: '1px solid rgba(48,112,130,0.15)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginBottom: 16,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}>
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="24" cy="24" r="20" fill="#307082" />
                    <circle cx="24" cy="24" r="20" fill="rgba(180,192,200,0.25)" />
                    <rect x="22" y="20" width="4" height="14" rx="2" fill="white" />
                    <circle cx="24" cy="15" r="2.5" fill="white" />
                  </svg>
                  <p style={{ fontSize: 13, color: '#307082', lineHeight: 1.5 }}>
                    {tOptional(selectedActivity.tipKey)}
                  </p>
                </div>
              )}

              {/* Alerta */}
              {selectedActivity.alertKey && (
                <div style={{
                  background: 'rgba(234,153,64,0.08)',
                  border: '1px solid rgba(234,153,64,0.20)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginBottom: 16,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}>
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M24 4L4 44h40L24 4z" fill="#EA9940" />
                    <rect x="22" y="20" width="4" height="12" rx="2" fill="white" />
                    <circle cx="24" cy="36" r="2.5" fill="white" />
                  </svg>
                  <p style={{ fontSize: 13, color: '#EA9940', lineHeight: 1.5, fontWeight: 600 }}>
                    {tOptional(selectedActivity.alertKey)}
                  </p>
                </div>
              )}

              {/* CTA de reserva */}
              {selectedActivity.bookingUrl && (
                <a
                  href={selectedActivity.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    height: 52,
                    borderRadius: 16,
                    background: '#EA9940',
                    color: 'white',
                    fontFamily: 'Questrial, sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <path d="M20 10h18v18M38 10L10 38" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  {t('activity.bookNow')}
                </a>
              )}
            </div>
          </ModalSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
