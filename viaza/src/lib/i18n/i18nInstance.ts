import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enRaw from './locales/en.json';
import esRaw from './locales/es.json';
import ptRaw from './locales/pt.json';
import frRaw from './locales/fr.json';
import deRaw from './locales/de.json';

type TranslationDict = Record<string, string>;

const en = enRaw as TranslationDict;
const es = esRaw as TranslationDict;
const pt = ptRaw as TranslationDict;
const fr = frRaw as TranslationDict;
const de = deRaw as TranslationDict;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    fr: { translation: fr },
    de: { translation: de }
  },
  lng: 'es',
  fallbackLng: 'en',
  supportedLngs: ['es', 'en', 'pt', 'fr', 'de'],
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  }
});

export default i18n;
