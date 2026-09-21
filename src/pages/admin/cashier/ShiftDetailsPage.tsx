// Intended project path: src/pages/admin/cashier/ShiftDetailsPage.tsx
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { CASHIER_SHIFT_STATUS_TONE } from "../../../constants/cashierConfig";
import { useShift } from "../../../hooks/useCashier";

// Route: /cashier/shifts/:id — reached by clicking a row in ShiftHistoryTable.
// Distinct from /cashier/shifts/:id/report (ShiftReportPage), which is
// reached via the table's explicit "View Report" button and is only
// meaningful once a shift is actually closed. This page shows the raw
// CashierShiftResponse for ANY shift (open or closed) via GET
// /api/cashier/shifts/{id}; the report link only appears once
// status === "Closed" (literal check, no confirmed status enum).
export const ShiftDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: shift, isLoading, isError } = useShift(id);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-6 w-32 animate-pulse rounded bg-[var(--sunken)]" />
        <div className="h-40 animate-pulse rounded-lg bg-[var(--sunken)]" />
      </div>
    );
  }

  if (isError || !shift) {
    return (
      <div className="p-4 text-sm text-[var(--ink-tertiary)]">
        {t("cashier.shiftDetails.notFound")}
      </div>
    );
  }

  const tone = shift.status ? CASHIER_SHIFT_STATUS_TONE[shift.status] ?? "neutral" : "neutral";
  const isClosed = shift.status === "Closed";

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs text-[var(--ink-tertiary)]">{label}</p>
      <p className="mt-0.5 text-sm font-medium tabular-nums text-[var(--ink-primary)]">{value}</p>
    </div>
  );

  return (
    <div className=" space-y-4 p-4">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate("/cashier/shifts")}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:text-[var(--ink-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </button>
        {isClosed && (
          <button
            type="button"
            onClick={() => navigate(`/cashier/shifts/${shift.id}/report`)}
            className="flex items-center justify-center px-5 gap-1.5 rounded-md bg-[var(--signal)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)]"
          >
            <FileText className="h-4 w-4" />
            {t("cashier.shiftHistory.viewReport")}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[var(--hairline)] bg-[var(--panel)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
              {t("cashier.shift.shiftNumber")}
            </p>
            <p className="mt-0.5 font-mono text-2xl font-semibold text-[var(--ink-primary)]">
              {shift.shiftNumber ?? "—"}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone === "success"
                ? "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
                : "bg-[#da18181d] text-[var(--error)]"
              }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {t(`cashier.status.${shift.status?.toLocaleLowerCase()}`) ?? "—"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label={t("cashier.shift.warehouse")} value={shift.warehouseName ?? "—"} />
          <Field label={t("cashier.shiftHistory.opened")} value={new Date(shift.openedAt).toLocaleString()} />
          <Field
            label={t("cashier.shiftHistory.closed")}
            value={shift.closedAt ? new Date(shift.closedAt).toLocaleString() : "—"}
          />
          <Field label={t("cashier.shift.openingCashBalance")} value={shift.openingCashBalance.toFixed(2)} />
          <Field
            label={t("cashier.shift.expectedCash")}
            value={shift.expectedClosingCash != null ? shift.expectedClosingCash.toFixed(2) : "—"}
          />
          <Field
            label={t("cashier.shift.countedCash")}
            value={shift.countedClosingCash != null ? shift.countedClosingCash.toFixed(2) : "—"}
          />
        </div>
      </div>


    </div>
  );
};
