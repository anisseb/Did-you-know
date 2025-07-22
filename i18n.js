import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'fr',
    fallbackLng: 'en',
    resources: {
      fr: { translation: fr },
      en: { translation: en }
    }
  });

export default i18n; 