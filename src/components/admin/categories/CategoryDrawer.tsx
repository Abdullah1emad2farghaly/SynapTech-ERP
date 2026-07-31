// src/components/admin/categories/CategoryDrawer.tsx
//
// Create + Edit combined, matching DepartmentDrawer's one-component
// pattern — reverting to the project's default Drawer-first convention
// (Accounts was the one deliberate exception, not a new default).
// Mirrors the confirmed payloads exactly:
//   POST /api/Categories { name, parentCategoryId }
//   PUT  /api/Categories/{id} { name, parentCategoryId, isActive }
//
// Parent Category is editable in BOTH Create and Edit here (unlike
// Accounts, where it's permanent after creation) — Update's confirmed
// payload includes parentCategoryId, so reparenting through this form is
// legitimate. The dedicated MoveCategoryDrawer still exists separately
// for reparenting-only moments (a focused single-field drawer is less
// error-prone when that's the only intent), but this form doesn't hide
// or lock the field the way Accounts' Edit mode locks Type/Parent.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import {
  TreeSelect,
  getSelfAndDescendantIds,
  type TreeSelectNode,
} from "../../common/TreeSelect";

export interface CategoryFormValues {
  name: string;
  parentCategoryId: string | null;
  isActive: boolean;
}

export interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Presence of this (with an id) puts the drawer in Edit mode. */
  initialValues?: (CategoryFormValues & { id: string }) | null;
  /** Create-mode only: pre-selects this as the parent (used by the "Add Child" menu action). Ignored in Edit mode. */
  presetParentId?: string | null;
  /** Full flat category list, used to build the parent tree-select and exclude self/descendants in Edit mode. */
  allCategories: TreeSelectNode[];
  onSubmit: (values: CategoryFormValues, id?: string) => Promise<void>;
  serverError?: { field?: "name"; messageKey: string } | null;
}

const EMPTY_VALUES: CategoryFormValues = {
  name: "",
  parentCategoryId: null,
  isActive: true,
};

export function CategoryDrawer({
  open,
  onClose,
  initialValues,
  presetParentId,
  allCategories,
  onSubmit,
  serverError,
}: CategoryDrawerProps) {
  const { t } = useTranslation();
  const isEditMode = !!initialValues;

  const [values, setValues] = useState<CategoryFormValues>(EMPTY_VALUES);
  const [touchedName, setTouchedName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setValues(initialValues);
    } else {
      setValues({ ...EMPTY_VALUES, parentCategoryId: presetParentId ?? null });
    }
    setTouchedName(false);
  }, [open, initialValues, presetParentId]);

  const excludedIds = isEditMode
    ? getSelfAndDescendantIds(allCategories, initialValues!.id)
    : new Set<string>();

  const nameError = touchedName && values.name.trim().length === 0;
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
      title={isEditMode ? t("categories.create.editTitle") : t("categories.create.title")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
            {t("categories.create.fields.name")}
          </label>
          <input
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            onBlur={() => setTouchedName(true)}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
          {nameError && (
            <p className="mt-1 text-xs text-[var(--error)]">{t("categories.create.errors.required")}</p>
          )}
          {serverError?.field === "name" && (
            <p className="mt-1 text-xs text-[var(--error)]">{t(serverError.messageKey)}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
            {t("categories.create.fields.parentCategory")}
          </label>
          <TreeSelect
            nodes={allCategories}
            value={values.parentCategoryId}
            onChange={(id) => setValues((v) => ({ ...v, parentCategoryId: id }))}
            searchPlaceholder={t("categories.move.searchPlaceholder")}
            noneLabel={t("categories.create.fields.parentCategoryNone")}
            excludedIds={excludedIds}
          />
        </div>

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
              ? t("categories.create.submitting")
              : isEditMode
                ? t("users.actions.save")
                : t("categories.list.createCategory")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
