// src/modules/itinerary/components/DayRoutePanel.tsx
//
// Panel que calcula y muestra la ruta entre los eventos de un día del itinerario.
// Se monta como bottom sheet o inline en ItineraryPage.
//
// USO:
//   <DayRoutePanel tripId={trip.id} dayIndex={0} events={dayEvents} places={savedPlaces} />
//
// Sin emojis. Paleta oficial VIAZA.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ItineraryEvent, SavedPlace } from '../../../types/itinerary';
import {
  getDayRoute,
  invalidateDayRouteCache,
  type DayRouteResult,
} from '../../../services/routeLegService';
import { LegCard } from './LegCard';

const P = {
  primary: '#12212E',
  secondary: '#307082',
  softTeal: '#6CA3A2',
  accent: '#EA9940',
  bg: '#ECE7DC',
};

type TransportMode = 'transit' | 'driving' | 'walking';

const MODES: { id: TransportMode; label: string }[] = [
  { id: 'transit', label: 'Transporte' },
  { id: 'driving', label: 'Auto' },
  { id: 'walking', label: 'Caminando' },
];

type DayRoutePanelProps = {
  tripId: string;
  dayIndex: number;
  dayLabel?: string;
  events: ItineraryEvent[];
  places: SavedPlace[];
  onClose?: () => void;
};

export function DayRoutePanel({ tripId, dayIndex, dayLabel, events, places, onClose }: DayRoutePanelProps) {
  const [mode, setMode] = useState<TransportMode>('transit');
  const [route, setRoute] = useState<DayRouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eventos del día ordenados
  const ordered = [...events]
    .filter((e) => e.dayIndex === dayIndex)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (ordered.length < 2) return;
    setLoading(true);
    setError(null);
    getDayRoute({ tripId, dayIndex, events: ordered, places, mode })
      .then(setRoute)
      .catch((e: Error) => setError(e.message ?? 'Error calculando ruta'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dayIndex, tripId]);

  function handleRefresh() {
    if (ordered.length < 2) return;
    invalidateDayRouteCache(tripId, dayIndex, mode);
    setLoading(true);
    setError(null);
    getDayRoute({ tripId, dayIndex, events: ordered, places, mode, forceRefresh: true })
      .then(setRoute)
      .catch((e: Error) => setError(e.message ?? 'Error calculando ruta'))
      .finally(() => setLoading(false));
  }

  // Construir etiquetas para cada punto (usar title del evento)
  const pointLabels = ordered.map((e) => e.title);

  if (ordered.length < 2) {
    return (
      <div className="p-5 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold" style={{ color: P.primary }}>
          {dayLabel ?? `Día ${dayIndex + 1}`}
        </p>
        <p className="text-xs" style={{ color: `rgba(18,33,46,0.5)` }}>
          Necesitas al menos 2 eventos en el día para calcular la ruta.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col"
      style={{ background: P.bg, borderRadius: 24, overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3"
        style={{ background: P.primary }}
      >
        <div>
          <p className="text-xs font-semibold" style={{ color: P.softTeal }}>
            Ruta del día
          </p>
          <p className="text-sm font-bold text-white">
            {dayLabel ?? `Día ${dayIndex + 1}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)' }}
          >
            {loading ? 'Calculando...' : 'Actualizar'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'white' }}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-2 px-4 py-3" style={{ background: P.primary }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className="flex-1 rounded-xl py-2 text-xs font-semibold transition"
            style={{
              background: mode === m.id ? P.secondary : 'rgba(255,255,255,0.08)',
              color: mode === m.id ? 'white' : 'rgba(255,255,255,0.55)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Parada inicial: resumen de puntos */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {ordered.map((e, i) => (
          <div
            key={e.id}
            className="shrink-0 flex items-center gap-1"
          >
            <div
              className="rounded-xl px-2 py-1 text-[11px] font-semibold max-w-[100px] truncate"
              style={{ background: 'rgba(48,112,130,0.10)', color: P.secondary }}
            >
              {e.title}
            </div>
            {i < ordered.length - 1 && (
              <span className="text-xs" style={{ color: P.softTeal }}>→</span>
            )}
          </div>
        ))}
      </div>

      {/* Resumen total */}
      {route && !loading && (
        <div
          className="mx-4 mb-3 rounded-2xl px-4 py-3 flex gap-6"
          style={{ background: 'rgba(48,112,130,0.08)' }}
        >
          <div>
            <p className="text-[11px]" style={{ color: P.softTeal }}>Tiempo total</p>
            <p className="text-sm font-bold" style={{ color: P.secondary }}>
              {route.total_duration_seconds
                ? (() => {
                    const h = Math.floor(route.total_duration_seconds / 3600);
                    const m = Math.floor((route.total_duration_seconds % 3600) / 60);
                    return h > 0 ? `${h}h ${m}min` : `${m}min`;
                  })()
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-[11px]" style={{ color: P.softTeal }}>Distancia total</p>
            <p className="text-sm font-bold" style={{ color: P.secondary }}>
              {route.total_distance_meters >= 1000
                ? `${(route.total_distance_meters / 1000).toFixed(1)} km`
                : `${route.total_distance_meters} m`}
            </p>
          </div>
          {route.cached && (
            <div className="ml-auto self-end">
              <p className="text-[10px]" style={{ color: `rgba(18,33,46,0.35)` }}>
                En cach&eacute;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Estado: loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${P.secondary} transparent ${P.secondary} ${P.secondary}` }}
          />
          <span className="ml-3 text-sm" style={{ color: P.secondary }}>Calculando ruta...</span>
        </div>
      )}

      {/* Estado: error */}
      {error && !loading && (
        <div className="mx-4 mb-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(234,153,64,0.08)' }}>
          <p className="text-xs font-semibold" style={{ color: P.accent }}>No se pudo calcular la ruta</p>
          <p className="text-xs mt-1" style={{ color: `rgba(18,33,46,0.55)` }}>{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-2 rounded-xl px-3 py-1.5 text-xs font-semibold"
            style={{ background: `rgba(234,153,64,0.15)`, color: P.accent }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Legs */}
      {route && !loading && route.legs.length > 0 && (
        <div className="px-4 pb-6 space-y-3">
          {route.legs.map((leg, i) => (
            <LegCard
              key={i}
              leg={leg}
              legIndex={i}
              fromLabel={pointLabels[i]}
              toLabel={pointLabels[i + 1]}
              mode={mode}
            />
          ))}
        </div>
      )}

      {/* Sin ruta encontrada */}
      {route && !loading && route.legs.length === 0 && !error && (
        <div className="px-4 pb-6 text-center">
          <p className="text-sm" style={{ color: `rgba(18,33,46,0.45)` }}>
            No se encontró ruta entre estos puntos.
          </p>
          <p className="text-xs mt-1" style={{ color: `rgba(18,33,46,0.35)` }}>
            Verifica que los eventos tengan ubicaciones asignadas.
          </p>
        </div>
      )}
    </motion.div>
  );
}
