// src/components/admin/departments/MoveDepartmentDrawer.tsx
//
// Focused drawer for the "Move" action: just the parent-department
// tree-select, defaulted to the department's current parent. Save calls
// PUT with parentDepartmentId changed (name/branchId/isActive untouched —
// the parent page is expected to send the department's existing values
// for those fields alongside the new parentDepartmentId, since PUT
// requires the full payload).
//
// Same circular-hierarchy guard as DepartmentDrawer's parent field: the
// department itself and all its descendants are excluded from the
// pickable options, since the API doesn't confirm it rejects a circular
// hierarchy on its own.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import {
  TreeSelect,
  getSelfAndDescendantIds,
  type TreeSelectNode,
} from "../../common/TreeSelect";

export interface MoveDepartmentDrawerProps {
  open: boolean;
  onClose: () => void;
  departmentId: string;
  departmentName: string;
  currentParentId: string | null;
  allDepartments: TreeSelectNode[];
  onSubmit: (departmentId: string, newParentId: string | null) => Promise<void>;
}

export function MoveDepartmentDrawer({
  open,
  onClose,
  departmentId,
  departmentName,
  currentParentId,
  allDepartments,
  onSubmit,
}: MoveDepartmentDrawerProps) {
  const { t } = useTranslation();
  const [selectedParentId, setSelectedParentId] = useState<string | null>(currentParentId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSelectedParentId(currentParentId);
  }, [open, currentParentId]);

  const excludedIds = getSelfAndDescendantIds(allDepartments, departmentId);
  const isUnchanged = selectedParentId === currentParentId;

  function handleClose() {
    setSelectedParentId(currentParentId);
    onClose();
  }

  async function handleSave() {
    setIsSubmitting(true);
    try {
      await onSubmit(departmentId, selectedParentId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={t("departments.move.title")}
      subtitle={departmentName}
    >
      <div className="flex flex-col gap-4">
        <TreeSelect
          nodes={allDepartments}
          value={selectedParentId}
          onChange={setSelectedParentId}
          searchPlaceholder={t("departments.move.searchPlaceholder")}
          noneLabel={t("departments.create.fields.parentDepartmentNone")}
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
            {isSubmitting ? t("departments.create.submitting") : t("users.actions.save")}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
