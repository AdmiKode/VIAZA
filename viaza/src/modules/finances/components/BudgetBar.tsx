// src/modules/finances/components/BudgetBar.tsx
// Barra de progreso visual de presupuesto vs gasto real por categoría
// Paleta oficial VIAZA — CERO emojis — CERO colores fuera de paleta

import type { BudgetSummary } from '../../../services/budgetService';

const P = {
  primary:    '#12212E',
  secondary:  '#307082',
  softTeal:   '#6CA3A2',
  background: '#ECE7DC',
  accent:     '#EA9940',
  primaryRgb: '18,33,46',
  accentRgb:  '234,153,64',
};

interface Props {
  summary: BudgetSummary;
  currencyCode?: string;
}

export function BudgetBar({ summary, currencyCode = 'USD' }: Props) {
  const { label, planned, spent, remaining, pct } = summary;
  const isOver = spent > planned && planned > 0;
  const hasNoBudget = planned === 0;

  // Color de la barra según el porcentaje
  const barColor = isOver
    ? P.accent                           // excedido → accent
    : pct >= 85
    ? `rgba(${P.accentRgb},0.7)`        // cerca del límite
    : P.secondary;                       // normal

  const clampedPct = Math.min(100, pct);

  return (
    <div
      style={{
        background: `rgba(${P.primaryRgb},0.04)`,
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 8,
      }}
    >
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: P.primary }}>{label}</span>
        <span style={{ fontSize: 12, color: P.softTeal }}>
          {spent.toFixed(2)} / {hasNoBudget ? 'sin presupuesto' : `${planned.toFixed(2)} ${currencyCode}`}
        </span>
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
        {!hasNoBudget && (
          <div
            style={{
              width: `${clampedPct}%`,
              height: '100%',
              background: barColor,
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }}
          />
        )}
      </div>

      {/* Pie */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: P.softTeal }}>
          {hasNoBudget ? 'Sin presupuesto asignado' : `${pct}% utilizado`}
        </span>
        {!hasNoBudget && (
          <span
            style={{
              fontSize: 11,
              fontWeight: isOver ? 700 : 400,
              color: isOver ? P.accent : P.softTeal,
            }}
          >
            {isOver
              ? `${Math.abs(remaining).toFixed(2)} excedido`
              : `${remaining.toFixed(2)} disponible`}
          </span>
        )}
      </div>
    </div>
  );
}
