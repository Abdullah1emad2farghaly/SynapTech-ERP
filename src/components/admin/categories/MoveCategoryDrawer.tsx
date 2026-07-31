// src/components/admin/categories/MoveCategoryDrawer.tsx
//
// Nearly identical to MoveDepartmentDrawer — focused single-field drawer
// for reparenting-only moments, even though CategoryDrawer's Edit mode
// could technically handle the same change. Kept separate because a
// focused drawer is less error-prone when reparenting is the only
// intent (no risk of accidentally touching Name/Status while just
// meaning to move something).
//
// Unlike MoveDepartmentDrawer, PUT /api/Categories/{id} takes the id in
// the path (not a query param the way Accounts' update did), so the
// parent page's onSubmit composes { id, name, parentCategoryId, isActive }
// the same straightforward way Departments' Move flow did.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import {
  TreeSelect,
  getSelfAndDescendantIds,
  type TreeSelectNode,
} from "../../common/TreeSelect";

export interface MoveCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  currentParentId: string | null;
  allCategories: TreeSelectNode[];
  onSubmit: (categoryId: string, newParentId: string | null) => Promise<void>;
}

export function MoveCategoryDrawer({
  open,
  onClose,
  categoryId,
  categoryName,
  currentParentId,
  allCategories,
  onSubmit,
}: MoveCategoryDrawerProps) {
  const { t } = useTranslation();
  const [selectedParentId, setSelectedParentId] = useState<string | null>(currentParentId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSelectedParentId(currentParentId);
  }, [open, currentParentId]);

  const excludedIds = getSelfAndDescendantIds(allCategories, categoryId);
  const isUnchanged = selectedParentId === currentParentId;

  function handleClose() {
    setSelectedParentId(currentParentId);
    onClose();
  }

  async function handleSave() {
    setIsSubmitting(true);
    try {
      await onSubmit(categoryId, selectedParentId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={t("categories.move.title")}
      subtitle={categoryName}
    >
      <div className="flex flex-col gap-4">
        <TreeSelect
          nodes={allCategories}
          value={selectedParentId}
          onChange={setSelectedParentId}
          searchPlaceholder={t("categories.move.searchPlaceholder")}
          noneLabel={t("categories.create.fields.parentCategoryNone")}
          excludedIds={excludedIds}
        />

        <div className="mt-2 flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t("users.actions.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUnchanged || isSubmitting}
            className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("categories.create.submitting") : t("users.actions.save")}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
