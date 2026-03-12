export type QuickPhraseCategory = 'airport' | 'hotel' | 'restaurant' | 'emergency' | 'transport';

export type QuickPhrase = {
  id: string;
  category: QuickPhraseCategory;
  phraseKey: string;
};

export const quickPhrases: QuickPhrase[] = [
  { id: 'airport-1', category: 'airport', phraseKey: 'quickPhrases.phrase.airport.1' },
  { id: 'airport-2', category: 'airport', phraseKey: 'quickPhrases.phrase.airport.2' },
  { id: 'hotel-1', category: 'hotel', phraseKey: 'quickPhrases.phrase.hotel.1' },
  { id: 'hotel-2', category: 'hotel', phraseKey: 'quickPhrases.phrase.hotel.2' },
  { id: 'restaurant-1', category: 'restaurant', phraseKey: 'quickPhrases.phrase.restaurant.1' },
  { id: 'restaurant-2', category: 'restaurant', phraseKey: 'quickPhrases.phrase.restaurant.2' },
  { id: 'transport-1', category: 'transport', phraseKey: 'quickPhrases.phrase.transport.1' },
  { id: 'transport-2', category: 'transport', phraseKey: 'quickPhrases.phrase.transport.2' },
  { id: 'emergency-1', category: 'emergency', phraseKey: 'quickPhrases.phrase.emergency.1' },
  { id: 'emergency-2', category: 'emergency', phraseKey: 'quickPhrases.phrase.emergency.2' }
];
