// Intended project path: src/components/admin/cashier/PaymentPanel.tsx
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { CASHIER_PAYMENT_METHODS } from "../../../constants/cashierConfig";
import type { CashierPaymentRequest } from "../../../services/api/cashier.api";

interface PaymentPanelProps {
  totalAmount: number;
  payments: CashierPaymentRequest[];
  onChange: (payments: CashierPaymentRequest[]) => void;
}

// Builds CashierPaymentRequest[] directly — one row per payment, supporting
// split payment across methods since the API accepts an array. `method` has
// no documented enum (see constants/cashierConfig.ts).
export const PaymentPanel = ({ totalAmount, payments, onChange }: PaymentPanelProps) => {
  const { t } = useTranslation();

  const amountPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const changeDue = Math.max(0, amountPaid - totalAmount);
  const remaining = Math.max(0, totalAmount - amountPaid);

  const updateRow = (index: number, patch: Partial<CashierPaymentRequest>) => {
    const next = [...payments];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const addRow = () => {
    onChange([
      ...payments,
      { method: CASHIER_PAYMENT_METHODS[0]?.value ?? "Cash", amount: remaining || 0, referenceNumber: null },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(payments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {payments.map((payment, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={payment.method ?? ""}
              onChange={(e) => updateRow(index, { method: e.target.value })}
              className="rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2 py-2 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
            >
              {CASHIER_PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {t(m.labelKey)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              step="0.01"
              value={payment.amount}
              onChange={(e) => updateRow(index, { amount: Number(e.target.value) })}
              className="w-28 rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2 py-2 text-end text-sm tabular-nums text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
            />
            <input
              value={payment.referenceNumber ?? ""}
              onChange={(e) => updateRow(index, { referenceNumber: e.target.value || null })}
              placeholder={t("cashier.payment.referenceOptional")}
              className="min-w-0 flex-1 rounded-md border border-[var(--hairline)] bg-[var(--panel)] px-2 py-2 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--signal)]"
            />
            <button
              type="button"
              aria-label={t("common.remove")}
              onClick={() => removeRow(index)}
              className="p-2 text-[var(--ink-tertiary)] transition hover:text-[var(--error)]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--signal)] transition hover:text-[var(--signal-hover)]"
      >
        <Plus className="h-4 w-4" />
        {t("cashier.payment.addPaymentMethod")}
      </button>

      <div className="flex items-center justify-between rounded-md bg-[var(--sunken)] px-3 py-2 text-sm">
        <span className="text-[var(--ink-secondary)]">
          {remaining > 0 ? t("cashier.payment.remaining") : t("cashier.summary.change")}
        </span>
        <span
          className={`font-semibold tabular-nums ${
            remaining > 0 ? "text-[var(--error)]" : "text-[var(--success)]"
          }`}
        >
          {(remaining > 0 ? remaining : changeDue).toFixed(2)}
        </span>
      </div>
    </div>
  );
};
