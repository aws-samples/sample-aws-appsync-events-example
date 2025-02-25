import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { enResources } from './locales/en/translation';

i18n
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',

    resources: {
      en: {
        translation: enResources
      }
    }
  });

export default i18n;