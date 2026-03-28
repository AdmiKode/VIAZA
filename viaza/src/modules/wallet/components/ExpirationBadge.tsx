// src/modules/wallet/components/ExpirationBadge.tsx
//
// Badge visual que indica el estado de vencimiento de un documento.
// Niveles: expired | critical (<7 días) | warning (<30 días) | ok | none
//
// PALETA OFICIAL:
//   Primary    #12212E
//   Secondary  #307082
//   Soft Teal  #6CA3A2
//   Background #ECE7DC
//   Accent     #EA9940
//
// expired  → Primary sólido (texto blanco) — señal de urgencia máxima
// critical → Accent sólido (texto blanco) — urgente
// warning  → Accent tenue (texto Primary) — atención
// ok       → Secondary tenue (texto Primary) — todo bien
// reported_lost → Primary tenue alta opacidad (texto blanco)
//
// REGLA ABSOLUTA: CERO emojis, cero colores fuera de paleta.

import type { WalletDoc } from '../../../types/wallet';
import { daysUntilExpiration, expirationLevel } from '../../../types/wallet';

interface ExpirationBadgeProps {
  doc: WalletDoc;
  showDate?: boolean;
  className?: string;
}

const LEVEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  expired:  { bg: '#12212E',                  text: '#ECE7DC',   label: 'Vencido' },
  critical: { bg: '#EA9940',                  text: '#12212E',   label: 'Vence pronto' },
  warning:  { bg: 'rgba(234,153,64,0.18)',    text: '#12212E',   label: 'Por vencer' },
  ok:       { bg: 'rgba(48,112,130,0.15)',    text: '#307082',   label: 'Vigente' },
  none:     { bg: 'transparent',              text: 'inherit',   label: '' },
};

export function ExpirationBadge({ doc, showDate = false, className = '' }: ExpirationBadgeProps) {
  if (doc.isReportedLost) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
        style={{ background: 'rgba(18,33,46,0.85)', color: '#ECE7DC' }}
      >
        Reportado perdido
      </span>
    );
  }

  const level = expirationLevel(doc);
  if (level === 'none') return null;

  const days = daysUntilExpiration(doc);
  const style = LEVEL_STYLES[level];

  let label = style.label;
  if (days !== null) {
    if (days < 0) label = `Vencio hace ${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'}`;
    else if (days === 0) label = 'Vence hoy';
    else if (days === 1) label = 'Vence manana';
    else if (days <= 30) label = `Vence en ${days} dias`;
  }

  const dateStr = showDate && doc.expirationDate
    ? ` · ${new Date(doc.expirationDate + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : '';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ background: style.bg, color: style.text }}
    >
      {label}{dateStr}
    </span>
  );
}
