/**
 * VIcon — Duotone layered icons para VIAZA
 * Estilo: capa base (accent naranja) + capa superior blanca semitransparente
 * Referencia visual: src/assets/icons/ICON_STYLE_REFERENCE.md
 * Sin emojis. Sin librerías externas. SVG propio.
 */
import { cn } from '../../utils/cn';

export type VIconName =
  | 'home'
  | 'bag'
  | 'tools'
  | 'tips'
  | 'settings'
  | 'plane'
  | 'pin'
  | 'currency'
  | 'translate'
  | 'split'
  | 'plug'
  | 'check'
  | 'calendar'
  | 'thermometer'
  | 'user'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'star'
  | 'arrow-swap'
  | 'plus'
  | 'search'
  | 'globe'
  | 'shield'
  | 'food'
  | 'transport'
  | 'culture'
  | 'money'
  | 'close'
  | 'alert'
  | 'clock'
  | 'map'
  | 'laptop'
  | 'laundry'
  | 'info'
  | 'bell'
  | 'send'
  | 'sun'
  | 'snowflake'
  | 'rain';

interface VIconProps {
  name: VIconName;
  size?: number;
  className?: string;
  /** Color accent base. Default: var(--viaza-accent) */
  baseColor?: string;
  /** Color capa superior. Default: blanco */
  topColor?: string;
  /** Opacidad capa superior. Default: 0.55 */
  topOpacity?: number;
}

/* ─── helper para construir el renderizador duotone ─── */
type Layer = { d: string; type: 'base' | 'top'; shape?: 'path' | 'circle' | 'rect'; extra?: Record<string, string | number> };

export function VIcon({
  name,
  size = 24,
  className,
  baseColor,
  topColor = '#ffffff',
  topOpacity = 0.55,
}: VIconProps) {
  const base = baseColor ?? 'var(--viaza-accent)';

  /* ─────────── DEFINICIÓN DE ICONOS ─────────── */
  const render = (): JSX.Element => {
    switch (name) {

      /* HOME */
      case 'home': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M6 22 24 7 42 22V42H30V30H18V42H6Z" fill={base} />
          <path d="M6 22 24 7 42 22 24 9Z" fill={topColor} opacity={topOpacity} />
          <rect x="18" y="30" width="12" height="12" fill={topColor} opacity={topOpacity * 0.7} />
        </svg>
      );

      /* BAG / PACKING */
      case 'bag': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="7" y="18" width="34" height="26" rx="7" fill={base} />
          <path d="M17 18V14a7 7 0 0 1 14 0v4" stroke={base} strokeWidth="4" strokeLinecap="round" fill="none"/>
          <rect x="7" y="18" width="34" height="11" rx="7" fill={topColor} opacity={topOpacity} />
          <path d="M17 18V14a7 7 0 0 1 14 0v4" stroke={topColor} strokeWidth="4" strokeLinecap="round" opacity={topOpacity} fill="none"/>
        </svg>
      );

      /* TOOLS / LLAVE */
      case 'tools': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M37 8a9 9 0 0 0-11.3 11.3L8 37a4.2 4.2 0 0 0 6 6l17.7-17.7A9 9 0 0 0 37 8z" fill={base} />
          <path d="M37 8a9 9 0 0 0-4.5 1.2L15 27a9 9 0 0 0 6 5.4L37 16.2A9 9 0 0 0 37 8z" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* TIPS / BOMBILLA */
      case 'tips': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 6a14 14 0 0 0-7 26.1V38h14v-5.9A14 14 0 0 0 24 6z" fill={base} />
          <ellipse cx="20" cy="15" rx="5" ry="8" fill={topColor} opacity={topOpacity} transform="rotate(-15 20 15)" />
          <rect x="18" y="38" width="12" height="5" rx="2.5" fill={base} />
          <rect x="18" y="38" width="12" height="5" rx="2.5" fill={topColor} opacity={topOpacity * 0.8} />
        </svg>
      );

      /* SETTINGS / ENGRANAJE */
      case 'settings': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M40 20.7l-2.2-.4a15 15 0 0 0-1.3-3.1l1.4-1.8a2 2 0 0 0-.2-2.8l-2.3-2.3a2 2 0 0 0-2.8-.2l-1.8 1.4a15 15 0 0 0-3.1-1.3l-.4-2.2A2 2 0 0 0 25.3 6h-3a2 2 0 0 0-2 1.8l-.4 2.2a15 15 0 0 0-3.1 1.3l-1.8-1.4a2 2 0 0 0-2.8.2l-2.3 2.3a2 2 0 0 0-.2 2.8l1.4 1.8a15 15 0 0 0-1.3 3.1l-2.2.4A2 2 0 0 0 6 22.7v3a2 2 0 0 0 1.8 2l2.2.4a15 15 0 0 0 1.3 3.1l-1.4 1.8a2 2 0 0 0 .2 2.8l2.3 2.3a2 2 0 0 0 2.8.2l1.8-1.4a15 15 0 0 0 3.1 1.3l.4 2.2A2 2 0 0 0 22.7 42h3a2 2 0 0 0 2-1.8l.4-2.2a15 15 0 0 0 3.1-1.3l1.8 1.4a2 2 0 0 0 2.8-.2l2.3-2.3a2 2 0 0 0 .2-2.8l-1.4-1.8a15 15 0 0 0 1.3-3.1l2.2-.4A2 2 0 0 0 42 25.3v-3a2 2 0 0 0-1.8-2z" fill={base} />
          <circle cx="24" cy="24" r="7" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* PLANE / AVIÓN */
      case 'plane': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M44 20 30 18 24 6h-4l3 12-11 2-3-4H6l2 8-2 8h3l3-4 11 2-3 12h4l6-12 14-2a4 4 0 0 0 0-8z" fill={base} />
          <path d="M44 20 30 18 26 8h-2l2 8 11 2z" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* MAP PIN / DESTINO */
      case 'pin': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 4C16.3 4 10 10.3 10 18c0 11 14 26 14 26s14-15 14-26c0-7.7-6.3-14-14-14z" fill={base} />
          <ellipse cx="24" cy="44" rx="7" ry="2.5" fill={topColor} opacity={topOpacity * 0.5} />
          <circle cx="24" cy="18" r="6" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* CURRENCY */
      case 'currency': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="18" cy="26" r="14" fill={base} />
          <circle cx="30" cy="22" r="14" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* TRANSLATE */
      case 'translate': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="3" y="7" width="27" height="20" rx="7" fill={base} />
          <path d="M10 27l-5 7 8-2" fill={base} />
          <rect x="18" y="21" width="27" height="20" rx="7" fill={topColor} opacity={topOpacity} />
          <path d="M38 41l5 7-8-2" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* SPLIT BILL */
      case 'split': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="4" y="13" width="40" height="26" rx="7" fill={base} />
          <rect x="24" y="13" width="20" height="26" rx="0" fill={topColor} opacity={topOpacity * 0.7} />
          <line x1="24" y1="13" x2="24" y2="39" stroke={topColor} strokeWidth="2.5" strokeDasharray="4 3" opacity={topOpacity} />
        </svg>
      );

      /* PLUG / ENCHUFE */
      case 'plug': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="13" y="20" width="22" height="22" rx="7" fill={base} />
          <rect x="17" y="9" width="5" height="13" rx="2.5" fill={base} />
          <rect x="26" y="9" width="5" height="13" rx="2.5" fill={base} />
          <rect x="13" y="20" width="22" height="10" rx="7" fill={topColor} opacity={topOpacity} />
          <circle cx="19" cy="34" r="3" fill={topColor} opacity={topOpacity} />
          <circle cx="29" cy="34" r="3" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* CHECK */
      case 'check': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="5" y="5" width="38" height="38" rx="11" fill={base} />
          <path d="M13 24l9 9 13-15" stroke={topColor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity={topOpacity + 0.2} fill="none" />
        </svg>
      );

      /* CALENDAR */
      case 'calendar': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="4" y="9" width="40" height="36" rx="8" fill={base} />
          <rect x="4" y="9" width="40" height="15" rx="8" fill={topColor} opacity={topOpacity} />
          <rect x="4" y="18" width="40" height="6" fill={topColor} opacity={topOpacity} />
          <rect x="14" y="4" width="5" height="11" rx="2.5" fill={base} />
          <rect x="29" y="4" width="5" height="11" rx="2.5" fill={base} />
          <circle cx="14" cy="33" r="3" fill={topColor} opacity={topOpacity} />
          <circle cx="24" cy="33" r="3" fill={topColor} opacity={topOpacity} />
          <circle cx="34" cy="33" r="3" fill={topColor} opacity={topOpacity} />
          <circle cx="14" cy="41" r="3" fill={topColor} opacity={topOpacity} />
          <circle cx="24" cy="41" r="3" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* THERMOMETER / CLIMA */
      case 'thermometer': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="19" y="5" width="10" height="28" rx="5" fill={base} />
          <circle cx="24" cy="37" r="8" fill={base} />
          <rect x="21" y="19" width="6" height="17" rx="3" fill={topColor} opacity={topOpacity} />
          <circle cx="24" cy="37" r="4.5" fill={topColor} opacity={topOpacity} />
          <line x1="29" y1="13" x2="34" y2="13" stroke={topColor} strokeWidth="2.5" opacity={topOpacity} />
          <line x1="29" y1="20" x2="34" y2="20" stroke={topColor} strokeWidth="2.5" opacity={topOpacity} />
          <line x1="29" y1="27" x2="34" y2="27" stroke={topColor} strokeWidth="2.5" opacity={topOpacity} />
        </svg>
      );

      /* USER */
      case 'user': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M6 44c0-10 8-18 18-18s18 8 18 18" fill={base} />
          <rect x="6" y="26" width="36" height="18" fill={base} />
          <circle cx="24" cy="17" r="11" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* CHEVRON RIGHT */
      case 'chevron-right': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M18 10l12 14-12 14" stroke={base} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

      /* CHEVRON LEFT */
      case 'chevron-left': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M30 10L18 24l12 14" stroke={base} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

      /* CHEVRON DOWN */
      case 'chevron-down': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M10 18l14 12 14-12" stroke={base} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

      /* STAR / PREMIUM */
      case 'star': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 4l5.8 11.7 12.9 1.9-9.3 9.1 2.2 12.8L24 33.4l-11.6 6.1 2.2-12.8L5.3 17.6l12.9-1.9z" fill={base} />
          <path d="M24 4l5.8 11.7 3-.4L24 4z" fill={topColor} opacity={topOpacity} />
          <path d="M24 4l-5.8 11.7-3-.4L24 4z" fill={topColor} opacity={topOpacity * 0.6} />
        </svg>
      );

      /* ARROW SWAP */
      case 'arrow-swap': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M8 16h32M32 8l8 8-8 8" stroke={base} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M40 32H8M16 24l-8 8 8 8" stroke={topColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity={topOpacity + 0.2} fill="none" />
        </svg>
      );

      /* PLUS */
      case 'plus': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19" fill={base} />
          <path d="M24 13v22M13 24h22" stroke={topColor} strokeWidth="4" strokeLinecap="round" opacity={topOpacity + 0.25} fill="none" />
        </svg>
      );

      /* SEARCH */
      case 'search': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="21" cy="21" r="15" fill={base} />
          <circle cx="18" cy="18" r="7" fill={topColor} opacity={topOpacity} />
          <line x1="31" y1="31" x2="43" y2="43" stroke={base} strokeWidth="5" strokeLinecap="round" />
        </svg>
      );

      /* GLOBE */
      case 'globe': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19" fill={base} />
          <ellipse cx="24" cy="24" rx="8" ry="19" fill={topColor} opacity={topOpacity} />
          <line x1="5" y1="24" x2="43" y2="24" stroke={topColor} strokeWidth="2.5" opacity={topOpacity} />
          <line x1="8" y1="15" x2="40" y2="15" stroke={topColor} strokeWidth="2" opacity={topOpacity * 0.7} />
          <line x1="8" y1="33" x2="40" y2="33" stroke={topColor} strokeWidth="2" opacity={topOpacity * 0.7} />
        </svg>
      );

      /* SHIELD / SEGURIDAD */
      case 'shield': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 4L5 12v12c0 12 9 22 19 24 10-2 19-12 19-24V12z" fill={base} />
          <path d="M24 4L43 12v12c0 12-9 22-19 24V4z" fill={topColor} opacity={topOpacity} />
          <path d="M15 24l7 7 11-11" stroke={topColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity={topOpacity + 0.2} fill="none" />
        </svg>
      );

      /* FOOD */
      case 'food': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M8 6v12a10 10 0 0 0 20 0V6" fill={base} />
          <rect x="8" y="6" width="20" height="6" fill={topColor} opacity={topOpacity} />
          <line x1="18" y1="6" x2="18" y2="44" stroke={base} strokeWidth="4" strokeLinecap="round" />
          <rect x="30" y="6" width="10" height="10" rx="2" fill={base} />
          <line x1="35" y1="16" x2="35" y2="44" stroke={base} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

      /* TRANSPORT */
      case 'transport': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="4" y="10" width="30" height="24" rx="6" fill={base} />
          <path d="M34 20h6l5 6v8h-11z" fill={base} />
          <rect x="4" y="10" width="30" height="10" rx="6" fill={topColor} opacity={topOpacity} />
          <circle cx="12" cy="38" r="5" fill={base} />
          <circle cx="12" cy="38" r="2.5" fill={topColor} opacity={topOpacity} />
          <circle cx="36" cy="38" r="5" fill={base} />
          <circle cx="36" cy="38" r="2.5" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* CULTURE */
      case 'culture': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M4 40V20L24 6l20 14v20z" fill={base} />
          <path d="M4 20L24 6l20 14-20 10z" fill={topColor} opacity={topOpacity} />
          <rect x="18" y="28" width="12" height="12" rx="2" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* MONEY */
      case 'money': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="3" y="12" width="42" height="26" rx="7" fill={base} />
          <circle cx="24" cy="25" r="7" fill={topColor} opacity={topOpacity} />
          <circle cx="8" cy="25" r="4" fill={topColor} opacity={topOpacity * 0.7} />
          <circle cx="40" cy="25" r="4" fill={topColor} opacity={topOpacity * 0.7} />
        </svg>
      );

      /* CLOSE */
      case 'close': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19" fill={base} opacity={0.2} />
          <path d="M15 15l18 18M33 15L15 33" stroke={base} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      );

      /* ALERT */
      case 'alert': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 4L2 42h44z" fill={base} />
          <path d="M24 4l11 20H13z" fill={topColor} opacity={topOpacity} />
          <rect x="22" y="20" width="4" height="12" rx="2" fill={topColor} opacity={topOpacity + 0.2} />
          <circle cx="24" cy="37" r="2.5" fill={topColor} opacity={topOpacity + 0.2} />
        </svg>
      );

      /* CLOCK */
      case 'clock': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19" fill={base} />
          <circle cx="24" cy="24" r="14" fill={topColor} opacity={topOpacity} />
          <path d="M24 14v10l7 5" stroke={base} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

      /* MAP */
      case 'map': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M3 8l14 4 14-4 14 4v28l-14-4-14 4-14-4z" fill={base} />
          <path d="M17 12v28M31 8v28" stroke={topColor} strokeWidth="2.5" opacity={topOpacity} />
          <path d="M3 8l14 4V8z" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* LAPTOP */
      case 'laptop': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="5" y="7" width="38" height="26" rx="6" fill={base} />
          <rect x="5" y="7" width="38" height="10" rx="6" fill={topColor} opacity={topOpacity} />
          <rect x="2" y="33" width="44" height="8" rx="4" fill={base} />
          <rect x="16" y="33" width="16" height="3" rx="1.5" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* LAUNDRY */
      case 'laundry': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="5" y="5" width="38" height="40" rx="7" fill={base} />
          <rect x="5" y="5" width="38" height="13" rx="7" fill={topColor} opacity={topOpacity} />
          <circle cx="24" cy="30" r="10" fill={topColor} opacity={topOpacity} />
          <circle cx="24" cy="30" r="6" fill={base} opacity={0.6} />
          <circle cx="10" cy="11" r="2.5" fill={base} />
          <circle cx="17" cy="11" r="2.5" fill={base} />
        </svg>
      );

      /* INFO */
      case 'info': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19" fill={base} />
          <circle cx="24" cy="24" r="14" fill={topColor} opacity={topOpacity} />
          <circle cx="24" cy="15" r="2.5" fill={base} />
          <rect x="22" y="21" width="4" height="14" rx="2" fill={base} />
        </svg>
      );

      /* BELL */
      case 'bell': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 4a2 2 0 0 0-2 2v2.3C15 9.9 9 16.3 9 24v11l-3 4h36l-3-4V24c0-7.7-6-14.1-13-15.7V6a2 2 0 0 0-2-2z" fill={base} />
          <path d="M24 4v2.3C17 9.9 11 16.3 11 24v5c4-6 8-9 13-9s9 3 13 9v-5c0-7.7-6-14.1-13-15.7V6a2 2 0 0 0-2-2z" fill={topColor} opacity={topOpacity} />
          <ellipse cx="24" cy="41" rx="5" ry="3" fill={base} />
        </svg>
      );

      /* SEND */
      case 'send': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M5 5l38 19-38 19V28l28-4-28-4z" fill={base} />
          <path d="M33 24 5 12v8l22 4z" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* SUN */
      case 'sun': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19" fill={base} opacity={0.25} />
          <circle cx="24" cy="24" r="12" fill={base} />
          <circle cx="20" cy="19" r="5" fill={topColor} opacity={topOpacity * 0.9} />
        </svg>
      );

      /* SNOWFLAKE */
      case 'snowflake': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <line x1="24" y1="5" x2="24" y2="43" stroke={base} strokeWidth="4.5" strokeLinecap="round" />
          <line x1="5" y1="24" x2="43" y2="24" stroke={base} strokeWidth="4.5" strokeLinecap="round" />
          <line x1="9" y1="9" x2="39" y2="39" stroke={base} strokeWidth="4.5" strokeLinecap="round" />
          <line x1="39" y1="9" x2="9" y2="39" stroke={base} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="24" cy="24" r="6" fill={topColor} opacity={topOpacity} />
        </svg>
      );

      /* RAIN */
      case 'rain': return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M37 21a9 9 0 0 0-17.3-3.5A6.5 6.5 0 1 0 9 23h28a9 9 0 0 0 0-2z" fill={base} />
          <line x1="14" y1="31" x2="11" y2="43" stroke={topColor} strokeWidth="3" strokeLinecap="round" opacity={topOpacity} />
          <line x1="24" y1="31" x2="21" y2="43" stroke={topColor} strokeWidth="3" strokeLinecap="round" opacity={topOpacity} />
          <line x1="34" y1="31" x2="31" y2="43" stroke={topColor} strokeWidth="3" strokeLinecap="round" opacity={topOpacity} />
        </svg>
      );
    }
  };

  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', className)} aria-hidden="true">
      {render()}
    </span>
  );
}
