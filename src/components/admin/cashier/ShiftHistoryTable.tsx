// Intended project path: src/components/admin/cashier/ShiftHistoryTable.tsx
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { CASHIER_SHIFT_STATUS_TONE } from "../../../constants/cashierConfig";
import type { CashierShiftResponse } from "../../../services/api/cashier.api";

interface ShiftHistoryTableProps {
  shifts: CashierShiftResponse[];
  isLoading: boolean;
}

// GET /api/cashier/shifts/my-history — no documented filters/stats, so this
// stays a plain scan-friendly list, same precedent as the orders table.
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
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--hairline)]">
          {shifts.map((shift) => {
            const tone = shift.status ? CASHIER_SHIFT_STATUS_TONE[shift.status] ?? "neutral" : "neutral";
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
                        : "bg-[var(--sunken)] text-[var(--ink-secondary)]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {shift.status ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-end tabular-nums">
                  {shift.discrepancyAmount != null ? shift.discrepancyAmount.toFixed(2) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
