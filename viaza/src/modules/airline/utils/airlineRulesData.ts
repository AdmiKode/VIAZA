export type AirlineRule = {
  airline: string;
  carryOnWeightKg?: number;
  checkedBagWeightKg?: number;
  carryOnSize?: string;
  personalItemSize?: string;
  notesKeys?: string[];
};

export const airlineRules: AirlineRule[] = [
  {
    airline: 'Aeromexico',
    carryOnWeightKg: 10,
    checkedBagWeightKg: 23,
    carryOnSize: '55 x 40 x 25 cm',
    personalItemSize: '45 x 35 x 20 cm',
    notesKeys: ['airline.note.liquids']
  },
  {
    airline: 'American Airlines',
    checkedBagWeightKg: 23,
    notesKeys: ['airline.note.alwaysVerify']
  },
  {
    airline: 'Delta',
    checkedBagWeightKg: 23,
    notesKeys: ['airline.note.alwaysVerify']
  },
  {
    airline: 'United',
    checkedBagWeightKg: 23,
    notesKeys: ['airline.note.alwaysVerify']
  },
  {
    airline: 'Ryanair',
    notesKeys: ['airline.note.lowCost']
  }
];

