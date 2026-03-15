/**
 * TripRoutePage
 * Guía de ruta al destino del viaje.
 * - Botones de navegación real: Waze, Google Maps, Apple Maps
 * - Cálculo de distancia y tiempo estimado via OSRM (OpenStreetMap, sin key)
 * - Adaptado al tipo de transporte del viaje
 * Sin mocks — APIs reales.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../app/store/useAppStore';
import { supabase } from '../../../services/supabaseClient';
import {
  getTransportDeepLinks,
  googleMapsNavUrl,
  wazeNavUrl,
  wazeWebUrl,
  appleMapsUrl,
  type TransportDeepLink,
} from '../../../services/api/mapsService';

interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
}

interface TransitRoute {
  summary: string | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  departure_time_text: string | null;
  arrival_time_text: string | null;
  steps: Array<{
    type: 'walk' | 'transit';
    instruction: string;
    distance_meters: number | null;
    duration_seconds: number | null;
    transit?: {
      line_name?: string | null;
      line_short_name?: string | null;
      vehicle_type?: string | null;
      headsign?: string | null;
      num_stops?: number | null;
      departure_stop?: string | null;
      arrival_stop?: string | null;
      departure_time_text?: string | null;
      arrival_time_text?: string | null;
    };
  }>;
}

/** Calcula distancia y tiempo usando OSRM (OpenStreetMap Routing Machine, sin key) */
async function fetchRouteInfo(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<RouteInfo | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return null;
    return {
      distanceKm: Math.round(route.distance / 100) / 10,
      durationMinutes: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatSeconds(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const NAV_APP_ICONS: Record<TransportDeepLink['icon'], JSX.Element> = {
  'google-maps': (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="20" r="10" fill="#EA9940" />
      <circle cx="24" cy="20" r="10" fill="rgba(180,192,200,0.40)" />
      <path d="M24 30c0 0-12 10-12 18h24c0-8-12-18-12-18z" fill="#EA9940" />
      <circle cx="24" cy="20" r="4" fill="white" />
    </svg>
  ),
  'waze': (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="18" fill="#EA9940" />
      <circle cx="24" cy="24" r="18" fill="rgba(180,192,200,0.35)" />
      <circle cx="18" cy="22" r="3" fill="white" />
      <circle cx="30" cy="22" r="3" fill="white" />
      <path d="M16 30c2 3 14 3 16 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  'apple-maps': (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#EA9940" />
      <rect x="4" y="4" width="40" height="20" rx="10" fill="rgba(180,192,200,0.45)" />
      <path d="M14 34l10-20 10 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 28h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

export function TripRoutePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentTripId = useAppStore((s) => s.currentTripId);
  const trips = useAppStore((s) => s.trips);
  const trip = trips.find((tr) => tr.id === currentTripId);
  const lang = useAppStore((s) => s.currentLanguage);

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [transitRoute, setTransitRoute] = useState<TransitRoute | null>(null);
  const [transitLoading, setTransitLoading] = useState(false);

  useEffect(() => {
    if (!trip?.originLat || !trip?.originLon || !trip?.lat || !trip?.lon) return;
    if (trip.transportType !== 'car') return; // Solo calculamos ruta para auto
    setRouteLoading(true);
    fetchRouteInfo(trip.originLat, trip.originLon, trip.lat, trip.lon)
      .then(setRouteInfo)
      .finally(() => setRouteLoading(false));
  }, [trip]);

  useEffect(() => {
    if (!trip) return;
    if (trip.transportType !== 'bus' && trip.transportType !== 'train') { setTransitRoute(null); return; }
    if (!trip.originCity || !trip.destination) { setTransitRoute(null); return; }
    setTransitLoading(true);
    supabase.functions
      .invoke('routes-transit', { body: { origin: trip.originCity, destination: trip.destination, language: lang } })
      .then(({ data, error }) => {
        if (error) throw error;
        setTransitRoute((data as { route?: TransitRoute } | null)?.route ?? null);
      })
      .catch(() => setTransitRoute(null))
      .finally(() => setTransitLoading(false));
  }, [trip?.id, trip?.originCity, trip?.destination, trip?.transportType, lang]);

  if (!trip) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'Questrial, sans-serif' }}>
        <p style={{ color: 'rgba(18,33,46,0.40)' }}>{t('route.noTrip')}</p>
      </div>
    );
  }

  // Generar deep links según el tipo de transporte
  const deepLinks = getTransportDeepLinks({
    transportType: trip.transportType ?? 'car',
    destinationLat: trip.lat,
    destinationLon: trip.lon,
    destinationName: trip.destination,
    airportCode: trip.airportCode,
    busTerminal: trip.busTerminal,
    trainStation: trip.trainStation,
    cruisePort: trip.cruisePort,
  });

  // Agregar Apple Maps si hay coordenadas
  const allLinks: TransportDeepLink[] = [...deepLinks];
  if (trip.lat && trip.lon && !allLinks.find((l) => l.icon === 'apple-maps')) {
    allLinks.push({
      label: 'Apple Maps',
      url: appleMapsUrl({ lat: trip.lat, lon: trip.lon }),
      icon: 'apple-maps',
    });
  }

  const transportLabel: Record<string, string> = {
    flight: t('transport.flight'),
    car: t('transport.car'),
    bus: t('transport.bus'),
    train: t('transport.train'),
    cruise: t('transport.cruise'),
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ECE7DC',
      fontFamily: 'Questrial, sans-serif',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 24px',
        background: 'linear-gradient(160deg, #12212E 0%, #307082 100%)',
      }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.10)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: 16,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M30 12L18 24l12 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(234,153,64,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="20" r="10" fill="#EA9940" />
              <circle cx="24" cy="20" r="10" fill="rgba(180,192,200,0.40)" />
              <path d="M24 30c0 0-12 10-12 18h24c0-8-12-18-12-18z" fill="#EA9940" />
              <circle cx="24" cy="20" r="4" fill="white" />
            </svg>
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>
              {t('route.title')}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
              {trip.destination} · {transportLabel[trip.transportType ?? 'car'] ?? ''}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Tarjeta de ruta */}
        {trip.originCity && (
          <div style={{
            background: 'linear-gradient(135deg, #12212E, #1e3a4a)',
            borderRadius: 24, padding: '20px',
            boxShadow: '0 8px 24px rgba(18,33,46,0.20)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Origen */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {t('route.from')}
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginTop: 3 }}>
                  {trip.originCity}
                </p>
              </div>

              {/* Flecha */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                  <path d="M10 24h28M30 14l8 10-8 10" stroke="#EA9940" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {routeLoading && (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.30)" strokeWidth="4" strokeDasharray="40 70" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Destino */}
              <div style={{ flex: 1, textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {t('route.to')}
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginTop: 3 }}>
                  {trip.destination}
                </p>
              </div>
            </div>

            {/* Distancia y tiempo (solo para auto) */}
            {routeInfo && trip.transportType === 'car' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 16, padding: '12px 16px',
                  background: 'rgba(255,255,255,0.06)', borderRadius: 14,
                  display: 'flex', justifyContent: 'space-around',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#EA9940' }}>
                    {routeInfo.distanceKm} km
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                    {t('route.distance')}
                  </p>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.10)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#EA9940' }}>
                    {formatDuration(routeInfo.durationMinutes)}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                    {t('route.duration')}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Sin coordenadas de origen para auto */}
            {!routeInfo && !routeLoading && trip.transportType === 'car' && trip.originLat && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)' }}>
                  {t('route.routeUnavailable')}
                </p>
              </div>
            )}

            {/* Transporte público (bus/train) */}
            {(trip.transportType === 'bus' || trip.transportType === 'train') && (
              <div style={{ marginTop: 14 }}>
                {transitLoading && (
                  <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 13 }}>
                    {t('common.loading')}
                  </div>
                )}
                {transitRoute && !transitLoading && (
                  <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                        {transitRoute.departure_time_text && transitRoute.arrival_time_text
                          ? `${transitRoute.departure_time_text} → ${transitRoute.arrival_time_text}`
                          : t('route.title')}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.70)', fontSize: 13, fontWeight: 700 }}>
                        {formatSeconds(transitRoute.duration_seconds)}
                      </div>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {transitRoute.steps.slice(0, 10).map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 10 }}>
                          <div style={{ width: 10, marginTop: 5 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 99, background: s.type === 'transit' ? '#EA9940' : 'rgba(255,255,255,0.35)' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>
                              {s.type === 'transit'
                                ? `${s.transit?.line_short_name ?? s.transit?.line_name ?? ''} ${s.transit?.vehicle_type ?? ''}`.trim() || s.instruction
                                : s.instruction}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.60)', fontSize: 12, marginTop: 2 }}>
                              {s.type === 'transit'
                                ? `${s.transit?.departure_stop ?? ''} → ${s.transit?.arrival_stop ?? ''}`.trim()
                                : formatSeconds(s.duration_seconds)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botones de navegación */}
        <div style={{
          background: 'white', borderRadius: 20, padding: '20px',
          boxShadow: '0 2px 12px rgba(18,33,46,0.06)',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(18,33,46,0.45)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
            {t('route.openWith')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 16,
                  background: 'rgba(234,153,64,0.06)',
                  border: '1.5px solid rgba(234,153,64,0.15)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(234,153,64,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {NAV_APP_ICONS[link.icon]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#12212E' }}>{link.label}</p>
                  <p style={{ fontSize: 12, color: 'rgba(18,33,46,0.45)', marginTop: 2 }}>
                    {t('route.tapToOpen')}
                  </p>
                </div>
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path d="M18 12l12 12-12 12" stroke="rgba(18,33,46,0.30)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.a>
            ))}
          </div>

          {allLinks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(18,33,46,0.35)', fontSize: 13 }}>
              {t('route.noLinks')}
            </div>
          )}
        </div>

        {/* Info de vuelo si aplica */}
        {trip.transportType === 'flight' && (trip.flightNumber || trip.airline || trip.airportCode) && (
          <div style={{
            background: 'white', borderRadius: 20, padding: '20px',
            boxShadow: '0 2px 12px rgba(18,33,46,0.06)',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(18,33,46,0.45)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
              {t('route.flightInfo')}
            </p>
            {trip.flightNumber && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(18,33,46,0.06)' }}>
                <span style={{ fontSize: 13, color: 'rgba(18,33,46,0.50)', fontWeight: 700 }}>{t('route.flight')}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#12212E' }}>{trip.flightNumber}</span>
              </div>
            )}
            {trip.airline && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(18,33,46,0.06)' }}>
                <span style={{ fontSize: 13, color: 'rgba(18,33,46,0.50)', fontWeight: 700 }}>{t('route.airline')}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#12212E' }}>{trip.airline}</span>
              </div>
            )}
            {trip.airportCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: 13, color: 'rgba(18,33,46,0.50)', fontWeight: 700 }}>{t('route.airport')}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#12212E' }}>{trip.airportCode}</span>
              </div>
            )}
            {/* Botón para escanear boarding pass */}
            <button
              type="button"
              onClick={() => navigate('/boarding-pass-scanner')}
              style={{
                width: '100%', height: 44, borderRadius: 12, marginTop: 12,
                background: 'rgba(234,153,64,0.10)', border: '1.5px solid rgba(234,153,64,0.25)',
                fontSize: 13, fontWeight: 700, color: '#EA9940',
                cursor: 'pointer', fontFamily: 'Questrial, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="12" width="40" height="28" rx="5" fill="#EA9940" opacity="0.6" />
                <circle cx="24" cy="26" r="6" fill="#EA9940" />
                <rect x="16" y="6" width="16" height="8" rx="4" fill="#EA9940" opacity="0.8" />
              </svg>
              {t('scanner.cta')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
