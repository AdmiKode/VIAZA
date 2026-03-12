export type LocalTipCategory = 'safety' | 'transport' | 'culture' | 'money' | 'food' | 'utilities';

export type LocalTip = {
  id: string;
  category: LocalTipCategory;
  titleKey: string;
  descriptionKey: string;
  city?: string;
  countryCode?: string;
};

export const localTips: LocalTip[] = [
  {
    id: 'rome-1',
    category: 'safety',
    titleKey: 'localTips.tip.rome.1.title',
    descriptionKey: 'localTips.tip.rome.1.description',
    city: 'Rome',
    countryCode: 'IT'
  },
  {
    id: 'tokyo-1',
    category: 'transport',
    titleKey: 'localTips.tip.tokyo.1.title',
    descriptionKey: 'localTips.tip.tokyo.1.description',
    city: 'Tokyo',
    countryCode: 'JP'
  },
  {
    id: 'generic-1',
    category: 'money',
    titleKey: 'localTips.tip.generic.1.title',
    descriptionKey: 'localTips.tip.generic.1.description'
  }
];
