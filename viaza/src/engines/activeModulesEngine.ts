import type { Trip } from '../types/trip';
import { buildTripContext } from './tripContextEngine';

export type ActiveModuleId =
  | 'weather'
  | 'packing'
  | 'wallet'
  | 'wallet_ocr'
  | 'agenda'
  | 'itinerary'
  | 'places'
  | 'recommendations'
  | 'translator'
  | 'quick_phrases'
  | 'route'
  | 'emergency'
  | 'safety'
  | 'budget';

function uniqStable(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

export function computeActiveModules(params: { trip: Trip; isPremium: boolean }): ActiveModuleId[] {
  const { trip, isPremium } = params;
  const ctx = buildTripContext(trip);

  const hasCoords =
    Number.isFinite(trip.lat) &&
    Number.isFinite(trip.lon) &&
    !(Number(trip.lat) === 0 && Number(trip.lon) === 0);

  const base: ActiveModuleId[] = [
    'packing',
    'wallet',
    'agenda',
    'emergency',
    'safety',
    'budget',
    'translator',
    'quick_phrases',
  ];

  if (trip.transportType) {
    const hasOriginText = Boolean(trip.originCity && trip.originCity.trim().length > 0);
    const hasDestinationText = Boolean(trip.destination && trip.destination.trim().length > 0);
    // Exponer rutas cuando hay contexto suficiente para deep links, no sólo con coords completas.
    if (hasOriginText || hasDestinationText) base.push('route');
  }

  if (isPremium) {
    // Módulos que dependen de destino real (lat/lon)
    if (hasCoords) {
      base.push('places', 'weather', 'recommendations');
    }
    base.push('wallet_ocr', 'itinerary');
  }

  // Ajustes por fase
  if (ctx.tripPhase === 'post_trip') {
    // En cierre: ocultar módulos “operativos” costosos por default
    const post = base.filter((m) => !['weather', 'recommendations', 'translator', 'quick_phrases'].includes(m));
    return uniqStable(post) as ActiveModuleId[];
  }

  if (ctx.tripPhase === 'in_trip') {
    // En viaje: priorizar lo operativo del día
    const inTrip: ActiveModuleId[] = [
      ...(isPremium ? (['recommendations', 'weather', 'places'] as ActiveModuleId[]) : []),
      ...base,
    ];
    return uniqStable(inTrip) as ActiveModuleId[];
  }

  // pre_trip
  const preTrip: ActiveModuleId[] = [
    ...(isPremium ? (['weather', 'places'] as ActiveModuleId[]) : []),
    ...base,
  ];
  return uniqStable(preTrip) as ActiveModuleId[];
}
