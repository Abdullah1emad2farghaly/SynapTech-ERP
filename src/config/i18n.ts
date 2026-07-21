import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "@/locales/en/translation.json";
import ar from "@/locales/ar/translation.json";

export const RTL_LANGUAGES = ["ar"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

// Keep <html lang/dir> in sync with the active language on every change,
// including the first load resolved by the language detector.
function applyDocumentDirection(lng: string) {
  const dir = RTL_LANGUAGES.includes(lng) ? "rtl" : "ltr";
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;
}
applyDocumentDirection(i18n.resolvedLanguage ?? "en");
i18n.on("languageChanged", applyDocumentDirection);

export default i18n;
