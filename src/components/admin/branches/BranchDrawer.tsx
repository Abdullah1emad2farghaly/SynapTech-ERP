// src/components/admin/branches/BranchDrawer.tsx
//
// Single component serving Create, Edit, and Duplicate — same one-drawer
// pattern as DepartmentDrawer. Mirrors the confirmed payloads exactly:
//   POST /api/Branches { name, code, address, phone, isMain }
//   PUT  /api/Branches/{id} { name, code, address, phone, isMain, isActive }
// Create has no isActive field, matching the API; Edit adds it.
//
// Main Branch toggle copy stays deliberately neutral ("Set as Main
// Branch") rather than promising an exclusivity behavior ("this replaces
// X's Main status") the backend hasn't confirmed it enforces — see the
// design doc's flagged assumption on this.
//
// Duplicate resets code to blank (forcing a deliberate new value rather
// than risking a silent uniqueness collision) and isMain to false
// (two branches both claiming Main is wrong under any exclusivity model).

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";

export interface BranchFormValues {
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
  isActive: boolean;
}

export interface BranchDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Presence of this (with an id) puts the drawer in Edit mode. */
  initialValues?: (BranchFormValues & { id: string }) | null;
  /** Prefills Duplicate — same shape as initialValues but no id. */
  duplicateFrom?: BranchFormValues | null;
  /** Whether another branch already has isMain: true, to inform (not promise) the toggle's helper copy. */
  anotherBranchIsMain?: { name: string } | null;
  onSubmit: (values: BranchFormValues, id?: string) => Promise<void>;
  serverError?: { field?: "name" | "code"; messageKey: string } | null;
}

const EMPTY_VALUES: BranchFormValues = {
  name: "",
  code: "",
  address: "",
  phone: "",
  isMain: false,
  isActive: true,
};

export function BranchDrawer({
  open,
  onClose,
  initialValues,
  duplicateFrom,
  anotherBranchIsMain,
  onSubmit,
  serverError,
}: BranchDrawerProps) {
  const { t } = useTranslation();
  const isEditMode = !!initialValues;

  const [values, setValues] = useState<BranchFormValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState<{ name?: boolean; code?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setValues(initialValues);
    } else if (duplicateFrom) {
      setValues({
        ...duplicateFrom,
        name: t("departments.duplicate.copySuffix", { name: duplicateFrom.name }),
        code: "",
        isMain: false,
      });
    } else {
      setValues(EMPTY_VALUES);
    }
    setTouched({});
  }, [open, initialValues, duplicateFrom, t]);

  const nameError = touched.name && values.name.trim().length === 0;
  const codeError = touched.code && values.code.trim().length === 0;
  const isValid = values.name.trim().length > 0 && values.code.trim().length > 0;

  function handleClose() {
    setValues(EMPTY_VALUES);
    setTouched({});
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, code: true });
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values, initialValues?.id);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={isEditMode ? t("branches.create.editTitle") : t("branches.create.title")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
            {t("branches.create.fields.name")}
          </label>
          <input
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            onBlur={() => setTouched((tt) => ({ ...tt, name: true }))}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
          {nameError && (
            <p className="mt-1 text-xs text-[var(--error)]">{t("branches.create.errors.required")}</p>
          )}
          {serverError?.field === "name" && (
            <p className="mt-1 text-xs text-[var(--error)]">{t(serverError.messageKey)}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
            {t("branches.create.fields.code")}
          </label>
          <input
            value={values.code}
            onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
            onBlur={() => setTouched((tt) => ({ ...tt, code: true }))}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 font-mono text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
          {codeError && (
            <p className="mt-1 text-xs text-[var(--error)]">{t("branches.create.errors.required")}</p>
          )}
          {serverError?.field === "code" && (
            <p className="mt-1 text-xs text-[var(--error)]">{t(serverError.messageKey)}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
            {t("branches.create.fields.address")}
          </label>
          <input
            value={values.address || ''}
            onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
            {t("branches.create.fields.phone")}
          </label>
          <input
            type="tel"
            dir="ltr"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-start text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
        </div>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={values.isMain}
            onChange={(e) => setValues((v) => ({ ...v, isMain: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded-[4px] border-[var(--hairline)]"
          />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-[var(--ink-primary)]">
              {t("branches.create.fields.isMain")}
            </span>
            {values.isMain && anotherBranchIsMain && (
              <span className="text-xs text-[var(--ink-tertiary)]">
                {t("branches.create.fields.isMainHint", { name: anotherBranchIsMain.name })}
              </span>
            )}
          </span>
        </label>

        {isEditMode && (
          <label className="flex items-center gap-2 text-sm text-[var(--ink-primary)]">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
              className="h-4 w-4 rounded-[4px] border-[var(--hairline)]"
            />
            {t("users.status.active")}
          </label>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t("users.actions.cancel")}
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? t("branches.create.submitting")
              : isEditMode
                ? t("users.actions.save")
                : t("branches.list.createBranch")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
