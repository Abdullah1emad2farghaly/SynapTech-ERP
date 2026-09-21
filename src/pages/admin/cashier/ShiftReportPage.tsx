// Intended project path: src/pages/admin/cashier/ShiftReportPage.tsx
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { ClosingReportView } from "../../../components/admin/cashier/ClosingReportView";
import { useShift, useShiftClosingReport } from "../../../hooks/useCashier";

// This replaces the id-branch that previously lived inside ShiftHistoryPage
// — a dedicated route/page rather than a conditional render, per request.
// Route: /cashier/shifts/:id (see routes-snippet.tsx for the App.tsx wiring
// change). ShiftHistoryTable's "View Report" button links here directly,
// only for shifts whose status is the literal string "Closed" — a report
// technically exists for any shift id via GET /shifts/{id}/closing-report,
// but expectedClosingCash/countedClosingCash only mean something once a
// shift has actually been closed, so the entry point is gated there.
//
// Printing: uses the same "hide everything except this subtree" CSS trick
// as InvoiceView.tsx — window.print() on the whole document would also
// print the sidebar/navbar/back-and-print buttons, so #shift-report-print
// is the only thing left visible in the print stylesheet below.
export const ShiftReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: shift } = useShift(id);
  const { data: report, isLoading, isError } = useShiftClosingReport(id);

  const handlePrint = () => window.print();

  return (
    <div className="p-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #shift-report-print, #shift-report-print * { visibility: visible; }
          #shift-report-print {
            position: absolute;
            inset: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
          }
        }
      `}</style>

      <div className="mb-4 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate("/cashier/shifts")}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:text-[var(--ink-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </button>

        {report && (
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-md border border-[var(--hairline)] px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:border-[var(--signal)] hover:text-[var(--ink-primary)]"
          >
            <Printer className="h-4 w-4" />
            {t("common.print")}
          </button>
        )}
      </div>

      <div id="shift-report-print" className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-[var(--ink-primary)]">
            {t("cashier.shiftReport.title")}
          </h1>
          {shift?.warehouseName && (
            <p className="mt-0.5 text-sm text-[var(--ink-tertiary)]">
              {t("cashier.shift.warehouse")}: {shift.warehouseName}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-[var(--sunken)]" />
            ))}
          </div>
        ) : isError || !report ? (
          <div className="rounded-lg border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_8%,transparent)] p-4 text-sm text-[var(--error)]">
            {t("cashier.shiftReport.loadError")}
          </div>
        ) : (
          <ClosingReportView report={report} />
        )}
      </div>
    </div>
  );
};
