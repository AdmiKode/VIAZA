export type TravelThemeName = 'brand' | 'beach' | 'mountain' | 'city' | 'camping' | 'work' | 'snow' | 'roadtrip' | 'adventure';

export type ThemeColors = {
  primary: string;
  secondary: string;
  soft: string;
  background: string;
  accent: string;
};

export const brandTheme: ThemeColors = {
  primary: '#12212E',
  secondary: '#307082',
  soft: '#6CA3A2',
  background: '#ECE7DC',
  accent: '#EA9940'
};

export const travelThemes: Record<Exclude<TravelThemeName, 'brand'>, Omit<ThemeColors, 'soft'>> = {
  beach: {
    primary: '#12212E',
    secondary: '#307082',
    accent: '#EA9940',
    background: '#ECE7DC'
  },
  mountain: {
    primary: '#12212E',
    secondary: '#6CA3A2',
    accent: '#EA9940',
    background: '#ECE7DC'
  },
  city: {
    primary: '#12212E',
    secondary: '#307082',
    accent: '#EA9940',
    background: '#ECE7DC'
  },
  camping: {
    primary: '#12212E',
    secondary: '#6CA3A2',
    accent: '#EA9940',
    background: '#ECE7DC'
  },
  work: {
    primary: '#12212E',
    secondary: '#307082',
    accent: '#EA9940',
    background: '#ECE7DC'
  },
  snow: {
    primary: '#12212E',
    secondary: '#307082',
    accent: '#EA9940',
    background: '#ECE7DC'
  },
  roadtrip: {
    primary: '#12212E',
    secondary: '#307082',
    accent: '#EA9940',
    background: '#ECE7DC'
  },
  adventure: {
    primary: '#12212E',
    secondary: '#307082',
    accent: '#EA9940',
    background: '#ECE7DC'
  }
};
