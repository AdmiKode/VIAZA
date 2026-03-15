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
  | 'emergency';

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

  const base: ActiveModuleId[] = [
    'packing',
    'wallet',
    'agenda',
    'emergency',
  ];

  if (trip.transportType === 'car' || trip.transportType === 'bus' || trip.transportType === 'train') {
    if (trip.originCity && trip.originCity.trim().length > 0) base.push('route');
  }

  if (isPremium) {
    // Módulos que dependen de destino real (lat/lon)
    if (trip.lat != null && trip.lon != null) {
      base.push('places', 'weather', 'recommendations');
    }
    base.push('translator', 'quick_phrases', 'wallet_ocr', 'itinerary');
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
      ...(isPremium ? (['recommendations', 'translator', 'quick_phrases', 'weather', 'places'] as ActiveModuleId[]) : []),
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
