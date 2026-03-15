export type QuickPhraseCategory =
  | 'airport'
  | 'hotel'
  | 'restaurant'
  | 'transport'
  | 'shopping'
  | 'emergency'
  | 'health'
  | 'directions'
  | 'basic_conversation';

export type QuickPhrase = {
  id: string;
  category: QuickPhraseCategory;
  phraseKey: string;
};

export const quickPhrases: QuickPhrase[] = [
  // Airport
  { id: 'airport-1', category: 'airport', phraseKey: 'quickPhrases.phrase.airport.1' },
  { id: 'airport-2', category: 'airport', phraseKey: 'quickPhrases.phrase.airport.2' },
  { id: 'airport-3', category: 'airport', phraseKey: 'quickPhrases.phrase.airport.3' },
  { id: 'airport-4', category: 'airport', phraseKey: 'quickPhrases.phrase.airport.4' },

  // Hotel
  { id: 'hotel-1', category: 'hotel', phraseKey: 'quickPhrases.phrase.hotel.1' },
  { id: 'hotel-2', category: 'hotel', phraseKey: 'quickPhrases.phrase.hotel.2' },
  { id: 'hotel-3', category: 'hotel', phraseKey: 'quickPhrases.phrase.hotel.3' },
  { id: 'hotel-4', category: 'hotel', phraseKey: 'quickPhrases.phrase.hotel.4' },

  // Restaurant
  { id: 'restaurant-1', category: 'restaurant', phraseKey: 'quickPhrases.phrase.restaurant.1' },
  { id: 'restaurant-2', category: 'restaurant', phraseKey: 'quickPhrases.phrase.restaurant.2' },
  { id: 'restaurant-3', category: 'restaurant', phraseKey: 'quickPhrases.phrase.restaurant.3' },
  { id: 'restaurant-4', category: 'restaurant', phraseKey: 'quickPhrases.phrase.restaurant.4' },

  // Transport
  { id: 'transport-1', category: 'transport', phraseKey: 'quickPhrases.phrase.transport.1' },
  { id: 'transport-2', category: 'transport', phraseKey: 'quickPhrases.phrase.transport.2' },
  { id: 'transport-3', category: 'transport', phraseKey: 'quickPhrases.phrase.transport.3' },
  { id: 'transport-4', category: 'transport', phraseKey: 'quickPhrases.phrase.transport.4' },

  // Shopping
  { id: 'shopping-1', category: 'shopping', phraseKey: 'quickPhrases.phrase.shopping.1' },
  { id: 'shopping-2', category: 'shopping', phraseKey: 'quickPhrases.phrase.shopping.2' },
  { id: 'shopping-3', category: 'shopping', phraseKey: 'quickPhrases.phrase.shopping.3' },
  { id: 'shopping-4', category: 'shopping', phraseKey: 'quickPhrases.phrase.shopping.4' },

  // Emergency
  { id: 'emergency-1', category: 'emergency', phraseKey: 'quickPhrases.phrase.emergency.1' },
  { id: 'emergency-2', category: 'emergency', phraseKey: 'quickPhrases.phrase.emergency.2' },
  { id: 'emergency-3', category: 'emergency', phraseKey: 'quickPhrases.phrase.emergency.3' },
  { id: 'emergency-4', category: 'emergency', phraseKey: 'quickPhrases.phrase.emergency.4' },

  // Health
  { id: 'health-1', category: 'health', phraseKey: 'quickPhrases.phrase.health.1' },
  { id: 'health-2', category: 'health', phraseKey: 'quickPhrases.phrase.health.2' },
  { id: 'health-3', category: 'health', phraseKey: 'quickPhrases.phrase.health.3' },
  { id: 'health-4', category: 'health', phraseKey: 'quickPhrases.phrase.health.4' },

  // Directions
  { id: 'directions-1', category: 'directions', phraseKey: 'quickPhrases.phrase.directions.1' },
  { id: 'directions-2', category: 'directions', phraseKey: 'quickPhrases.phrase.directions.2' },
  { id: 'directions-3', category: 'directions', phraseKey: 'quickPhrases.phrase.directions.3' },
  { id: 'directions-4', category: 'directions', phraseKey: 'quickPhrases.phrase.directions.4' },

  // Basic conversation
  { id: 'basic-1', category: 'basic_conversation', phraseKey: 'quickPhrases.phrase.basic.1' },
  { id: 'basic-2', category: 'basic_conversation', phraseKey: 'quickPhrases.phrase.basic.2' },
  { id: 'basic-3', category: 'basic_conversation', phraseKey: 'quickPhrases.phrase.basic.3' },
  { id: 'basic-4', category: 'basic_conversation', phraseKey: 'quickPhrases.phrase.basic.4' }
];
