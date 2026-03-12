export type AllowStatus = 'allowed' | 'restricted' | 'forbidden';

export type AirportAllowedItem = {
  id: string;
  labelKey: string;
  carryOn: AllowStatus;
  checked: AllowStatus;
  notesKey?: string;
  keywords: string[];
};

export const airportItems: AirportAllowedItem[] = [
  {
    id: 'perfume',
    labelKey: 'allowedItems.item.perfume',
    carryOn: 'restricted',
    checked: 'allowed',
    notesKey: 'allowedItems.note.liquids',
    keywords: ['perfume', 'fragancia']
  },
  {
    id: 'power-bank',
    labelKey: 'allowedItems.item.powerBank',
    carryOn: 'allowed',
    checked: 'forbidden',
    notesKey: 'allowedItems.note.battery',
    keywords: ['power bank', 'bateria', 'battery']
  },
  {
    id: 'razor',
    labelKey: 'allowedItems.item.razor',
    carryOn: 'restricted',
    checked: 'allowed',
    keywords: ['rastrillo', 'razor']
  },
  {
    id: 'knife',
    labelKey: 'allowedItems.item.knife',
    carryOn: 'forbidden',
    checked: 'allowed',
    keywords: ['navaja', 'knife']
  },
  {
    id: 'shampoo',
    labelKey: 'allowedItems.item.shampoo',
    carryOn: 'restricted',
    checked: 'allowed',
    notesKey: 'allowedItems.note.liquids',
    keywords: ['shampoo', 'liquidos', 'líquidos']
  },
  {
    id: 'medication',
    labelKey: 'allowedItems.item.medication',
    carryOn: 'allowed',
    checked: 'allowed',
    keywords: ['medicamentos', 'medicine', 'medication']
  }
];

