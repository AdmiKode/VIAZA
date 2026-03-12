export type PackingCategory =
  | 'documents'
  | 'clothes'
  | 'toiletries'
  | 'electronics'
  | 'health'
  | 'extras';

export type PackingSource = 'default' | 'travel_type' | 'climate' | 'laundry' | 'airline' | 'user_custom' | 'activity';

export interface PackingItem {
  id: string;
  tripId: string;
  travelerId?: string;  // undefined = ítem compartido del viaje
  category: PackingCategory;
  label: string;
  labelKey?: string;
  quantity: number;
  checked: boolean;
  required: boolean;
  source: PackingSource;
}
