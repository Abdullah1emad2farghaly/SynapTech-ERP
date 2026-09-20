// Intended project path: src/components/admin/cashier/ClosingReportView.tsx
import { useTranslation } from "react-i18next";
import type { ShiftClosingReportResponse } from "../../../services/api/cashier.api";

interface ClosingReportViewProps {
  report: ShiftClosingReportResponse;
}

// Every figure here comes straight off ShiftClosingReportResponse — nothing
// computed or invented beyond the expected-vs-counted delta the backend
// already provides as discrepancyAmount.
export const ClosingReportView = ({ report }: ClosingReportViewProps) => {
  const { t } = useTranslation();

  const Stat = ({ label, value }: { label: string; value: number }) => (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <p className="text-xs text-[var(--ink-tertiary)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--ink-primary)]">
        {value.toFixed(2)}
      </p>
    </div>
  );

  const discrepancy = report.discrepancyAmount;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
        <p className="text-xs text-[var(--ink-tertiary)]">{t("cashier.shift.shiftNumber")}</p>
        <p className="font-mono text-sm font-medium text-[var(--ink-primary)]">
          {report.shiftNumber ?? "—"}
        </p>
        <p className="mt-2 text-xs text-[var(--ink-tertiary)]">
          {new Date(report.openedAt).toLocaleString()}
          {report.closedAt && ` – ${new Date(report.closedAt).toLocaleString()}`}
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">
          {t("cashier.closingReport.orders")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t("cashier.closingReport.completedOrders")} value={report.completedOrderCount} />
          <Stat label={t("cashier.closingReport.voidedOrders")} value={report.voidedOrderCount} />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">
          {t("cashier.closingReport.sales")}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <Stat label={t("cashier.closingReport.cashSales")} value={report.totalCashSales} />
          <Stat label={t("cashier.closingReport.cardSales")} value={report.totalCardSales} />
          <Stat label={t("cashier.closingReport.otherSales")} value={report.totalOtherSales} />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-[var(--ink-primary)]">
          {t("cashier.closingReport.cashDrawer")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={t("cashier.closingReport.openingCash")} value={report.openingCashBalance} />
          <Stat label={t("cashier.closingReport.cashIn")} value={report.totalCashIn} />
          <Stat label={t("cashier.closingReport.cashOut")} value={report.totalCashOut} />
          <Stat label={t("cashier.shift.expectedCash")} value={report.expectedClosingCash} />
        </div>
      </div>

      <div className="rounded-lg border border-[var(--hairline)] bg-[var(--sunken)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--ink-secondary)]">{t("cashier.shift.countedCash")}</span>
          <span className="tabular-nums text-[var(--ink-primary)]">
            {report.countedClosingCash != null ? report.countedClosingCash.toFixed(2) : "—"}
          </span>
        </div>
        {discrepancy != null && (
          <div className="mt-2 flex items-center justify-between border-t border-[var(--hairline)] pt-2">
            <span className="text-sm font-semibold text-[var(--ink-primary)]">
              {t("cashier.shift.discrepancy")}
            </span>
            <span
              className={`text-lg font-bold tabular-nums ${
                discrepancy === 0
                  ? "text-[var(--ink-primary)]"
                  : discrepancy > 0
                    ? "text-[var(--success)]"
                    : "text-[var(--error)]"
              }`}
            >
              {discrepancy > 0 ? "+" : ""}
              {discrepancy.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
