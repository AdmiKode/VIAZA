export type SurvivalTipCategory = 'camping' | 'mountain' | 'beach' | 'nature';

export type SurvivalTip = {
  id: string;
  category: SurvivalTipCategory;
  titleKey: string;
  descriptionKey: string;
};

export const survivalTips: SurvivalTip[] = [
  {
    id: 'camp-1',
    category: 'camping',
    titleKey: 'survivalTips.tip.camping.1.title',
    descriptionKey: 'survivalTips.tip.camping.1.description'
  },
  {
    id: 'mount-1',
    category: 'mountain',
    titleKey: 'survivalTips.tip.mountain.1.title',
    descriptionKey: 'survivalTips.tip.mountain.1.description'
  },
  {
    id: 'beach-1',
    category: 'beach',
    titleKey: 'survivalTips.tip.beach.1.title',
    descriptionKey: 'survivalTips.tip.beach.1.description'
  },
  {
    id: 'nature-1',
    category: 'nature',
    titleKey: 'survivalTips.tip.nature.1.title',
    descriptionKey: 'survivalTips.tip.nature.1.description'
  }
];
