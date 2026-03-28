// src/modules/itinerary/components/LegCard.tsx
//
// Tarjeta de un tramo de ruta (de A → B).
// Muestra: origen, destino, distancia, tiempo, modo de transporte y pasos.
// Sin emojis. Paleta oficial VIAZA.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RouteLeg } from '../../../services/routeLegService';
import { formatDistance, formatDuration, buildMapsDeepLink, buildWazeDeepLink } from '../../../services/routeLegService';

const P = {
  primary: '#12212E',
  secondary: '#307082',
  softTeal: '#6CA3A2',
  accent: '#EA9940',
  bg: '#ECE7DC',
};

type LegCardProps = {
  leg: RouteLeg;
  legIndex: number;
  fromLabel?: string;
  toLabel?: string;
  mode: 'transit' | 'driving' | 'walking';
};

function ModeIcon({ type }: { type: string }) {
  const style: React.CSSProperties = {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: type === 'transit' ? P.secondary : type === 'drive' ? P.accent : P.softTeal,
    marginRight: 6,
    flexShrink: 0,
  };
  return <span style={style} />;
}

function modeLabel(type: string, transit?: RouteLeg['steps'][number]['transit']): string {
  if (type === 'transit') {
    const vehicle = transit?.vehicle_type?.toLowerCase() ?? '';
    if (vehicle.includes('subway') || vehicle.includes('metro')) return 'Metro';
    if (vehicle.includes('bus')) return 'Autobús';
    if (vehicle.includes('rail') || vehicle.includes('train')) return 'Tren';
    if (vehicle.includes('tram')) return 'Tranvía';
    return transit?.line_name ?? 'Transporte';
  }
  if (type === 'drive') return 'En auto';
  return 'Caminando';
}

export function LegCard({ leg, legIndex, fromLabel, toLabel, mode }: LegCardProps) {
  const [expanded, setExpanded] = useState(false);

  const from = fromLabel ?? leg.from ?? `Punto ${legIndex + 1}`;
  const to = toLabel ?? leg.to ?? `Punto ${legIndex + 2}`;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: `1px solid rgba(48,112,130,0.13)` }}
    >
      {/* Header del tramo */}
      <button
        type="button"
        className="w-full px-4 py-3 flex items-start gap-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Número del tramo */}
        <div
          className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
          style={{ width: 26, height: 26, background: `rgba(48,112,130,0.12)`, color: P.secondary }}
        >
          {legIndex + 1}
        </div>

        <div className="flex-1 min-w-0">
          {/* Origen → Destino */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs font-semibold truncate max-w-[110px]" style={{ color: P.primary }}>
              {from}
            </span>
            <span className="text-xs" style={{ color: P.softTeal }}>→</span>
            <span className="text-xs font-semibold truncate max-w-[110px]" style={{ color: P.primary }}>
              {to}
            </span>
          </div>
          {/* Distancia + tiempo */}
          <div className="flex gap-3 mt-0.5">
            <span className="text-xs" style={{ color: P.secondary }}>
              {formatDuration(leg.duration_seconds)}
            </span>
            <span className="text-xs" style={{ color: P.softTeal }}>
              {formatDistance(leg.distance_meters)}
            </span>
            {leg.departure_time_text && (
              <span className="text-xs" style={{ color: `rgba(18,33,46,0.45)` }}>
                Sale {leg.departure_time_text}
              </span>
            )}
          </div>
        </div>

        {/* Indicador expandir */}
        <span
          className="shrink-0 text-xs font-semibold transition-transform"
          style={{ color: P.softTeal, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
        >
          &#8964;
        </span>
      </button>

      {/* Pasos detallados */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-4 pb-3 pt-1 space-y-2"
              style={{ borderTop: `1px solid rgba(48,112,130,0.08)` }}
            >
              {leg.steps.length === 0 && (
                <p className="text-xs" style={{ color: `rgba(18,33,46,0.45)` }}>
                  Sin detalle de pasos disponible.
                </p>
              )}
              {leg.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ModeIcon type={step.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug" style={{ color: P.primary }}>
                      {modeLabel(step.type, step.transit)}
                      {step.transit?.line_short_name && (
                        <span
                          className="ml-1 rounded px-1 text-[10px] font-bold"
                          style={{ background: `rgba(48,112,130,0.12)`, color: P.secondary }}
                        >
                          {step.transit.line_short_name}
                        </span>
                      )}
                    </p>
                    {step.instruction && step.instruction !== modeLabel(step.type, step.transit) && (
                      <p className="text-[11px] mt-0.5" style={{ color: `rgba(18,33,46,0.55)` }}>
                        {step.instruction}
                      </p>
                    )}
                    {step.transit?.num_stops && (
                      <p className="text-[11px]" style={{ color: `rgba(18,33,46,0.45)` }}>
                        {step.transit.num_stops} paradas · hasta {step.transit.arrival_stop ?? to}
                      </p>
                    )}
                    <p className="text-[11px] mt-0.5" style={{ color: P.softTeal }}>
                      {formatDuration(step.duration_seconds)} · {formatDistance(step.distance_meters)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Deep links */}
              <div className="flex gap-2 pt-1 flex-wrap">
                <a
                  href={buildMapsDeepLink(from, to, mode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold"
                  style={{ background: `rgba(48,112,130,0.10)`, color: P.secondary }}
                >
                  Abrir en Google Maps
                </a>
                {mode === 'driving' && (
                  <a
                    href={buildWazeDeepLink(to)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold"
                    style={{ background: `rgba(234,153,64,0.12)`, color: P.accent }}
                  >
                    Abrir en Waze
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
