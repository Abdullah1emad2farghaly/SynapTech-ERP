// Project path: src/components/admin/journal-entries/DeleteJournalDialog.tsx

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { useDeleteJournalEntry } from "../../../hooks/useJournalEntryMutations";
import type { JournalEntryResponse } from "../../../types/journalEntries.types";

interface DeleteJournalDialogProps {
  entry: JournalEntryResponse | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteJournalDialog({
  entry,
  open,
  onClose,
}: DeleteJournalDialogProps) {
  const { t } = useTranslation();
  const deleteEntry = useDeleteJournalEntry();

  const handleConfirm = async () => {
    if (!entry) return;
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast.success(t("journalEntries.toasts.deleted"));
      onClose();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      tone="destructive"
      title={t("journalEntries.deleteDialog.title")}
      body={t("journalEntries.deleteDialog.body", {
        entryNumber: entry?.entryNumber,
        status: entry?.status,
      })}
      confirmLabel={t("common.actions.delete")}
      cancelLabel={t("common.actions.cancel")}
      isSubmitting={deleteEntry.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
