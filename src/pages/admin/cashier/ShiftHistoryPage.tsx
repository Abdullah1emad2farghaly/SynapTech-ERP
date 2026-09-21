// Intended project path: src/pages/admin/cashier/ShiftHistoryPage.tsx
import { useTranslation } from "react-i18next";
import { ShiftHistoryTable } from "../../../components/admin/cashier/ShiftHistoryTable";
import { useMyShiftHistory } from "../../../hooks/useCashier";

// Previously this page also handled /cashier/shifts/:id (the closing
// report) via a conditional branch on the route param. That's now a
// dedicated page, ShiftReportPage.tsx, reachable from the table's "View
// Report" button — see routes-snippet.tsx for the route change.
export const ShiftHistoryPage = () => {
  const { t } = useTranslation();
  const { data: shifts = [], isLoading } = useMyShiftHistory();

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--ink-primary)]">
          {t("cashier.shiftHistory.title")}
        </h1>
        <p className="text-sm text-[var(--ink-tertiary)]">{t("cashier.shiftHistory.subtitle")}</p>
      </div>
      <ShiftHistoryTable shifts={shifts} isLoading={isLoading} />
    </div>
  );
};
