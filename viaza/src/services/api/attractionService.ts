/**
 * attractionService.ts
 * Consulta Overpass API (OpenStreetMap) para obtener categorías de atracciones
 * en un destino y las convierte en activities[] para el trip.
 *
 * Activities se usan en packingGenerator para agregar items específicos.
 */

export type ActivityTag =
  | 'beach'
  | 'hiking'
  | 'ski'
  | 'museum'
  | 'nightlife'
  | 'shopping'
  | 'religious'
  | 'water_sports'
  | 'theme_park'
  | 'wildlife'
  | 'cycling';

interface GeoCoords {
  latitude: number;
  longitude: number;
}

/**
 * Mapa de queries Overpass → activity tag.
 * Cada entrada busca nodos en un radio de 50km del centro del destino.
 */
const ACTIVITY_QUERIES: Array<{ tag: ActivityTag; overpassFilter: string }> = [
  { tag: 'beach',       overpassFilter: 'node["natural"="beach"]' },
  { tag: 'hiking',      overpassFilter: 'node["route"="hiking"]' },
  { tag: 'ski',         overpassFilter: 'node["sport"="skiing"]' },
  { tag: 'museum',      overpassFilter: 'node["tourism"="museum"]' },
  { tag: 'nightlife',   overpassFilter: 'node["amenity"="nightclub"]' },
  { tag: 'shopping',    overpassFilter: 'node["shop"="mall"]' },
  { tag: 'religious',   overpassFilter: 'node["amenity"="place_of_worship"]' },
  { tag: 'water_sports',overpassFilter: 'node["sport"="surfing"]' },
  { tag: 'theme_park',  overpassFilter: 'node["tourism"="theme_park"]' },
  { tag: 'wildlife',    overpassFilter: 'node["tourism"="zoo"]' },
  { tag: 'cycling',     overpassFilter: 'node["route"="bicycle"]' },
];

/**
 * Detecta qué actividades existen en el destino basándose en POIs de OSM.
 * Devuelve las top N más relevantes (presencia de POIs).
 */
export async function detectActivities(coords: GeoCoords): Promise<ActivityTag[]> {
  const { latitude: lat, longitude: lon } = coords;
  const radius = 50000; // 50km

  const found: ActivityTag[] = [];

  // Las queries se hacen en paralelo con Promise.allSettled para no bloquear si alguna falla
  const results = await Promise.allSettled(
    ACTIVITY_QUERIES.map(async ({ tag, overpassFilter }) => {
      const query = `[out:json][timeout:8];${overpassFilter}(around:${radius},${lat},${lon});out count;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) return { tag, count: 0 };
      const data = await res.json();
      const count: number = data?.elements?.[0]?.tags?.total ?? 0;
      return { tag, count };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.count > 0) {
      found.push(result.value.tag);
    }
  }

  return found;
}

/**
 * Packing items adicionales por actividad detectada.
 * Devuelve labelKeys de packing items que deben agregarse.
 */
export const ACTIVITY_PACKING_EXTRAS: Record<ActivityTag, string[]> = {
  beach:        ['packing.item.swimwear', 'packing.item.sunscreen', 'packing.item.sandals'],
  hiking:       ['packing.item.boots', 'packing.item.flashlight', 'packing.item.rainJacket'],
  ski:          ['packing.item.thermals', 'packing.item.gloves', 'packing.item.skiGoggles'],
  museum:       ['packing.item.comfortableShoes', 'packing.item.guidebook'],
  nightlife:    ['packing.item.casualClothes', 'packing.item.headphones'],
  shopping:     ['packing.item.extraBag'],
  religious:    ['packing.item.modestClothing', 'packing.item.scarf'],
  water_sports: ['packing.item.swimwear', 'packing.item.waterproofCase', 'packing.item.rashGuard'],
  theme_park:   ['packing.item.comfortableShoes', 'packing.item.sunscreen', 'packing.item.powerBank'],
  wildlife:     ['packing.item.insectRepellent', 'packing.item.binoculars'],
  cycling:      ['packing.item.helmet', 'packing.item.cyclingGloves', 'packing.item.repairKit'],
};
