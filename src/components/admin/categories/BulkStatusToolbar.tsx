// src/components/admin/categories/BulkStatusToolbar.tsx
//
// Appears once rows are selected in CategoriesTable (Table view only —
// the tree doesn't support multi-select). Offers Activate and Deactivate
// only — no Bulk Delete, same stance as every prior module's bulk-action
// decisions. Deactivating in bulk still goes through a single
// ConfirmationDialog naming the count, not one per category; Activating
// in bulk is instant + toast, matching the single-item convention.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export interface BulkStatusToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onActivateSelected: () => Promise<void>;
  onDeactivateSelected: () => Promise<void>;
}

export function BulkStatusToolbar({
  selectedCount,
  onClearSelection,
  onActivateSelected,
  onDeactivateSelected,
}: BulkStatusToolbarProps) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (selectedCount === 0) return null;

  async function handleActivate() {
    try {
      await onActivateSelected();
      toast.success(t("categories.bulk.activateSuccess", { count: selectedCount }));
      onClearSelection();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors)
      }
    }
  }

  async function handleDeactivateConfirm() {
    setIsSubmitting(true);
    try {
      await onDeactivateSelected();
      toast.success(t("categories.bulk.deactivateSuccess", { count: selectedCount }));
      setConfirmOpen(false);
      onClearSelection();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors)
      }
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
          {t("categories.bulk.selectedCount", { count: selectedCount })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleActivate}
          className="rounded-[10px] px-3 py-1.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--panel)]"
        >
          {t("categories.bulk.activateSelected")}
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-[10px] px-3 py-1.5 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--panel)]"
        >
          {t("categories.bulk.deactivateSelected")}
        </button>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        tone="neutral"
        title={t("categories.bulk.deactivateTitle", { count: selectedCount })}
        body={t("categories.dialogs.deactivate.body")}
        confirmLabel={t("categories.actions.deactivate")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
