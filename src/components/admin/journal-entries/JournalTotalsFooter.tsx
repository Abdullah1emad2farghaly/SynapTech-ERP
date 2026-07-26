// Project path: src/components/admin/journal-entries/JournalTotalsFooter.tsx

import { useTranslation } from "react-i18next";
import { BalanceIndicator } from "./BalanceIndicator";

interface JournalTotalsFooterProps {
  totalDebit: number;
  totalCredit: number;
}

export function JournalTotalsFooter({
  totalDebit,
  totalCredit,
}: JournalTotalsFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[--hairline] bg-[--panel] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-6 text-sm">
        <div>
          <p className="text-[--ink-tertiary]">{t("journalEntries.totals.debit")}</p>
          <p className="font-semibold text-[--ink-primary]">{totalDebit.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[--ink-tertiary]">{t("journalEntries.totals.credit")}</p>
          <p className="font-semibold text-[--ink-primary]">{totalCredit.toFixed(2)}</p>
        </div>
      </div>
      <BalanceIndicator totalDebit={totalDebit} totalCredit={totalCredit} />
    </div>
  );
}
