import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use require to avoid needing resolveJsonModule in tsconfig
// eslint-disable-next-line @typescript-eslint/no-var-requires
const en = require('./en.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const es = require('./es.json');

export const LANGUAGE_KEY = 'app.language';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
  returnNull: false,
  react: { useSuspense: false },
});

export async function loadStoredLanguage() {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved) await i18n.changeLanguage(saved);
  } catch {
    // noop
  }
}

export async function setLanguage(lang: 'en' | 'es') {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export default i18n;

