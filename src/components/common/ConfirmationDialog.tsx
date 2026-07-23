// src/components/common/ConfirmationDialog.tsx
//
// Generic confirmation dialog shell, reserved for irreversible or
// access-revoking actions only (Delete, Deactivate, Lock, Reset
// Password) — reversible actions (Activate, Unlock) skip this entirely
// and go instant + toast, per the system's confirmation-fatigue rule.
//
// Every specific confirmation in the product (Deactivate User, Delete
// User, bulk Deactivate, etc.) is an instance of this shell with its own
// copy — never a bespoke dialog implementation.
//
// Accessibility: focus lands on Cancel when the dialog opens, never on
// the (potentially destructive) Confirm button, so an accidental Enter
// press can't trigger the action. Focus is trapped while open and
// returned to the triggering element on close.

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type ConfirmationDialogTone = "neutral" | "destructive";

export interface ConfirmationDialogProps {
  open: boolean;
  tone: ConfirmationDialogTone;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  tone,
  title,
  body,
  confirmLabel,
  cancelLabel,
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Focus management: land on Cancel on open, restore the triggering
  // element's focus on close.
  useEffect(() => {
    if (open) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Defer to the next tick so the button exists in the DOM to focus.
      const id = requestAnimationFrame(() => cancelButtonRef.current?.focus());
      return () => cancelAnimationFrame(id);
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [open]);

  // Escape to cancel, and a basic focus trap within the dialog.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmButtonColorClasses =
    tone === "destructive"
      ? "bg-[var(--error)] hover:bg-[var(--error)]/90"
      : "bg-[var(--signal)] hover:bg-[var(--signal-hover)]";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={isSubmitting ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-body"
        className="relative z-10 w-full max-w-sm rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5 shadow-[var(--elevation-1)] transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <h2
          id="confirmation-dialog-title"
          className="text-base font-semibold text-[var(--ink-primary)]"
        >
          {title}
        </h2>
        <p id="confirmation-dialog-body" className="mt-2 text-sm text-[var(--ink-secondary)]">
          {body}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${confirmButtonColorClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
