// Project path: src/components/admin/journal-entries/JournalLineRow.tsx
//
// Tab order follows DOM order naturally (Account -> Description -> Debit ->
// Credit -> Remove); no custom keyboard-shortcut/drag-reorder layer was built —
// flagged as a scope trim against the brief's "optional" drag-and-drop ask.

import { useTranslation } from "react-i18next";
import { Copy, Trash2 } from "lucide-react";
import { AccountSelector } from "./AccountSelector";

interface JournalLineRowProps {
  index: number;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
  onChange: (
    index: number,
    field: "accountId" | "description" | "debit" | "credit",
    value: string | number
  ) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  canRemove: boolean;
}

export function JournalLineRow({
  index,
  accountId,
  description,
  debit,
  credit,
  onChange,
  onRemove,
  onDuplicate,
  canRemove,
}: JournalLineRowProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-2 rounded-lg border border-[--hairline] p-3 sm:grid-cols-[2fr_2fr_1fr_1fr_auto]">
      <AccountSelector
        value={accountId}
        onChange={(value) => onChange(index, "accountId", value)}
      />
      <input
        type="text"
        value={description}
        onChange={(e) => onChange(index, "description", e.target.value)}
        placeholder={t("journalEntries.lines.descriptionPlaceholder")}
        className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
      />
      <input
        type="number"
        min={0}
        step="0.01"
        value={debit || ""}
        onChange={(e) => onChange(index, "debit", Number(e.target.value))}
        placeholder={t("journalEntries.lines.debit")}
        className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
      />
      <input
        type="number"
        min={0}
        step="0.01"
        value={credit || ""}
        onChange={(e) => onChange(index, "credit", Number(e.target.value))}
        placeholder={t("journalEntries.lines.credit")}
        className="rounded-md border border-[--hairline] bg-[--sunken] px-2.5 py-2 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
      />
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          title={t("journalEntries.lines.duplicateRow")}
          onClick={() => onDuplicate(index)}
          className="rounded-md p-2 text-[--ink-secondary] hover:bg-[--sunken]"
        >
          <Copy size={15} />
        </button>
        <button
          type="button"
          title={t("journalEntries.lines.removeRow")}
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className="rounded-md p-2 text-[--error] hover:bg-[--sunken] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
