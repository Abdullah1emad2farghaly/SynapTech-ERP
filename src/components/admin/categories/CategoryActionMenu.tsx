import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { MoreVertical } from "lucide-react";
import { CategoryMenuItems } from "./CategoryMenuItems";
import { useCategoryQuickActions } from "../../../hooks/useCategoryQuickActions";

export interface CategoryActionMenuProps {
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onMove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDeactivateRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function CategoryActionMenu({
  categoryId,
  categoryName,
  isActive,
  deleteDisabled,
  deleteDisabledReason,
  onViewDetails,
  onEdit,
  onMove,
  onAddChild,
  onSetActive,
  onDeactivateRequest,
  onDeleteRequest,
}: CategoryActionMenuProps) {
  const { t } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { handleActivate, handleCopyId } =
    useCategoryQuickActions(onSetActive);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;

    function updatePosition() {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();

      setPosition({
        top: rect.bottom + 8,
        left: rect.right - 208, // menu width (w-52 = 208px)
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        document.getElementById("category-action-menu")?.contains(target)
      ) {
        return;
      }

      closeMenu();
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div ref={containerRef} className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={t("categories.actions.moreActions")}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--sunken)] hover:text-[var(--ink-primary)]"
      >
        <MoreVertical size={16} />
      </button>

      {menuOpen &&
        createPortal(
          <div
            id="category-action-menu"
            role="menu"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
            }}
            className="z-[9999] w-52 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-1 shadow-[var(--elevation-1)]"
          >
            <CategoryMenuItems
              isActive={isActive}
              deleteDisabled={deleteDisabled}
              deleteDisabledReason={deleteDisabledReason}
              onViewDetails={() => {
                closeMenu();
                onViewDetails(categoryId);
              }}
              onEdit={() => {
                closeMenu();
                onEdit(categoryId);
              }}
              onMove={() => {
                closeMenu();
                onMove(categoryId);
              }}
              onAddChild={() => {
                closeMenu();
                onAddChild(categoryId);
              }}
              onActivate={() => {
                closeMenu();
                handleActivate(categoryId, categoryName);
              }}
              onDeactivateRequest={() => {
                closeMenu();
                onDeactivateRequest(categoryId);
              }}
              onDeleteRequest={() => {
                closeMenu();
                onDeleteRequest(categoryId);
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}