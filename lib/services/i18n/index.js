import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import locales from '../../locales';
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: locales,
    lng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
