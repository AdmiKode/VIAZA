export type AdapterGuide = {
  countryCode: string;
  countryNameKey: string;
  plugTypes: string[];
  voltage: string;
  frequency: string;
  recommendationKey?: string;
};

export const adapterGuides: AdapterGuide[] = [
  {
    countryCode: 'US',
    countryNameKey: 'country.US',
    plugTypes: ['A', 'B'],
    voltage: '120V',
    frequency: '60Hz',
    recommendationKey: 'adapters.reco.maybeUniversal'
  },
  {
    countryCode: 'MX',
    countryNameKey: 'country.MX',
    plugTypes: ['A', 'B'],
    voltage: '127V',
    frequency: '60Hz',
    recommendationKey: 'adapters.reco.maybeUniversal'
  },
  {
    countryCode: 'JP',
    countryNameKey: 'country.JP',
    plugTypes: ['A', 'B'],
    voltage: '100V',
    frequency: '50/60Hz',
    recommendationKey: 'adapters.reco.checkVoltage'
  },
  {
    countryCode: 'FR',
    countryNameKey: 'country.FR',
    plugTypes: ['C', 'E'],
    voltage: '230V',
    frequency: '50Hz',
    recommendationKey: 'adapters.reco.needAdapter'
  },
  {
    countryCode: 'GB',
    countryNameKey: 'country.GB',
    plugTypes: ['G'],
    voltage: '230V',
    frequency: '50Hz',
    recommendationKey: 'adapters.reco.needAdapter'
  }
];
