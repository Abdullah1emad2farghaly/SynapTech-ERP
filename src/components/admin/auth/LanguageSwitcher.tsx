import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <label className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-tertiary">
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={i18n.resolvedLanguage}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-synapse rounded"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
