export type SurvivalTipCategory = 'camping' | 'mountain' | 'beach' | 'nature';

export type SurvivalTip = {
  id: string;
  category: SurvivalTipCategory;
  titleKey?: string;
  descriptionKey?: string;
  titleEs?: string;
  descriptionEs?: string;
  titleEn?: string;
  descriptionEn?: string;
};

export const survivalTips: SurvivalTip[] = [
  {
    id: 'camp-1',
    category: 'camping',
    titleKey: 'survivalTips.tip.camping.1.title',
    descriptionKey: 'survivalTips.tip.camping.1.description'
  },
  {
    id: 'camp-2',
    category: 'camping',
    titleEs: 'Fogón y gas separados',
    descriptionEs: 'Guarda encendedores y cartuchos en bolsa separada y ventilada para evitar fugas.',
    titleEn: 'Stove and fuel separated',
    descriptionEn: 'Keep lighters and gas canisters in a separate ventilated pouch to avoid leaks.'
  },
  {
    id: 'camp-3',
    category: 'camping',
    titleEs: 'Capa seca de emergencia',
    descriptionEs: 'Empaca una muda completa en bolsa impermeable para cambio rápido si llueve.',
    titleEn: 'Emergency dry layer',
    descriptionEn: 'Pack one full dry outfit in a waterproof bag for quick changes in rain.'
  },
  {
    id: 'mount-1',
    category: 'mountain',
    titleKey: 'survivalTips.tip.mountain.1.title',
    descriptionKey: 'survivalTips.tip.mountain.1.description'
  },
  {
    id: 'mount-2',
    category: 'mountain',
    titleEs: 'Salida temprana',
    descriptionEs: 'Empieza caminata al amanecer para evitar tormentas y bajar con luz.',
    titleEn: 'Start early',
    descriptionEn: 'Begin hikes at dawn to avoid storms and return before dark.'
  },
  {
    id: 'mount-3',
    category: 'mountain',
    titleEs: 'Control de altura',
    descriptionEs: 'Hidrátate y sube ritmo gradual el primer día para reducir mal de montaña.',
    titleEn: 'Altitude control',
    descriptionEn: 'Hydrate and keep a gradual pace on day one to reduce altitude sickness.'
  },
  {
    id: 'beach-1',
    category: 'beach',
    titleKey: 'survivalTips.tip.beach.1.title',
    descriptionKey: 'survivalTips.tip.beach.1.description'
  },
  {
    id: 'beach-2',
    category: 'beach',
    titleEs: 'Bolsa seca para electrónicos',
    descriptionEs: 'Protege celular y documentos en dry bag para arena, agua y sal.',
    titleEn: 'Dry bag for electronics',
    descriptionEn: 'Protect phone and documents in a dry bag from sand, water, and salt.'
  },
  {
    id: 'beach-3',
    category: 'beach',
    titleEs: 'Bandera y corrientes',
    descriptionEs: 'Verifica bandera de playa y evita zonas con corriente de resaca.',
    titleEn: 'Flags and currents',
    descriptionEn: 'Check beach safety flags and avoid rip current zones.'
  },
  {
    id: 'nature-1',
    category: 'nature',
    titleKey: 'survivalTips.tip.nature.1.title',
    descriptionKey: 'survivalTips.tip.nature.1.description'
  },
  {
    id: 'nature-2',
    category: 'nature',
    titleEs: 'Plan de regreso',
    descriptionEs: 'Comparte hora de retorno y activa ubicación en tiempo real con un contacto.',
    titleEn: 'Return plan',
    descriptionEn: 'Share return time and enable live location with a trusted contact.'
  },
  {
    id: 'nature-3',
    category: 'nature',
    titleEs: 'Energía de respaldo',
    descriptionEs: 'Lleva power bank cargada y modo ahorro activo antes de entrar sin señal.',
    titleEn: 'Backup power',
    descriptionEn: 'Carry a charged power bank and enable battery saver before no-signal zones.'
  }
];
