import type { Trip } from '../../../types/trip';
import type { PackingItem } from '../../../types/packing';
import { calculateClothesNeeded } from '../../laundry/utils/laundryPlanner';
import {
  activityItems,
  baseRuleItems,
  climateItems,
  ruleItemsToPackingItems,
  travelTypeItems,
  travelerGroupOverlay,
} from './packingRules';

function idFactory() {
  return crypto.randomUUID();
}

export function generatePackingItemsForTrip(trip: Trip): PackingItem[] {
  const base = ruleItemsToPackingItems({
    tripId: trip.id,
    items: baseRuleItems,
    idFactory,
  });

  const byTravelType = ruleItemsToPackingItems({
    tripId: trip.id,
    items: travelTypeItems[trip.travelType] ?? [],
    idFactory,
  });

  // Overlay por grupo de viajeros (familia, amigos, bebé, etc.)
  const groupOverlayItems = travelerGroupOverlay[trip.travelerGroup]?.[trip.travelType] ?? [];
  const byGroup = ruleItemsToPackingItems({
    tripId: trip.id,
    items: groupOverlayItems,
    idFactory,
  });

  const byClimate = ruleItemsToPackingItems({
    tripId: trip.id,
    items: climateItems[trip.climate],
    idFactory,
  });

  // Activity-based items
  const byActivities: PackingItem[] = (trip.activities ?? []).flatMap((actId) => {
    const rules = activityItems[actId];
    if (!rules) return [];
    return ruleItemsToPackingItems({ tripId: trip.id, items: rules, idFactory });
  });

  const clothes = calculateClothesNeeded(trip.durationDays, trip.laundryMode);

  // PackingStyle modifier: light reduces clothes, heavy adds extras
  const style = trip.packingStyle ?? 'normal';
  const styleMultiplier = style === 'light' ? 0.7 : style === 'heavy' ? 1.3 : 1.0;

  // Ropa base ajustada por duración × estilo × grupo
  // Se multiplica por el total de personas del viaje
  const totalPeople = (trip.numberOfAdults ?? 1) + (trip.numberOfKids ?? 0);
  const groupQtyBoost = totalPeople > 1 ? totalPeople : 1.0;

  const laundryClothes: PackingItem[] = [
    {
      id: idFactory(),
      tripId: trip.id,
      category: 'clothes',
      label: 'packing.item.shirts',
      labelKey: 'packing.item.shirts',
      quantity: Math.max(1, Math.round(clothes.shirts * styleMultiplier * groupQtyBoost)),
      checked: false,
      required: true,
      source: 'laundry',
    },
    {
      id: idFactory(),
      tripId: trip.id,
      category: 'clothes',
      label: 'packing.item.underwear',
      labelKey: 'packing.item.underwear',
      quantity: Math.max(1, Math.round(clothes.underwear * styleMultiplier * groupQtyBoost)),
      checked: false,
      required: true,
      source: 'laundry',
    },
    {
      id: idFactory(),
      tripId: trip.id,
      category: 'clothes',
      label: 'packing.item.pants',
      labelKey: 'packing.item.pants',
      quantity: Math.max(1, Math.round(clothes.pants * styleMultiplier * groupQtyBoost)),
      checked: false,
      required: true,
      source: 'laundry',
    },
  ];

  return dedupeByKey([...laundryClothes, ...base, ...byTravelType, ...byGroup, ...byClimate, ...byActivities]);
}

function dedupeByKey(items: PackingItem[]) {
  const seen = new Set<string>();
  const out: PackingItem[] = [];
  for (const item of items) {
    const key = `${item.category}::${item.labelKey ?? item.label}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
