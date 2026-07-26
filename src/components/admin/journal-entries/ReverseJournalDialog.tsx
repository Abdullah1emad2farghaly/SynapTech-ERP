// Project path: src/components/admin/journal-entries/ReverseJournalDialog.tsx
//
// "Navigate to reversed entry if applicable" — POST /{id}/reverse's confirmed
// return type is the *original* JournalEntryResponse, with no field pointing
// at the newly created reversal entry's id. So after reversing, this stays on
// the current entry rather than guessing a navigation target; flagged as a
// gap once the backend confirms how the new reversal entry's id is surfaced.

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { useReverseJournalEntry } from "../../../hooks/useJournalEntryMutations";
import type { JournalEntryResponse } from "../../../types/journalEntries.types";

interface ReverseJournalDialogProps {
  entry: JournalEntryResponse | null;
  open: boolean;
  onClose: () => void;
}

export function ReverseJournalDialog({
  entry,
  open,
  onClose,
}: ReverseJournalDialogProps) {
  const { t } = useTranslation();
  const reverseEntry = useReverseJournalEntry();

  const handleConfirm = async () => {
    if (!entry) return;
    try {
      await reverseEntry.mutateAsync(entry.id);
      toast.success(t("journalEntries.toasts.reversed"));
      onClose();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      tone="default"
      title={t("journalEntries.reverseDialog.title")}
      body={t("journalEntries.reverseDialog.body", {
        entryNumber: entry?.entryNumber,
      })}
      confirmLabel={t("journalEntries.actions.reverse")}
      cancelLabel={t("common.actions.cancel")}
      isSubmitting={reverseEntry.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
