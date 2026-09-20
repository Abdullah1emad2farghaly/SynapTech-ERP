// Intended project path: src/components/admin/cashier/statistics/CashierStatsHeader.tsx
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

interface CashierStatsHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CashierStatsHeader = ({ onRefresh, isRefreshing }: CashierStatsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
          {t("cashierStats.title")}
        </h1>
        <p className="mt-0.5 text-sm text-[var(--ink-tertiary)]">{t("cashierStats.subtitle")}</p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 rounded-md border border-[var(--hairline)] px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:border-[var(--signal)] hover:text-[var(--ink-primary)] disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        {t("cashierStats.refresh")}
      </button>
    </div>
  );
};
