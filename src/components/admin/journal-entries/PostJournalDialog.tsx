// Project path: src/components/admin/journal-entries/PostJournalDialog.tsx

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { usePostJournalEntry } from "../../../hooks/useJournalEntryMutations";
import type { JournalEntryResponse } from "../../../types/journalEntries.types";

interface PostJournalDialogProps {
  entry: JournalEntryResponse | null;
  open: boolean;
  onClose: () => void;
}

export function PostJournalDialog({
  entry,
  open,
  onClose,
}: PostJournalDialogProps) {
  const { t } = useTranslation();
  const postEntry = usePostJournalEntry();

  const handleConfirm = async () => {
    if (!entry) return;
    try {
      await postEntry.mutateAsync(entry.id);
      toast.success(t("journalEntries.toasts.posted"));
      onClose();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      tone="default"
      title={t("journalEntries.postDialog.title")}
      body={t("journalEntries.postDialog.body", {
        entryNumber: entry?.entryNumber,
      })}
      confirmLabel={t("journalEntries.actions.post")}
      cancelLabel={t("common.actions.cancel")}
      isSubmitting={postEntry.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
