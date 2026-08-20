// src/components/admin/departments/DepartmentDrawer.tsx
//
// Single component serving both Create and Edit.
//
// Validation:
//   - name is required.
//   - branchId is optional and is sent as null when empty.
//   - parentDepartmentId is optional and is sent as null when empty.
//   - isActive is only included/used in Edit mode.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import {
  TreeSelect,
  getSelfAndDescendantIds,
  type TreeSelectNode,
} from "../../common/TreeSelect";
import type { MultiSelectOption } from "../../common/MultiSelectSearchable";
import Optional from "@/components/common/Optional";

export interface DepartmentFormValues {
  name: string;
  branchId: string | null;
  parentDepartmentId: string | null;
  isActive: boolean;
}

export interface DepartmentDrawerProps {
  open: boolean;
  onClose: () => void;

  /** Presence of this (with an id) puts the drawer in Edit mode. */
  initialValues?: (DepartmentFormValues & { id: string }) | null;

  /** Prefills Duplicate — no id, so Save creates a new record. */
  duplicateFrom?: DepartmentFormValues | null;

  branchOptions: MultiSelectOption[];

  /** Full flat department list, used to build the parent tree-select and exclude self/descendants. */
  allDepartments: TreeSelectNode[];

  onSubmit: (values: DepartmentFormValues, id?: string) => Promise<void>;

  serverError?: {
    field?: "name";
    messageKey: string;
  } | null;
}

const EMPTY_VALUES: DepartmentFormValues = {
  name: "",
  branchId: null,
  parentDepartmentId: null,
  isActive: true,
};

export function DepartmentDrawer({
  open,
  onClose,
  initialValues,
  duplicateFrom,
  branchOptions,
  allDepartments,
  onSubmit,
  serverError,
}: DepartmentDrawerProps) {
  const { t } = useTranslation();

  const isEditMode = !!initialValues;

  const [values, setValues] =
    useState<DepartmentFormValues>(EMPTY_VALUES);

  const [touchedName, setTouchedName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialValues) {
      setValues({
        ...initialValues,
        branchId: initialValues.branchId || null,
        parentDepartmentId: initialValues.parentDepartmentId || null,
      });
    } else if (duplicateFrom) {
      setValues({
        ...duplicateFrom,
        name: t("departments.duplicate.copySuffix", {
          name: duplicateFrom.name,
        }),
        branchId: duplicateFrom.branchId || null,
        parentDepartmentId: duplicateFrom.parentDepartmentId || null,
      });
    } else {
      setValues(EMPTY_VALUES);
    }

    setTouchedName(false);
  }, [open, initialValues, duplicateFrom, t]);

  const excludedIds = isEditMode
    ? getSelfAndDescendantIds(allDepartments, initialValues!.id)
    : new Set<string>();

  /**
   * Only department name is required.
   */
  const nameError =
    touchedName && values.name.trim().length === 0;

  const isValid = values.name.trim().length > 0;

  function handleClose() {
    setValues(EMPTY_VALUES);
    setTouchedName(false);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setTouchedName(true);

    if (!isValid) return;

    /**
     * Normalize optional fields before sending them.
     *
     * Empty branchId       -> null
     * Empty parent ID      -> null
     */
    const submitValues: DepartmentFormValues = {
      ...values,
      name: values.name.trim(),
      branchId: values.branchId || null,
      parentDepartmentId: values.parentDepartmentId || null,
    };

    setIsSubmitting(true);

    try {
      await onSubmit(submitValues, initialValues?.id);
      handleClose();
    }finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={
        isEditMode
          ? t("departments.create.editTitle")
          : t("departments.create.title")
      }
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        {/* Department Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
            {t("departments.create.fields.name")}
          </label>

          <input
            value={values.name}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                name: e.target.value,
              }))
            }
            onBlur={() => setTouchedName(true)}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />

          {nameError && (
            <p className="mt-1 text-xs text-[var(--error)]">
              {t("departments.create.errors.required")}
            </p>
          )}

          {serverError?.field === "name" && (
            <p className="mt-1 text-xs text-[var(--error)]">
              {t(serverError.messageKey)}
            </p>
          )}
        </div>

        {/* Branch - Optional */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
            {t("departments.create.fields.branch")}
            <Optional/>
          </label>

          <select
            value={values.branchId ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                branchId: e.target.value || null,
              }))
            }
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          >
            <option value="">—</option>

            {branchOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Parent Department - Optional */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
            {t("departments.create.fields.parentDepartment")}
            <Optional/>
          </label>

          <TreeSelect
            nodes={allDepartments}
            value={values.parentDepartmentId}
            onChange={(id) =>
              setValues((v) => ({
                ...v,
                parentDepartmentId: id || null,
              }))
            }
            searchPlaceholder={t(
              "departments.move.searchPlaceholder"
            )}
            noneLabel={t(
              "departments.create.fields.parentDepartmentNone"
            )}
            excludedIds={excludedIds}
          />
        </div>

        {/* Active - Edit only */}
        {isEditMode && (
          <label className="flex items-center gap-2 text-sm text-[var(--ink-primary)]">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  isActive: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded-[4px] border-[var(--hairline)]"
            />

            {t("users.status.active")}
          </label>
        )}

        {/* Actions */}
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
              ? t("departments.create.submitting")
              : isEditMode
                ? t("users.actions.save")
                : t("departments.list.createDepartment")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}