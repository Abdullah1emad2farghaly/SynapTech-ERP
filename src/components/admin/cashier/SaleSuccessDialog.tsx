// Intended project path: src/components/admin/cashier/SaleSuccessDialog.tsx
import { useTranslation } from "react-i18next";
import { CheckCircle2, Receipt, TriangleAlert } from "lucide-react";
import type { CashierOrderResponse } from "../../../services/api/cashier.api";

interface SaleSuccessDialogProps {
  order: CashierOrderResponse;
  onNewSale: () => void;
  onViewInvoice: () => void;
}

// Renders only real response fields — orderNumber, invoiceId/invoiceNumber,
// totalAmount, changeDue, warnings. No PDF/print/receipt API exists, so
// "View Invoice" routes to the in-app invoice screen, not a print action.
export const SaleSuccessDialog = ({ order, onNewSale, onViewInvoice }: SaleSuccessDialogProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,transparent)]">
        <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--ink-primary)]">
          {t("cashier.success.title")}
        </h2>
        <p className="mt-1 font-mono text-sm text-[var(--ink-tertiary)]">
          {order.orderNumber ?? "—"}
        </p>
      </div>

      <div className="w-full space-y-1 rounded-lg bg-[var(--sunken)] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--ink-secondary)]">{t("cashier.summary.total")}</span>
          <span className="font-semibold tabular-nums text-[var(--ink-primary)]">
            {order.totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--ink-secondary)]">{t("cashier.summary.change")}</span>
          <span className="font-semibold tabular-nums text-[var(--success)]">
            {order.changeDue.toFixed(2)}
          </span>
        </div>
        {order.invoiceNumber && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--ink-secondary)]">{t("cashier.invoice.number")}</span>
            <span className="font-mono text-[var(--ink-primary)]">{order.invoiceNumber}</span>
          </div>
        )}
      </div>

      {order.warnings && order.warnings.length > 0 && (
        <div className="w-full space-y-1.5 rounded-lg border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-3 text-start">
          {order.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink-primary)]">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex w-full gap-2 pt-2">
        {order.invoiceId && (
          <button
            type="button"
            onClick={onViewInvoice}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--hairline)] px-4 py-2.5 text-sm font-medium text-[var(--ink-secondary)] transition hover:border-[var(--signal)] hover:text-[var(--ink-primary)]"
          >
            <Receipt className="h-4 w-4" />
            {t("cashier.success.viewInvoice")}
          </button>
        )}
        <button
          type="button"
          onClick={onNewSale}
          className="flex-1 rounded-md bg-[var(--signal)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--signal-hover)]"
        >
          {t("cashier.success.newSale")}
        </button>
      </div>
    </div>
  );
};
