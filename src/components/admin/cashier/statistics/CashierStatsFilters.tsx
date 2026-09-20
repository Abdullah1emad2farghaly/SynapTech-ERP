// Intended project path: src/components/admin/cashier/statistics/CashierStatsFilters.tsx
import { useTranslation } from "react-i18next";
import { CASHIER_STATS_DATE_PRESETS, type CashierStatsDatePreset } from "../../../../constants/cashierStatisticsFilters";
import type { DateRange } from "../../../../utils/cashierStatistics.derive";

interface CashierStatsFiltersProps {
  datePreset: CashierStatsDatePreset;
  onDatePresetChange: (preset: CashierStatsDatePreset) => void;
  customRange: DateRange | undefined;
  onCustomRangeChange: (range: DateRange) => void;
  availablePaymentMethods: string[];
  paymentMethodFilter: string | null;
  onPaymentMethodFilterChange: (method: string | null) => void;
}

// Payment-method options come from availablePaymentMethods — real values
// seen in payments[] data — not the provisional CASHIER_PAYMENT_METHODS
// config list, so this never offers a filter for a method never actually
// used. Customer/product filters from the brief were left out: nothing in
// the confirmed contract lets the order list be queried by either, and
// filtering the full list client-side by those dimensions didn't add
// enough value to justify the UI weight — cut, not silently dropped.
export const CashierStatsFilters = ({
  datePreset,
  onDatePresetChange,
  customRange,
  onCustomRangeChange,
  availablePaymentMethods,
  paymentMethodFilter,
  onPaymentMethodFilterChange,
}: CashierStatsFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1 rounded-md bg-[var(--sunken)] p-1">
        {CASHIER_STATS_DATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onDatePresetChange(preset.value)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition ${
              datePreset === preset.value
                ? "bg-[var(--panel)] text-[var(--ink-primary)] shadow-elevation-1"
                : "text-[var(--ink-tertiary)]"
            }`}
          >
            {t(preset.labelKey)}
          </button>
        ))}
      </div>

      {datePreset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customRange?.from.toISOString().slice(0, 10) ?? ""}
            onChange={(e) =>
              onCustomRangeChange({
                from: new Date(e.target.value),
                to: customRange?.to ?? new Date(e.target.value),
              })
            }
            className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2 py-1.5 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
          />
          <span className="text-[var(--ink-tertiary)]">–</span>
          <input
            type="date"
            value={customRange?.to.toISOString().slice(0, 10) ?? ""}
            onChange={(e) =>
              onCustomRangeChange({
                from: customRange?.from ?? new Date(e.target.value),
                to: new Date(e.target.value),
              })
            }
            className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2 py-1.5 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
          />
        </div>
      )}

      {availablePaymentMethods.length > 0 && (
        <select
          value={paymentMethodFilter ?? "all"}
          onChange={(e) => onPaymentMethodFilterChange(e.target.value === "all" ? null : e.target.value)}
          className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
        >
          <option value="all">{t("cashierStats.filters.allPaymentMethods")}</option>
          {availablePaymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
