// Intended project path: src/components/admin/cashier/FinancialSummary.tsx
import { useTranslation } from "react-i18next";

interface FinancialSummaryProps {
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid?: number;
  changeDue?: number;
}

// Uses only the exact backend fields (subTotal, discountAmount, taxAmount,
// totalAmount, changeDue) — amountPaid is either a real invoice field or a
// frontend running total of the payments being entered on the POS.
export const FinancialSummary = ({
  subTotal,
  discountAmount,
  taxAmount,
  totalAmount,
  amountPaid,
  changeDue,
}: FinancialSummaryProps) => {
  const { t } = useTranslation();

  const Row = ({ label, value, muted }: { label: string; value: number; muted?: boolean }) => (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={muted ? "text-[var(--ink-tertiary)]" : "text-[var(--ink-secondary)]"}>
        {label}
      </span>
      <span className="tabular-nums text-[var(--ink-primary)]">{value.toFixed(2)}</span>
    </div>
  );

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-4">
      <Row label={t("cashier.summary.subTotal")} value={subTotal} muted />
      <Row label={t("cashier.summary.discount")} value={-discountAmount} muted />
      <Row label={t("cashier.summary.tax")} value={taxAmount} muted />

      <div className="my-2 h-px bg-[var(--hairline)]" />

      <div className="flex items-center justify-between py-1">
        <span className="text-base font-semibold text-[var(--ink-primary)]">
          {t("cashier.summary.total")}
        </span>
        <span className="text-xl font-bold tabular-nums text-[var(--signal)]">
          {totalAmount.toFixed(2)}
        </span>
      </div>

      {typeof amountPaid === "number" && (
        <Row label={t("cashier.summary.paid")} value={amountPaid} />
      )}
      {typeof changeDue === "number" && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium text-[var(--ink-secondary)]">
            {t("cashier.summary.change")}
          </span>
          <span className="text-base font-semibold tabular-nums text-[var(--success)]">
            {changeDue.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};
