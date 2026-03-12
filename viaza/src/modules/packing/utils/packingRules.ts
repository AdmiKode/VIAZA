import type { ClimateType, TravelType, TravelerGroup } from '../../../types/trip';
import type { PackingCategory, PackingItem, PackingSource } from '../../../types/packing';

export type { PackingCategory, PackingItem, PackingSource };

type RuleItem = {
  category: PackingCategory;
  labelKey: string;
  source: PackingSource;
  quantity?: number;
  required?: boolean;
};

// ─── BASE — todos los viajes ───────────────────────────────────────────────────
export const baseRuleItems: RuleItem[] = [
  { category: 'documents',  labelKey: 'packing.item.idOrPassport',    source: 'default', required: true },
  { category: 'documents',  labelKey: 'packing.item.travelInsurance', source: 'default' },
  { category: 'electronics',labelKey: 'packing.item.phoneCharger',    source: 'default', required: true },
  { category: 'toiletries', labelKey: 'packing.item.toothbrush',      source: 'default', required: true },
  { category: 'toiletries', labelKey: 'packing.item.toothpaste',      source: 'default', required: true },
  { category: 'toiletries', labelKey: 'packing.item.deodorant',       source: 'default', required: true },
  { category: 'toiletries', labelKey: 'packing.item.shampoo',         source: 'default' },
  { category: 'health',     labelKey: 'packing.item.basicMeds',       source: 'default' },
  { category: 'health',     labelKey: 'packing.item.painkillers',     source: 'default' },
];

// Renombrado: travelTypeItems → travelTypeBaseItems (nuevo nombre usado en generator)
export const travelTypeItems: Record<TravelType, RuleItem[]> = {
  beach: [
    { category: 'clothes',    labelKey: 'packing.item.swimwear',        source: 'travel_type', quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.lightShorts',     source: 'travel_type', quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.flipFlops',       source: 'travel_type' },
    { category: 'clothes',    labelKey: 'packing.item.lightClothes',    source: 'travel_type', quantity: 3 },
    { category: 'clothes',    labelKey: 'packing.item.beachTowel',      source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.sunscreen',       source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.sunHat',          source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.sunglasses',      source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',     source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.beachBag',        source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.insectRepellent', source: 'travel_type' },
    { category: 'health',     labelKey: 'packing.item.afterSunLotion',  source: 'travel_type' },
    { category: 'toiletries', labelKey: 'packing.item.moisturizer',     source: 'travel_type' },
  ],
  mountain: [
    { category: 'clothes',    labelKey: 'packing.item.hikingBoots',     source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.hikingPants',     source: 'travel_type', quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.fleece',          source: 'travel_type' },
    { category: 'clothes',    labelKey: 'packing.item.windbreaker',     source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.thermalBase',     source: 'travel_type' },
    { category: 'clothes',    labelKey: 'packing.item.hikingSocks',     source: 'travel_type', quantity: 3 },
    { category: 'extras',     labelKey: 'packing.item.backpack',        source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',     source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.firstAidKit',    source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.flashlight',      source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.sunscreen',       source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.trekPoles',       source: 'travel_type' },
    { category: 'health',     labelKey: 'packing.item.altitudePills',   source: 'travel_type' },
  ],
  city: [
    { category: 'clothes',    labelKey: 'packing.item.comfortableShoes', source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.casualOutfit',     source: 'travel_type', quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.nightOutfit',      source: 'travel_type' },
    { category: 'electronics',labelKey: 'packing.item.powerBank',        source: 'travel_type', required: true },
    { category: 'electronics',labelKey: 'packing.item.headphones',       source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.dayBag',           source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.umbrella',         source: 'travel_type' },
  ],
  camping: [
    { category: 'extras',     labelKey: 'packing.item.tent',            source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.sleepingBag',     source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.sleepingPad',     source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.campingStove',    source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.flashlight',      source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.insectRepellent', source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.waterFilter',     source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.multitool',       source: 'travel_type' },
    { category: 'clothes',    labelKey: 'packing.item.hikingBoots',     source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.thermalBase',     source: 'travel_type' },
    { category: 'clothes',    labelKey: 'packing.item.rainPoncho',      source: 'travel_type' },
    { category: 'health',     labelKey: 'packing.item.firstAidKit',    source: 'travel_type', required: true },
  ],
  work: [
    { category: 'electronics',labelKey: 'packing.item.laptop',          source: 'travel_type', required: true },
    { category: 'electronics',labelKey: 'packing.item.laptopCharger',   source: 'travel_type', required: true },
    { category: 'electronics',labelKey: 'packing.item.powerBank',       source: 'travel_type' },
    { category: 'electronics',labelKey: 'packing.item.headphones',      source: 'travel_type' },
    { category: 'documents',  labelKey: 'packing.item.workDocuments',   source: 'travel_type', required: true },
    { category: 'documents',  labelKey: 'packing.item.businessCards',   source: 'travel_type' },
    { category: 'clothes',    labelKey: 'packing.item.formalOutfit',    source: 'travel_type', quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.casualOutfit',    source: 'travel_type', quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.formalShoes',     source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.dayBag',          source: 'travel_type' },
  ],
  snow: [
    { category: 'clothes',    labelKey: 'packing.item.thermalBase',     source: 'travel_type', required: true, quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.skiJacket',       source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.skiPants',        source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.gloves',          source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.beanie',          source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.woolSocks',       source: 'travel_type', quantity: 4 },
    { category: 'clothes',    labelKey: 'packing.item.neckGaiter',      source: 'travel_type' },
    { category: 'clothes',    labelKey: 'packing.item.apresSkiBoots',   source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.skiGoggles',      source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.sunscreen',       source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.lipBalm',         source: 'travel_type', required: true },
    { category: 'health',     labelKey: 'packing.item.handCream',       source: 'travel_type' },
  ],
  roadtrip: [
    { category: 'extras',     labelKey: 'packing.item.firstAidKit',    source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.carCharger',      source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.snacks',          source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',     source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.blanket',         source: 'travel_type' },
    { category: 'clothes',    labelKey: 'packing.item.comfortableShoes', source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.comfyClothes',    source: 'travel_type', quantity: 3 },
    { category: 'electronics',labelKey: 'packing.item.powerBank',       source: 'travel_type' },
  ],
  adventure: [
    { category: 'clothes',    labelKey: 'packing.item.hikingBoots',     source: 'travel_type', required: true },
    { category: 'clothes',    labelKey: 'packing.item.quickDryPants',   source: 'travel_type', quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.windbreaker',     source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.firstAidKit',    source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',     source: 'travel_type', required: true },
    { category: 'extras',     labelKey: 'packing.item.flashlight',      source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.sunscreen',       source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.insectRepellent', source: 'travel_type' },
    { category: 'extras',     labelKey: 'packing.item.survivalKit',     source: 'travel_type' },
  ],
};

// ─── OVERLAY POR GRUPO de viajeros (se suma al travelType) ────────────────────
export const travelerGroupOverlay: Record<TravelerGroup, Partial<Record<TravelType, RuleItem[]>>> = {
  solo: {
    beach: [
      { category: 'clothes',    labelKey: 'packing.item.sunDress',         source: 'travel_type', quantity: 2 },
      { category: 'clothes',    labelKey: 'packing.item.coverUp',          source: 'travel_type', quantity: 2 },
      { category: 'clothes',    labelKey: 'packing.item.dressySandals',    source: 'travel_type' },
      { category: 'clothes',    labelKey: 'packing.item.extraUnderwear',   source: 'travel_type', quantity: 3 },
      { category: 'toiletries', labelKey: 'packing.item.hairProductsSun',  source: 'travel_type' },
      { category: 'toiletries', labelKey: 'packing.item.hairBrush',        source: 'travel_type' },
      { category: 'toiletries', labelKey: 'packing.item.faceSpf',          source: 'travel_type', required: true },
      { category: 'toiletries', labelKey: 'packing.item.makeupBag',        source: 'travel_type' },
      { category: 'toiletries', labelKey: 'packing.item.makeupRemover',    source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.smallPurse',       source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.book',             source: 'travel_type' },
      { category: 'electronics',labelKey: 'packing.item.headphones',       source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.waterproofPouch',  source: 'travel_type' },
    ],
    mountain: [
      { category: 'extras',     labelKey: 'packing.item.emergencyWhistle', source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.travelJournal',    source: 'travel_type' },
    ],
    city: [
      { category: 'clothes',    labelKey: 'packing.item.nightOutfit',      source: 'travel_type', quantity: 2 },
      { category: 'extras',     labelKey: 'packing.item.guidebook',        source: 'travel_type' },
    ],
    work: [
      { category: 'electronics',labelKey: 'packing.item.noiseCancelHeadphones', source: 'travel_type' },
    ],
  },
  couple: {
    beach: [
      { category: 'clothes',    labelKey: 'packing.item.sunDress',         source: 'travel_type', quantity: 2 },
      { category: 'clothes',    labelKey: 'packing.item.coverUp',          source: 'travel_type' },
      { category: 'toiletries', labelKey: 'packing.item.faceSpf',          source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.beachGames',       source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.portableSpeaker',  source: 'travel_type' },
    ],
    city: [
      { category: 'clothes',    labelKey: 'packing.item.romanticOutfit',   source: 'travel_type', quantity: 1 },
      { category: 'extras',     labelKey: 'packing.item.camera',           source: 'travel_type' },
    ],
    mountain: [
      { category: 'extras',     labelKey: 'packing.item.portableSpeaker',  source: 'travel_type' },
    ],
  },
  family: {
    beach: [
      { category: 'clothes',    labelKey: 'packing.item.kidsSwimwear',     source: 'travel_type', quantity: 2 },
      { category: 'clothes',    labelKey: 'packing.item.kidsRashguard',    source: 'travel_type', quantity: 2 },
      { category: 'extras',     labelKey: 'packing.item.kidsSunscreen',    source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.beachToys',        source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.poolInflatables',  source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.tentShade',        source: 'travel_type' },
      { category: 'health',     labelKey: 'packing.item.kidsFirstAid',     source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.snacks',           source: 'travel_type' },
    ],
    mountain: [
      { category: 'clothes',    labelKey: 'packing.item.kidsJacket',       source: 'travel_type', required: true },
      { category: 'clothes',    labelKey: 'packing.item.kidsBoots',        source: 'travel_type' },
      { category: 'health',     labelKey: 'packing.item.kidsFirstAid',     source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.snacks',           source: 'travel_type' },
    ],
    city: [
      { category: 'extras',     labelKey: 'packing.item.stroller',         source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.kidsSnacks',       source: 'travel_type' },
      { category: 'electronics',labelKey: 'packing.item.kidsTablet',       source: 'travel_type' },
    ],
    snow: [
      { category: 'clothes',    labelKey: 'packing.item.kidsSkiSuit',      source: 'travel_type', required: true },
      { category: 'clothes',    labelKey: 'packing.item.kidsGloves',       source: 'travel_type', required: true },
      { category: 'clothes',    labelKey: 'packing.item.kidsBeanie',       source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.kidsSunscreen',    source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.sledge',           source: 'travel_type' },
    ],
    roadtrip: [
      { category: 'extras',     labelKey: 'packing.item.kidsSnacks',       source: 'travel_type', required: true },
      { category: 'electronics',labelKey: 'packing.item.kidsTablet',       source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.carSeatCover',     source: 'travel_type' },
    ],
  },
  family_baby: {
    beach: [
      { category: 'extras',     labelKey: 'packing.item.diapers',          source: 'travel_type', required: true, quantity: 30 },
      { category: 'extras',     labelKey: 'packing.item.babyWipes',        source: 'travel_type', required: true, quantity: 3 },
      { category: 'extras',     labelKey: 'packing.item.babySunscreen',    source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.babyShade',        source: 'travel_type', required: true },
      { category: 'clothes',    labelKey: 'packing.item.babySwimsuit',     source: 'travel_type', required: true, quantity: 2 },
      { category: 'clothes',    labelKey: 'packing.item.babyOnesies',      source: 'travel_type', quantity: 5 },
      { category: 'extras',     labelKey: 'packing.item.stroller',         source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.babyCarrier',      source: 'travel_type' },
      { category: 'health',     labelKey: 'packing.item.babyMeds',         source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.formulaOrFood',    source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.portableCrib',     source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.foldableChangeMat',source: 'travel_type' },
    ],
    mountain: [
      { category: 'extras',     labelKey: 'packing.item.diapers',          source: 'travel_type', required: true, quantity: 30 },
      { category: 'extras',     labelKey: 'packing.item.babyWipes',        source: 'travel_type', required: true },
      { category: 'clothes',    labelKey: 'packing.item.babyWarmLayers',   source: 'travel_type', required: true, quantity: 3 },
      { category: 'extras',     labelKey: 'packing.item.babyCarrier',      source: 'travel_type', required: true },
      { category: 'health',     labelKey: 'packing.item.babyMeds',         source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.formulaOrFood',    source: 'travel_type', required: true },
    ],
    city: [
      { category: 'extras',     labelKey: 'packing.item.diapers',          source: 'travel_type', required: true, quantity: 20 },
      { category: 'extras',     labelKey: 'packing.item.babyWipes',        source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.stroller',         source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.formulaOrFood',    source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.foldableChangeMat',source: 'travel_type' },
    ],
    roadtrip: [
      { category: 'extras',     labelKey: 'packing.item.diapers',          source: 'travel_type', required: true, quantity: 30 },
      { category: 'extras',     labelKey: 'packing.item.babyWipes',        source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.formulaOrFood',    source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.babyCarSeat',      source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.portableCrib',     source: 'travel_type' },
      { category: 'health',     labelKey: 'packing.item.babyMeds',         source: 'travel_type', required: true },
    ],
    snow: [
      { category: 'extras',     labelKey: 'packing.item.diapers',          source: 'travel_type', required: true, quantity: 30 },
      { category: 'clothes',    labelKey: 'packing.item.babySnowsuit',     source: 'travel_type', required: true },
      { category: 'clothes',    labelKey: 'packing.item.babyWarmLayers',   source: 'travel_type', required: true, quantity: 3 },
      { category: 'health',     labelKey: 'packing.item.babyMeds',         source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.formulaOrFood',    source: 'travel_type', required: true },
    ],
  },
  friends: {
    beach: [
      { category: 'extras',     labelKey: 'packing.item.portableSpeaker',  source: 'travel_type', required: true },
      { category: 'extras',     labelKey: 'packing.item.beachGames',       source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.cooler',           source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.waterproofPouch',  source: 'travel_type' },
      { category: 'clothes',    labelKey: 'packing.item.nightOutfit',      source: 'travel_type', quantity: 2 },
    ],
    city: [
      { category: 'extras',     labelKey: 'packing.item.portableSpeaker',  source: 'travel_type' },
      { category: 'clothes',    labelKey: 'packing.item.nightOutfit',      source: 'travel_type', quantity: 2 },
    ],
    mountain: [
      { category: 'extras',     labelKey: 'packing.item.portableSpeaker',  source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.campingGames',     source: 'travel_type' },
    ],
    adventure: [
      { category: 'extras',     labelKey: 'packing.item.portableSpeaker',  source: 'travel_type' },
      { category: 'extras',     labelKey: 'packing.item.groupFirstAid',    source: 'travel_type' },
    ],
  },
};

export const climateItems: Record<ClimateType, RuleItem[]> = {
  hot: [
    { category: 'clothes',    labelKey: 'packing.item.lightClothes',    source: 'climate', quantity: 3 },
    { category: 'extras',     labelKey: 'packing.item.sunHat',          source: 'climate' },
    { category: 'extras',     labelKey: 'packing.item.fanMist',         source: 'climate' },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',     source: 'climate' },
  ],
  mild: [
    { category: 'clothes',    labelKey: 'packing.item.casualClothes',   source: 'climate', quantity: 2 },
    { category: 'clothes',    labelKey: 'packing.item.lightJacket',     source: 'climate' },
  ],
  cold: [
    { category: 'clothes',    labelKey: 'packing.item.coat',            source: 'climate', required: true },
    { category: 'clothes',    labelKey: 'packing.item.gloves',          source: 'climate' },
    { category: 'clothes',    labelKey: 'packing.item.thermalBase',     source: 'climate' },
    { category: 'health',     labelKey: 'packing.item.lipBalm',         source: 'climate' },
    { category: 'health',     labelKey: 'packing.item.handCream',       source: 'climate' },
  ],
  rainy: [
    { category: 'clothes',    labelKey: 'packing.item.rainJacket',      source: 'climate', required: true },
    { category: 'extras',     labelKey: 'packing.item.umbrella',        source: 'climate' },
    { category: 'clothes',    labelKey: 'packing.item.waterproofBoots', source: 'climate' },
  ],
};

export function ruleItemsToPackingItems(params: {
  tripId: string;
  items: RuleItem[];
  idFactory: () => string;
}): PackingItem[] {
  const { tripId, items, idFactory } = params;
  return items.map((x) => ({
    id: idFactory(),
    tripId,
    category: x.category,
    label: x.labelKey,
    labelKey: x.labelKey,
    quantity: x.quantity ?? 1,
    checked: false,
    required: Boolean(x.required),
    source: x.source,
  }));
}

/** Items added when a specific activity is selected */
export const activityItems: Record<string, RuleItem[]> = {
  snorkeling: [
    { category: 'extras',     labelKey: 'packing.item.snorkelMask',      source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.dryBag',           source: 'activity' },
    { category: 'clothes',    labelKey: 'packing.item.rashguard',        source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.waterSandals',     source: 'activity' },
  ],
  surfing: [
    { category: 'clothes',    labelKey: 'packing.item.rashguard',        source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.sunscreen',        source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.dryBag',           source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.waxComb',          source: 'activity' },
  ],
  kayaking: [
    { category: 'clothes',    labelKey: 'packing.item.rashguard',        source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.dryBag',           source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',      source: 'activity' },
    { category: 'clothes',    labelKey: 'packing.item.waterSandals',     source: 'activity' },
  ],
  boattour: [
    { category: 'extras',     labelKey: 'packing.item.sunscreen',        source: 'activity', required: true },
    { category: 'clothes',    labelKey: 'packing.item.lightJacket',      source: 'activity' },
    { category: 'health',     labelKey: 'packing.item.seasicknessMeds',  source: 'activity' },
  ],
  hiking: [
    { category: 'clothes',    labelKey: 'packing.item.hikingBoots',      source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',      source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.firstAidKit',     source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.snacks',           source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.sunscreen',        source: 'activity' },
  ],
  climbing: [
    { category: 'clothes',    labelKey: 'packing.item.climbingShoes',    source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.chalkBag',         source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.firstAidKit',     source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',      source: 'activity' },
  ],
  skiing: [
    { category: 'extras',     labelKey: 'packing.item.skiGoggles',       source: 'activity', required: true },
    { category: 'clothes',    labelKey: 'packing.item.thermalBase',      source: 'activity', required: true },
    { category: 'clothes',    labelKey: 'packing.item.gloves',           source: 'activity', required: true },
    { category: 'clothes',    labelKey: 'packing.item.woolSocks',        source: 'activity', quantity: 3 },
    { category: 'health',     labelKey: 'packing.item.kneePads',         source: 'activity' },
  ],
  snowboard: [
    { category: 'extras',     labelKey: 'packing.item.skiGoggles',       source: 'activity', required: true },
    { category: 'clothes',    labelKey: 'packing.item.thermalBase',      source: 'activity', required: true },
    { category: 'clothes',    labelKey: 'packing.item.gloves',           source: 'activity', required: true },
    { category: 'clothes',    labelKey: 'packing.item.woolSocks',        source: 'activity', quantity: 3 },
  ],
  camping_act: [
    { category: 'extras',     labelKey: 'packing.item.tent',             source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.sleepingBag',      source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.flashlight',       source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.campingStove',     source: 'activity' },
  ],
  photography: [
    { category: 'electronics',labelKey: 'packing.item.camera',           source: 'activity', required: true },
    { category: 'electronics',labelKey: 'packing.item.cameraCharger',    source: 'activity', required: true },
    { category: 'electronics',labelKey: 'packing.item.extraMemoryCard',  source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.tripod',           source: 'activity' },
  ],
  cycling: [
    { category: 'clothes',    labelKey: 'packing.item.cyclingShorts',    source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.helmet',           source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.bikeRepairKit',    source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',      source: 'activity' },
  ],
  yoga: [
    { category: 'clothes',    labelKey: 'packing.item.yogaLeggings',     source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.yogaMat',          source: 'activity' },
  ],
  gastronomy: [
    { category: 'clothes',    labelKey: 'packing.item.nightOutfit',      source: 'activity', quantity: 1 },
  ],
  nightlife: [
    { category: 'clothes',    labelKey: 'packing.item.nightOutfit',      source: 'activity', quantity: 2, required: true },
    { category: 'clothes',    labelKey: 'packing.item.dressShoesOrHeels',source: 'activity' },
    { category: 'health',     labelKey: 'packing.item.earplugs',         source: 'activity' },
  ],
  shopping: [
    { category: 'extras',     labelKey: 'packing.item.extraBag',         source: 'activity' },
    { category: 'documents',  labelKey: 'packing.item.taxRefundDocs',    source: 'activity' },
  ],
  walkingtour: [
    { category: 'clothes',    labelKey: 'packing.item.comfortableShoes', source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.dayBag',           source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',      source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.sunscreen',        source: 'activity' },
  ],
  museums: [
    { category: 'extras',     labelKey: 'packing.item.notepad',          source: 'activity' },
    { category: 'clothes',    labelKey: 'packing.item.smartCasual',      source: 'activity' },
  ],
  wildlife: [
    { category: 'clothes',    labelKey: 'packing.item.neutralClothes',   source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.binoculars',       source: 'activity' },
    { category: 'extras',     labelKey: 'packing.item.insectRepellent',  source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.waterBottle',      source: 'activity' },
  ],
  stargazing: [
    { category: 'clothes',    labelKey: 'packing.item.warmLayerNight',   source: 'activity', required: true },
    { category: 'extras',     labelKey: 'packing.item.blanket',          source: 'activity' },
    { category: 'electronics',labelKey: 'packing.item.redLightTorch',    source: 'activity' },
  ],
};
