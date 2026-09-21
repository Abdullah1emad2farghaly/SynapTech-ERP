// Intended project path: src/pages/admin/cashier/ShiftHistoryPage.tsx
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ShiftHistoryTable } from "../../../components/admin/cashier/ShiftHistoryTable";
import { ClosingReportView } from "../../../components/admin/cashier/ClosingReportView";
import { useMyShiftHistory, useShift, useShiftClosingReport } from "../../../hooks/useCashier";

// Two views in one page: the list (GET /shifts/my-history) and, when a
// shift id is present in the route, that shift's closing report
// (GET /shifts/{id}/closing-report) + GET /shifts/{id} for header info.
export const ShiftHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: shifts = [], isLoading: shiftsLoading } = useMyShiftHistory();
  const { data: shift } = useShift(id);
  const { data: report, isLoading: reportLoading } = useShiftClosingReport(id);

  console.log(report)
  if (id) {
    return (
      <div className="space-y-4 p-4">
        <button
          type="button"
          onClick={() => navigate("/cashier/shifts")}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:text-[var(--ink-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </button>

        {reportLoading || !report ? (
          <div className="h-32 animate-pulse rounded-md bg-[var(--sunken)]" />
        ) : (
          <ClosingReportView report={report} />
        )}

        {shift?.warehouseName && (
          <p className="text-xs text-[var(--ink-tertiary)]">
            {t("cashier.shift.warehouse")}: {shift.warehouseName}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--ink-primary)]">
          {t("cashier.shiftHistory.title")}
        </h1>
        <p className="text-sm text-[var(--ink-tertiary)]">{t("cashier.shiftHistory.subtitle")}</p>
      </div>
      <ShiftHistoryTable shifts={shifts} isLoading={shiftsLoading} />
    </div>
  );
};
