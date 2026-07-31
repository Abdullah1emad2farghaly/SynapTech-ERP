// src/components/admin/categories/CategoryContextMenu.tsx
//
// Right-click counterpart to CategoryActionMenu, wrapping the same
// CategoryMenuItems content, positioned at the click coordinates rather
// than anchored to a trigger button. Fully controlled by the page
// (open/position/target category), which also owns closing it on any
// outside click — matching the "one shared content, two triggers" design
// from CategoryMenuItems' own header comment.

import { useTranslation } from "react-i18next";
import { CategoryMenuItems } from "./CategoryMenuItems";
import { useCategoryQuickActions } from "../../../hooks/useCategoryQuickActions";

export interface CategoryContextMenuProps {
  open: boolean;
  position: { x: number; y: number } | null;
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
  onClose: () => void;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onMove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDeactivateRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function CategoryContextMenu({
  open,
  position,
  categoryId,
  categoryName,
  isActive,
  deleteDisabled,
  deleteDisabledReason,
  onClose,
  onViewDetails,
  onEdit,
  onMove,
  onAddChild,
  onSetActive,
  onDeactivateRequest,
  onDeleteRequest,
}: CategoryContextMenuProps) {
  const { t } = useTranslation();
  const { handleActivate, handleCopyId } = useCategoryQuickActions(onSetActive);

  if (!open || !position) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        role="menu"
        aria-label={t("categories.actions.moreActions")}
        // Uses left/top (not RTL logical properties) deliberately — this
        // positions at literal cursor coordinates (clientX/clientY from
        // the triggering event), which are the same regardless of
        // document direction, unlike a layout offset.
        style={{ top: position.y, left: position.x }}
        className="fixed z-50 w-52 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
      >
        <CategoryMenuItems
          isActive={isActive}
          deleteDisabled={deleteDisabled}
          deleteDisabledReason={deleteDisabledReason}
          onViewDetails={() => {
            onClose();
            onViewDetails(categoryId);
          }}
          onEdit={() => {
            onClose();
            onEdit(categoryId);
          }}
          onMove={() => {
            onClose();
            onMove(categoryId);
          }}
          onAddChild={() => {
            onClose();
            onAddChild(categoryId);
          }}
          onCopyId={() => {
            onClose();
            handleCopyId(categoryId);
          }}
          onActivate={() => {
            onClose();
            handleActivate(categoryId, categoryName);
          }}
          onDeactivateRequest={() => {
            onClose();
            onDeactivateRequest(categoryId);
          }}
          onDeleteRequest={() => {
            onClose();
            onDeleteRequest(categoryId);
          }}
        />
      </div>
    </>
  );
}
