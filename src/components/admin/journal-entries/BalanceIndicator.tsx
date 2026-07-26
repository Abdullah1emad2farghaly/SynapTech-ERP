// Project path: src/components/admin/journal-entries/BalanceIndicator.tsx

import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface BalanceIndicatorProps {
  totalDebit: number;
  totalCredit: number;
  currencyFormatter?: (value: number) => string;
}

export function BalanceIndicator({
  totalDebit,
  totalCredit,
  currencyFormatter = (v) => v.toFixed(2),
}: BalanceIndicatorProps) {
  const { t } = useTranslation();
  const difference = totalDebit - totalCredit;
  const isBalanced = Math.abs(difference) < 0.005;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${
        isBalanced
          ? "border-[--success]/30 bg-[--success]/5"
          : "border-[--error]/30 bg-[--error]/5"
      }`}
    >
      {isBalanced ? (
        <CheckCircle2 size={20} className="shrink-0 text-[--success]" />
      ) : (
        <AlertTriangle size={20} className="shrink-0 text-[--error]" />
      )}
      <div>
        <p
          className={`text-sm font-medium ${
            isBalanced ? "text-[--success]" : "text-[--error]"
          }`}
        >
          {isBalanced
            ? t("journalEntries.balance.balanced")
            : t("journalEntries.balance.outOfBalance")}
        </p>
        {!isBalanced && (
          <p className="text-xs text-[--ink-secondary]">
            {t("journalEntries.balance.difference")}:{" "}
            {currencyFormatter(Math.abs(difference))}
          </p>
        )}
      </div>
    </div>
  );
}
