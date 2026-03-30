// src/engines/tripBrainEngine.ts
// Motor de prioridad dinámica — Sprint 1 Fase 1 S4 → Fase 2 completo
//
// Inputs: datos del viaje ya disponibles en el Zustand store
// Output: alertas urgentes + sugerencias + % de preparación + módulos ordenados
//
// REGLAS:
//   - Max 3 alertas simultáneas (las más urgentes primero)
//   - Sin IA externa — pura lógica local sobre datos existentes
//   - Sin emojis en los textos — MANIFIESTO VIAZA
//   - Colores de severidad: solo paleta oficial

import type { Trip } from '../types/trip';
import type { PackingItem } from '../types/packing';
import type { WalletDoc } from '../types/wallet';
import { daysUntilExpiration, expirationLevel } from '../types/wallet';
import type { ActiveModuleId } from './activeModulesEngine';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type AlertSeverity = 'urgent' | 'warning' | 'info';

export interface TripAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
}

export interface TripSuggestion {
  id: string;
  title: string;
  description?: string;
  actionPath: string;
  icon?: 'safety' | 'budget' | 'wallet' | 'packing' | 'itinerary' | 'route';
}

export interface TripBrainResult {
  alerts: TripAlert[];        // max 3, ordenadas por severidad
  suggestions: TripSuggestion[];
  readinessPct: number;       // 0-100 — "¿qué tan listo está el viaje?"
  phase: 'planning' | 'pre_trip' | 'in_trip' | 'post_trip' | 'unknown';
  daysLeft: number | null;    // null si no hay fecha de inicio
  /** Módulos ordenados dinámicamente por contexto (para Home dashboard) */
  prioritizedModules: ActiveModuleId[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysFromNow(isoDate: string | undefined | null): number | null {
  if (!isoDate) return null;
  const ms = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function detectPhase(trip: Trip | null): TripBrainResult['phase'] {
  if (!trip?.startDate || !trip?.endDate) return 'unknown';
  const daysToStart = daysFromNow(trip.startDate);
  const daysToEnd = daysFromNow(trip.endDate);
  if (daysToStart === null || daysToEnd === null) return 'unknown';
  if (daysToStart > 7) return 'planning';
  if (daysToStart > 0) return 'pre_trip';
  if (daysToEnd >= 0) return 'in_trip';
  return 'post_trip';
}

function packingProgress(items: PackingItem[]): number {
  if (items.length === 0) return 100; // sin lista no penalizamos
  const packed = items.filter((i) => i.checked).length;
  return Math.round((packed / items.length) * 100);
}

// ─── Motor principal ──────────────────────────────────────────────────────────

export interface TripBrainInput {
  trip: Trip | null;
  packingItems: PackingItem[];
  walletDocs: WalletDoc[];
  hasEmergencyProfile: boolean;  // si emergency_profile está completo
  hasItineraryEvents: boolean;
  /** Budget: total spent so far (USD/local) */
  budgetSpent?: number;
  /** Budget: total planned budget */
  budgetTotal?: number;
  /** Whether destination is a risk zone (from riskZonesService) */
  isRiskDestination?: boolean;
  /** Risk level if destination is a risk zone */
  riskLevel?: 'low' | 'medium' | 'high' | 'extreme';
  /** Active flight watches count */
  flightWatchCount?: number;
  /** Days since last wallet doc was added (to detect stale wallet) */
  daysSinceLastWalletUpdate?: number | null;
  /** Número de medicamentos críticos sin empacar */
  criticalMedsUnpacked?: number;
}

export function computeTripBrain(input: TripBrainInput): TripBrainResult {
  const {
    trip,
    packingItems,
    walletDocs,
    hasEmergencyProfile,
    hasItineraryEvents,
    budgetSpent = 0,
    budgetTotal = 0,
    isRiskDestination = false,
    riskLevel,
    daysSinceLastWalletUpdate,
    criticalMedsUnpacked = 0,
  } = input;

  const phase = detectPhase(trip);
  const daysLeft = trip?.startDate ? daysFromNow(trip.startDate) : null;
  const packPct = packingProgress(packingItems);
  const budgetUsedPct = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;
  const isTight = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
  const isApproaching = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

  const allAlerts: TripAlert[] = [];
  const suggestions: TripSuggestion[] = [];

  // ─── ALERTAS ────────────────────────────────────────────────────────────────

  // [URGENTE] Documento vencido
  const expiredDocs = walletDocs.filter((d) => expirationLevel(d) === 'expired');
  if (expiredDocs.length > 0) {
    allAlerts.push({
      id: 'expired_docs',
      severity: 'urgent',
      title: `Documento vencido${expiredDocs.length > 1 ? 's' : ''}`,
      description: `${expiredDocs.length} documento${expiredDocs.length > 1 ? 's' : ''} en tu wallet ${expiredDocs.length > 1 ? 'estan' : 'esta'} vencido${expiredDocs.length > 1 ? 's' : ''}.`,
      actionLabel: 'Ver wallet',
      actionPath: '/wallet',
    });
  }

  // [URGENTE] < 3 días y packing < 80%
  if (isTight && packPct < 80) {
    allAlerts.push({
      id: 'packing_urgent',
      severity: 'urgent',
      title: 'Maleta incompleta',
      description: `Faltan ${100 - packPct}% de items en tu lista de packing y el viaje es en ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}.`,
      actionLabel: 'Ver packing',
      actionPath: '/packing',
    });
  }

  // [URGENTE] Medicamentos críticos sin empacar
  if (criticalMedsUnpacked > 0 && (isApproaching || phase === 'in_trip')) {
    allAlerts.push({
      id: 'critical_meds_unpacked',
      severity: 'urgent',
      title: `Medicamento${criticalMedsUnpacked > 1 ? 's' : ''} crítico${criticalMedsUnpacked > 1 ? 's' : ''} sin empacar`,
      description: `${criticalMedsUnpacked} medicamento${criticalMedsUnpacked > 1 ? 's' : ''} marcado${criticalMedsUnpacked > 1 ? 's' : ''} como crítico${criticalMedsUnpacked > 1 ? 's' : ''} no ${criticalMedsUnpacked > 1 ? 'están' : 'está'} en la maleta.`,
      actionLabel: 'Ver salud',
      actionPath: '/health',
    });
  }

  // [URGENTE] < 7 días y sin perfil de emergencia
  if (isApproaching && !hasEmergencyProfile) {
    allAlerts.push({
      id: 'no_emergency_profile',
      severity: 'urgent',
      title: 'Sin tarjeta de emergencia',
      description: 'Configura tu tarjeta de emergencia antes de viajar. Es vital en caso de accidente.',
      actionLabel: 'Configurar',
      actionPath: '/profile/emergency',
    });
  }

  // [URGENTE] Destino de riesgo alto/extreme — avisar antes del viaje
  if (isRiskDestination && (riskLevel === 'high' || riskLevel === 'extreme') && phase !== 'post_trip') {
    allAlerts.push({
      id: 'risk_destination',
      severity: 'urgent',
      title: `Destino de riesgo ${riskLevel === 'extreme' ? 'extremo' : 'alto'}`,
      description: 'Tu destino tiene alertas de seguridad. Revisa las recomendaciones de viaje y activa Safe Walk.',
      actionLabel: 'Ver seguridad',
      actionPath: '/safety',
    });
  }

  // [WARNING] Presupuesto superado 90%
  if (budgetUsedPct >= 90 && budgetTotal > 0) {
    allAlerts.push({
      id: 'budget_almost_gone',
      severity: budgetUsedPct >= 100 ? 'urgent' : 'warning',
      title: budgetUsedPct >= 100 ? 'Presupuesto agotado' : 'Presupuesto casi agotado',
      description: `Has usado ${Math.round(budgetUsedPct)}% de tu presupuesto total.`,
      actionLabel: 'Ver presupuesto',
      actionPath: '/budget',
    });
  }

  // [WARNING] Documento vence en < 30 días
  const criticalDocs = walletDocs.filter((d) => {
    const lvl = expirationLevel(d);
    return lvl === 'critical' || lvl === 'warning';
  });
  const soonestDoc = criticalDocs.sort((a, b) => {
    const da = daysUntilExpiration(a) ?? 9999;
    const db = daysUntilExpiration(b) ?? 9999;
    return da - db;
  })[0];
  if (soonestDoc) {
    const d = daysUntilExpiration(soonestDoc);
    allAlerts.push({
      id: 'expiring_doc',
      severity: 'warning',
      title: 'Documento proximo a vencer',
      description: `"${soonestDoc.docType}" vence en ${d} dia${d !== 1 ? 's' : ''}.`,
      actionLabel: 'Ver wallet',
      actionPath: '/wallet',
    });
  }

  // [WARNING] Pre-viaje: < 1 día sin itinerario
  if (daysLeft !== null && daysLeft <= 1 && daysLeft >= 0 && !hasItineraryEvents) {
    allAlerts.push({
      id: 'no_itinerary',
      severity: 'warning',
      title: 'Sin itinerario confirmado',
      description: 'El viaje es manana y no tienes actividades en el itinerario.',
      actionLabel: 'Ver itinerario',
      actionPath: '/itinerary',
    });
  }

  // [WARNING] Destino de riesgo medio — informativo
  if (isRiskDestination && riskLevel === 'medium' && (phase === 'pre_trip' || phase === 'planning')) {
    allAlerts.push({
      id: 'risk_medium',
      severity: 'warning',
      title: 'Destino con alertas de seguridad',
      description: 'Consulta las recomendaciones de seguridad para tu destino antes de viajar.',
      actionLabel: 'Ver seguridad',
      actionPath: '/safety',
    });
  }

  // [INFO] Planning phase: sin wallet docs
  if (phase === 'planning' && walletDocs.length === 0) {
    allAlerts.push({
      id: 'no_wallet_docs',
      severity: 'info',
      title: 'Agrega tus documentos',
      description: 'Guarda tu pasaporte, visa y seguro en la wallet para tenerlos siempre disponibles.',
      actionLabel: 'Abrir wallet',
      actionPath: '/wallet',
    });
  }

  // [INFO] Wallet sin actualizar en > 60 días (docs podrían estar desactualizados)
  if (
    walletDocs.length > 0 &&
    daysSinceLastWalletUpdate !== null &&
    daysSinceLastWalletUpdate !== undefined &&
    daysSinceLastWalletUpdate > 60 &&
    phase !== 'post_trip'
  ) {
    allAlerts.push({
      id: 'wallet_stale',
      severity: 'info',
      title: 'Revisa tu wallet',
      description: `No has actualizado tus documentos en ${daysSinceLastWalletUpdate} dias. Comprueba que siguen vigentes.`,
      actionLabel: 'Ver wallet',
      actionPath: '/wallet',
    });
  }

  // ─── SUGERENCIAS ─────────────────────────────────────────────────────────────

  if (phase === 'in_trip') {
    suggestions.push({ id: 'safe_walk', title: 'Activar Safe Walk', description: 'Comparte tu ubicacion en tiempo real', actionPath: '/safety/safewalk', icon: 'safety' });
    suggestions.push({ id: 'budget', title: 'Registrar gastos del dia', actionPath: '/budget', icon: 'budget' });
    if (hasItineraryEvents) {
      suggestions.push({ id: 'route', title: 'Ver ruta del dia', description: 'Transporte hasta tus proximas paradas', actionPath: '/itinerary', icon: 'route' });
    }
    if (isRiskDestination) {
      suggestions.push({ id: 'emergency', title: 'Contactos de emergencia', description: 'Numeros locales de policia y ambulancia', actionPath: '/safety', icon: 'safety' });
    }
  }

  if (phase === 'pre_trip' || phase === 'planning') {
    if (packPct < 100) {
      suggestions.push({ id: 'packing', title: 'Completar lista de packing', actionPath: '/packing', icon: 'packing' });
    }
    suggestions.push({ id: 'budget_plan', title: 'Planificar presupuesto', actionPath: '/budget', icon: 'budget' });
    if (walletDocs.length === 0) {
      suggestions.push({ id: 'wallet_add', title: 'Agregar documentos a la wallet', actionPath: '/wallet', icon: 'wallet' });
    }
    if (!hasItineraryEvents) {
      suggestions.push({ id: 'itinerary', title: 'Crear itinerario del viaje', actionPath: '/itinerary', icon: 'itinerary' });
    }
  }

  if (phase === 'post_trip') {
    suggestions.push({ id: 'split_review', title: 'Revisar cuentas del viaje', actionPath: '/split-bill', icon: 'budget' });
    suggestions.push({ id: 'budget_review', title: 'Resumen de gastos', actionPath: '/budget', icon: 'budget' });
  }

  // ─── READINESS % ─────────────────────────────────────────────────────────────

  // Factores: packing (40%), emergency profile (25%), wallet docs (20%), itinerary (15%)
  const packScore = packPct * 0.40;
  const emergencyScore = hasEmergencyProfile ? 25 : 0;
  const walletScore = walletDocs.length > 0 ? 20 : 0;
  const itineraryScore = hasItineraryEvents ? 15 : 0;
  const readinessPct = Math.round(packScore + emergencyScore + walletScore + itineraryScore);

  // ─── Max 3 alertas, orden: urgent > warning > info ─────────────────────────
  const sorted = allAlerts.sort((a, b) => {
    const order = { urgent: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
  const alerts = sorted.slice(0, 3);

  // ─── MÓDULOS PRIORIZADOS ──────────────────────────────────────────────────────
  //
  // Reglas de reordenación dinámica (sin cambiar la lista de módulos activos,
  // solo el orden para el dashboard Home):
  //   - Si daysLeft <= 3 → safety primero
  //   - Si budget 0 o agotado → budget primero
  //   - Si hay docs vencidos → wallet primero
  //   - Si hay alertas de riesgo → emergency primero
  //   - Si in_trip → itinerary, route arriba
  //   - Si planning → packing, budget arriba

  const base: ActiveModuleId[] = [
    'safety', 'budget', 'wallet', 'packing',
    'itinerary', 'route', 'weather', 'places',
    'recommendations', 'agenda', 'translator',
    'quick_phrases', 'emergency',
  ];

  const priority: ActiveModuleId[] = [];
  const secondary: ActiveModuleId[] = [...base];

  function promote(id: ActiveModuleId) {
    const idx = secondary.indexOf(id);
    if (idx !== -1) {
      secondary.splice(idx, 1);
      priority.push(id);
    }
  }

  // Context-driven promotions
  if (isTight || isRiskDestination) promote('safety');
  if (riskLevel === 'high' || riskLevel === 'extreme') promote('emergency');
  if (expiredDocs.length > 0 || (criticalDocs.length > 0)) promote('wallet');
  if (budgetUsedPct >= 80 || budgetTotal === 0) promote('budget');

  if (phase === 'in_trip') {
    promote('itinerary');
    promote('route');
    promote('weather');
  } else if (phase === 'pre_trip' || phase === 'planning') {
    promote('packing');
    promote('budget');
    if (walletDocs.length === 0) promote('wallet');
  } else if (phase === 'post_trip') {
    promote('budget');
  }

  const prioritizedModules = [...priority, ...secondary];

  return { alerts, suggestions, readinessPct, phase, daysLeft, prioritizedModules };
}
