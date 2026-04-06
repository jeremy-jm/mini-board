import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';
import { getInitialLanguage } from "../lib/userPreferences";

const resources = {
  "zh-CN": { translation: zhCN },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  supportedLngs: ["zh-CN", "en"],
  interpolation: { escapeValue: false },
});

export default i18n;
