// src/components/admin/categories/CategoryMenuItems.tsx
//
// Shared button list used by BOTH CategoryActionMenu (three-dot trigger)
// and CategoryContextMenu (right-click) — written once here so the two
// trigger mechanisms never drift out of sync with each other. Neither
// wrapper owns any ConfirmationDialog itself: Deactivate/Delete requests
// bubble up as plain callbacks, and CategoriesPage owns the actual
// dialogs, same as how AccountsListPage owns AccountDeleteDialog
// independently of any menu component. That keeps this file purely
// presentational and avoids two separate dialog instances existing for
// the same action depending on which trigger was used.

import { useTranslation } from "react-i18next";
import {
  Eye,
  Pencil,
  FolderTree,
  FolderPlus,
  Copy,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";

export interface CategoryMenuItemsProps {
  isActive: boolean;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
  onViewDetails: () => void;
  onEdit: () => void;
  onMove: () => void;
  onAddChild: () => void;
  onCopyId: () => void;
  onActivate: () => void;
  onDeactivateRequest: () => void;
  onDeleteRequest: () => void;
}

export function CategoryMenuItems({
  isActive,
  deleteDisabled,
  deleteDisabledReason,
  onViewDetails,
  onEdit,
  onMove,
  onAddChild,
  onCopyId,
  onActivate,
  onDeactivateRequest,
  onDeleteRequest,
}: CategoryMenuItemsProps) {
  const { t } = useTranslation();

  return (
    <>
      <button
        role="menuitem"
        type="button"
        onClick={onViewDetails}
        className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
      >
        <Eye size={15} />
        {t("categories.actions.viewDetails")}
      </button>

      <button
        role="menuitem"
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
      >
        <Pencil size={15} />
        {t("categories.actions.edit")}
      </button>

      <button
        role="menuitem"
        type="button"
        onClick={onMove}
        className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
      >
        <FolderTree size={15} />
        {t("categories.actions.move")}
      </button>

      <button
        role="menuitem"
        type="button"
        onClick={onAddChild}
        className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
      >
        <FolderPlus size={15} />
        {t("categories.actions.addChild")}
      </button>

      <button
        role="menuitem"
        type="button"
        onClick={onCopyId}
        className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
      >
        <Copy size={15} />
        {t("categories.actions.copyId")}
      </button>

      {isActive ? (
        <button
          role="menuitem"
          type="button"
          onClick={onDeactivateRequest}
          className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
        >
          <UserX size={15} />
          {t("categories.actions.deactivate")}
        </button>
      ) : (
        <button
          role="menuitem"
          type="button"
          onClick={onActivate}
          className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
        >
          <UserCheck size={15} />
          {t("categories.actions.activate")}
        </button>
      )}

      <button
        role="menuitem"
        type="button"
        disabled={deleteDisabled}
        onClick={onDeleteRequest}
        title={deleteDisabled ? deleteDisabledReason : undefined}
        className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-[var(--error)] hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Trash2 size={15} />
        {t("categories.actions.delete")}
      </button>
    </>
  );
}
