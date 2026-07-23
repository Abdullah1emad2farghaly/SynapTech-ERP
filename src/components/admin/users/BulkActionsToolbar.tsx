// src/components/admin/users/BulkActionsToolbar.tsx
//
// Appears once rows are selected in UsersDataTable. Only offers bulk
// Deactivate — per the module design doc, that's the only bulk action the
// current API set can honestly support (N sequential PUT calls). Bulk
// Delete and bulk Role Assignment are deliberately not offered here.
//
// Deactivating in bulk still goes through a single ConfirmationDialog
// (not one per user) naming the count, consistent with the "deactivate is
// access-revoking, so it's confirmed" rule applied once for the batch.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";

export interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  /** Should deactivate every selected user (parent loops the PUT calls) and resolve/reject. */
  onDeactivateSelected: () => Promise<void>;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onDeactivateSelected,
}: BulkActionsToolbarProps) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (selectedCount === 0) return null;

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onDeactivateSelected();
      toast.success(t("users.bulk.deactivateSuccess", { count: selectedCount }));
      setConfirmOpen(false);
      onClearSelection();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-[10px] border border-[var(--hairline)] bg-[var(--sunken)] px-4 py-2.5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClearSelection}
          aria-label={t("users.actions.cancel")}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-secondary)] hover:bg-[var(--panel)]"
        >
          <X size={14} />
        </button>
        <span className="text-sm font-medium text-[var(--ink-primary)]">
          {t("users.bulk.selectedCount", { count: selectedCount })}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="rounded-[10px] px-3 py-1.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--panel)]"
      >
        {t("users.bulk.deactivateSelected")}
      </button>

      <ConfirmationDialog
        open={confirmOpen}
        tone="neutral"
        title={t("users.bulk.deactivateTitle", { count: selectedCount })}
        body={t("users.dialogs.deactivate.body")}
        confirmLabel={t("users.actions.deactivate")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
