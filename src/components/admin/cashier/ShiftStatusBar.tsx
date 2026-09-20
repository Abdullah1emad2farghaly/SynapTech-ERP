// Intended project path: src/components/admin/cashier/ShiftStatusBar.tsx
import { useTranslation } from "react-i18next";
import { Clock, Wallet } from "lucide-react";
import type { CashierShiftResponse } from "../../../services/api/cashier.api";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

interface ShiftStatusBarProps {
  shift: CashierShiftResponse;
  onAddCashMovement: () => void;
  onCloseShift: () => void;
}

export const ShiftStatusBar = ({ shift, onAddCashMovement, onCloseShift }: ShiftStatusBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--hairline)] bg-[var(--panel)] px-4 py-3">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-xs text-[var(--ink-tertiary)]">{t("cashier.shift.shiftNumber")}</p>
          <p className="font-mono text-sm font-medium text-[var(--ink-primary)]">
            {shift.shiftNumber ?? "—"}
          </p>
        </div>
        <div className="hidden items-center gap-1.5 text-sm text-[var(--ink-secondary)] sm:flex">
          <Clock className="h-4 w-4" />
          {new Date(shift.openedAt).toLocaleTimeString()}
        </div>
        <div className="hidden items-center gap-1.5 text-sm text-[var(--ink-secondary)] sm:flex">
          <Wallet className="h-4 w-4" />
          {shift.openingCashBalance.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {
          hasAnyPermission(["cashier.shifts.cashmovement"], getUserPermissions()) && (
            <button
              type="button"
              onClick={onAddCashMovement}
              className="rounded-md border border-[var(--hairline)] px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:border-[var(--signal)] hover:text-[var(--ink-primary)]"
            >
              {t("cashier.shift.cashMovement")}
            </button>)
        }
        {
          hasAnyPermission(["cashier.shifts.close"], getUserPermissions()) && (
            <button
              type="button"
              onClick={onCloseShift}
              className="rounded-md border border-[var(--hairline)] px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:border-[var(--error)] hover:text-[var(--error)]"
            >
              {t("cashier.shift.closeShift")}
            </button>)
        }
      </div>
    </div>
  );
};
