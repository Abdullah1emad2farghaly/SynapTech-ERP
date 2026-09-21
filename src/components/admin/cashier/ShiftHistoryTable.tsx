// Intended project path: src/components/admin/cashier/ShiftHistoryTable.tsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { FileText } from "lucide-react";
import { CASHIER_SHIFT_STATUS_TONE } from "../../../constants/cashierConfig";
import type { CashierShiftResponse } from "../../../services/api/cashier.api";

interface ShiftHistoryTableProps {
  shifts: CashierShiftResponse[];
  isLoading: boolean;
}

// Two distinct destinations: clicking anywhere on a row goes to the shift
// DETAILS page (/cashier/shifts/:id, any shift, open or closed); the
// "View Report" button goes one level deeper to the closing REPORT
// (/cashier/shifts/:id/report), gated to status === "Closed" (literal
// check, no confirmed enum) since expected/counted-cash figures don't mean
// anything until a shift has actually been closed. The button stops event
// propagation so it doesn't also trigger the row's own navigation.
export const ShiftHistoryTable = ({ shifts, isLoading }: ShiftHistoryTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-[var(--sunken)]" />
        ))}
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--hairline)] py-16 text-center text-[var(--ink-tertiary)]">
        <p className="text-sm">{t("cashier.shiftHistory.empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--hairline)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--hairline)] bg-[var(--sunken)] text-xs text-[var(--ink-tertiary)]">
          <tr>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.shift.shiftNumber")}</th>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.shift.warehouse")}</th>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.shiftHistory.opened")}</th>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.shiftHistory.closed")}</th>
            <th className="px-4 py-3 text-start font-medium">{t("cashier.orders.status")}</th>
            <th className="px-4 py-3 text-end font-medium">{t("cashier.shift.discrepancy")}</th>
            <th className="px-4 py-3 text-end font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--hairline)]">
          {shifts.map((shift) => {
            const tone = shift.status ? CASHIER_SHIFT_STATUS_TONE[shift.status] ?? "neutral" : "neutral";
            const isClosed = shift.status === "Closed";
            return (
              <tr
                key={shift.id}
                onClick={() => navigate(`/cashier/shifts/${shift.id}`)}
                className="cursor-pointer transition hover:bg-[var(--sunken)]"
              >
                <td className="px-4 py-3 font-mono text-[var(--ink-primary)]">
                  {shift.shiftNumber ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--ink-secondary)]">
                  {shift.warehouseName ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--ink-secondary)]">
                  {new Date(shift.openedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-[var(--ink-secondary)]">
                  {shift.closedAt ? new Date(shift.closedAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      tone === "success"
                        ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
                        : "bg-[#da18181d] text-[var(--error)]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {t(`cashier.status.${shift.status?.toLocaleLowerCase()}`) ?? "—"}
                  </span>
                </td>
                <td className={`px-4 py-3 text-end tabular-nums ${shift?.discrepancyAmount?.toFixed(2) != null && shift.discrepancyAmount > 0 ? "text-[var(--warning)]" : shift?.discrepancyAmount?.toFixed(2) != null && shift.discrepancyAmount < 0 ? "text-[var(--error)]" : "text-[var(--success)]"}`}>
                  {shift.discrepancyAmount != null ? shift.discrepancyAmount.toFixed(2) : "—"}
                </td>
                <td className="px-4 py-3 text-end">
                  {isClosed ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/cashier/shifts/${shift.id}/report`);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--hairline)] px-2.5 py-1 text-xs font-medium text-[var(--ink-secondary)] transition hover:border-[var(--signal)] hover:text-[var(--ink-primary)]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {t("cashier.shiftHistory.viewReport")}
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--ink-tertiary)]">
                      {t("cashier.shiftHistory.reportUnavailable")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
