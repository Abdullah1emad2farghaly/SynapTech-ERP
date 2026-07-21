import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mode === "dark"}
      aria-label={t("common.theme")}
      className="inline-flex items-center gap-1.5 rounded text-[0.8125rem] text-ink-tertiary hover:text-ink-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
    >
      {mode === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {mode === "dark" ? t("common.light") : t("common.dark")}
    </button>
  );
}
