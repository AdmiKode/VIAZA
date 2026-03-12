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
    primary: '#276189',
    secondary: '#96D0CD',
    accent: '#F0DD77',
    background: '#F7F6F0'
  },
  mountain: {
    primary: '#3B4D2C',
    secondary: '#7D8F55',
    accent: '#C8B47D',
    background: '#F5F2E8'
  },
  city: {
    primary: '#223041',
    secondary: '#607D8B',
    accent: '#EA9940',
    background: '#F2F0EB'
  },
  camping: {
    primary: '#425A36',
    secondary: '#83936D',
    accent: '#D2A65A',
    background: '#F5F1E7'
  },
  work: {
    primary: '#1F2A44',
    secondary: '#4B6B8A',
    accent: '#D59B47',
    background: '#F4F3F0'
  },
  snow: {
    primary: '#1C3A52',
    secondary: '#6AACCF',
    accent: '#E8C96A',
    background: '#F0F4F8'
  },
  roadtrip: {
    primary: '#2A3220',
    secondary: '#6B8A5A',
    accent: '#E8A040',
    background: '#F4F2EC'
  },
  adventure: {
    primary: '#3A2820',
    secondary: '#8A6040',
    accent: '#E06030',
    background: '#F5F0EB'
  }
};

