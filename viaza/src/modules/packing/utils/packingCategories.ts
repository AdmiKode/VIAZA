import type { PackingCategory } from '../../../types/packing';

export const packingCategories: Array<{ id: PackingCategory; titleKey: string }> = [
  { id: 'documents', titleKey: 'packing.category.documents' },
  { id: 'clothes', titleKey: 'packing.category.clothes' },
  { id: 'toiletries', titleKey: 'packing.category.toiletries' },
  { id: 'electronics', titleKey: 'packing.category.electronics' },
  { id: 'health', titleKey: 'packing.category.health' },
  { id: 'extras', titleKey: 'packing.category.extras' }
];

