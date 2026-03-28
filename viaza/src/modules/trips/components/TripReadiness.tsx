// src/modules/trips/components/TripReadiness.tsx
// Barra de preparación del viaje — Sprint 1 Fase 1 S4
// Paleta oficial VIAZA — CERO emojis — CERO colores fuera de paleta

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  accent:     '#EA9940',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  primaryRgb: '18,33,46',
  accentRgb:  '234,153,64',
};

interface Props {
  pct: number;          // 0-100
  phase: string;
  daysLeft: number | null;
}

const PHASE_LABEL: Record<string, string> = {
  planning: 'En planificacion',
  pre_trip: 'Pre-viaje',
  in_trip: 'En viaje',
  post_trip: 'Viaje completado',
  unknown: '',
};

export function TripReadiness({ pct, phase, daysLeft }: Props) {
  if (phase === 'unknown' || phase === 'post_trip') return null;

  const barColor = pct < 50 ? P.accent : pct < 80 ? P.secondary : P.secondary;
  const phaseLabel = PHASE_LABEL[phase] ?? '';

  return (
    <div
      style={{
        background: `rgba(${P.primaryRgb},0.05)`,
        borderRadius: 14,
        padding: '12px 16px',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.primary }}>
            Preparacion del viaje
          </div>
          {phaseLabel ? (
            <div style={{ fontSize: 11, color: P.softTeal, marginTop: 1 }}>
              {phaseLabel}
              {daysLeft !== null && daysLeft > 0 && ` · ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} para salir`}
            </div>
          ) : null}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: pct >= 80 ? P.secondary : P.accent,
          }}
        >
          {pct}%
        </div>
      </div>

      {/* Barra */}
      <div
        style={{
          height: 6,
          background: `rgba(${P.primaryRgb},0.10)`,
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: 999,
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      {/* Factores */}
      <div
        style={{
          fontSize: 10,
          color: P.softTeal,
          marginTop: 6,
          opacity: 0.8,
        }}
      >
        Packing · Emergencia · Wallet · Itinerario
      </div>
    </div>
  );
}
