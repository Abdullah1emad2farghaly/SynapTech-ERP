// src/components/admin/accounts/AccountDeleteDialog.tsx
//
// Two delete flows selected by the caller (based on whether the account
// has a non-zero balance or has children), per the design doc:
//   - Standard: ConfirmationDialog as-is, same as every other module.
//   - Typed confirmation: requires typing the account's CODE before the
//     confirm button enables — reserved specifically for accounts with
//     real financial activity, an objective data-backed definition of
//     "important account" rather than a blanket typed-confirmation on
//     every delete.
// Blocked (has children) is handled by the caller disabling the trigger
// entirely before this dialog ever opens — this component only handles
// the two delete-confirmation variants, not the blocked state itself.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";

export interface AccountDeleteDialogProps {
  open: boolean;
  accountName: string;
  accountCode: string;
  /** true if totalDebit, totalCredit, or balance is non-zero — determines which flow renders. */
  requiresTypedConfirmation: boolean;
  isSubmitting?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function AccountDeleteDialog({
  open,
  accountName,
  accountCode,
  requiresTypedConfirmation,
  isSubmitting,
  onConfirm,
  onCancel,
}: AccountDeleteDialogProps) {
  const { t } = useTranslation();
  const [typedValue, setTypedValue] = useState("");

  useEffect(() => {
    if (!open) setTypedValue("");
  }, [open]);

  if (!requiresTypedConfirmation) {
    return (
      <ConfirmationDialog
        open={open}
        tone="destructive"
        title={t("accounts.dialogs.delete.title")}
        body={t("accounts.dialogs.delete.body", { name: accountName })}
        confirmLabel={t("accounts.actions.delete")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isSubmitting}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
  }

  // Typed-confirmation variant isn't a plain ConfirmationDialog instance
  // (that shell has no input field), so it's built directly here using
  // the same visual language, rather than stretching ConfirmationDialog's
  // API to support an optional embedded input for this one caller.
  if (!open) return null;

  const isMatch = typedValue.trim() === accountCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={isSubmitting ? undefined : onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5 shadow-[var(--elevation-1)]"
      >
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">
          {t("accounts.dialogs.delete.title")}
        </h2>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">
          {t("accounts.dialogs.delete.body", { name: accountName })}
        </p>
        <p className="mt-2 text-sm text-[var(--warning)]">
          {t("accounts.dialogs.delete.hasBalanceWarning")}
        </p>

        <label className="mt-4 block text-xs font-medium text-[var(--ink-secondary)]">
          {t("accounts.dialogs.delete.typedConfirmLabel", { code: accountCode })}
        </label>
        <input
          value={typedValue}
          onChange={(e) => setTypedValue(e.target.value)}
          placeholder={t("accounts.dialogs.delete.typedConfirmPlaceholder")}
          className="mt-1.5 w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 font-mono text-sm text-[var(--ink-primary)] focus:border-[var(--error)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]/30"
          aria-invalid={typedValue.length > 0 && !isMatch}
        />
        {typedValue.length > 0 && !isMatch && (
          <p className="mt-1 text-xs text-[var(--error)]" aria-live="polite">
            {t("accounts.dialogs.delete.typedConfirmMismatch")}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("users.actions.cancel")}
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={!isMatch || isSubmitting}
            className="rounded-[10px] bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--error)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("accounts.actions.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
