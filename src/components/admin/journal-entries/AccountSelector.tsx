// Project path: src/components/admin/journal-entries/AccountSelector.tsx
//
// Consumes the unconfirmed accounts.lookup.api.ts / useAccountsLookup. Once
// the real Accounts endpoint is confirmed, only that hook/service need to change.

import { useTranslation } from "react-i18next";
import { useAccountsLookup } from "../../../hooks/useJournalEntries";

interface AccountSelectorProps {
  value: string;
  onChange: (accountId: string) => void;
  hasError?: boolean;
}

export function AccountSelector({
  value,
  onChange,
  hasError,
}: AccountSelectorProps) {
  const { t } = useTranslation();
  const { data: accounts = [], isLoading } = useAccountsLookup();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      className={`w-full rounded-md border bg-[--sunken] px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[--synapse]/30 ${
        hasError ? "border-[--error]" : "border-[--hairline] focus:border-[--signal]"
      }`}
    >
      <option value="">
        {isLoading
          ? t("journalEntries.lines.loadingAccounts")
          : t("journalEntries.lines.selectAccount")}
      </option>
      {accounts.map((account) => (
        <option key={account.id} value={account.id}>
          {account.code} — {account.name}
        </option>
      ))}
    </select>
  );
}
