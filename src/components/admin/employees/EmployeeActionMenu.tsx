// src/components/admin/employees/EmployeeActionMenu.tsx

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MoreVertical,
  Eye,
  Pencil,
  KeyRound,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import { useDeleteEmployee } from "../../../hooks/useEmployees";
import type { EmployeeResponse } from "../../../types/employee.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface EmployeeActionMenuProps {
  employee: EmployeeResponse;
  onGrantAccess: (employee: EmployeeResponse) => void;
}

export function EmployeeActionMenu({
  employee,
  onGrantAccess,
}: EmployeeActionMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const deleteEmployee = useDeleteEmployee();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const hasAccess = Boolean(employee.userId);
  const displayName = employee.fullName || employee.employeeCode || "";

  const closeMenu = () => {
    setMenuOpen(false);

    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  };

  const updateMenuPosition = () => {
    if (!buttonRef.current || !menuRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    const spacing = 4;
    const viewportPadding = 8;

    // Default: open below the three-dot button.
    let top = buttonRect.bottom + spacing;

    // Align the menu's right edge with the button's right edge.
    let left = buttonRect.right - menuRect.width;

    // If there isn't enough space below, open above the row.
    if (
      top + menuRect.height >
      window.innerHeight - viewportPadding
    ) {
      top = buttonRect.top - menuRect.height - spacing;
    }

    // Keep menu inside viewport horizontally.
    if (
      left + menuRect.width >
      window.innerWidth - viewportPadding
    ) {
      left =
        window.innerWidth -
        menuRect.width -
        viewportPadding;
    }

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    // Keep menu inside viewport vertically.
    if (top < viewportPadding) {
      top = viewportPadding;
    }

    setMenuPosition({
      top,
      left,
    });
  };

  /**
   * Close menu when clicking anywhere outside this specific employee menu.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setMenuOpen(false);
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    // Wait for the portal menu to render before measuring it.
    requestAnimationFrame(() => {
      updateMenuPosition();
    });

    const handleScroll = () => {
      updateMenuPosition();
    };

    const handleResize = () => {
      updateMenuPosition();
    };

    // Capture scrolling from the table/container as well as the window.
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  async function handleDelete() {
    try {
      await deleteEmployee.mutateAsync(employee.id);

      toast.success(
        t("employees.toast.deleted", "Employee deleted")
      );

      setConfirmDeleteOpen(false);
      closeMenu();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors);
      }
    }
  }

  return (
    <>
      <div className="relative inline-flex">
        {/* Three dots */}
        <button
          ref={buttonRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((current) => !current);
          }}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={t(
            "employees.table.actionsFor",
            "Actions for {{name}}",
            {
              name: displayName,
            }
          )}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-[8px]
            text-[var(--ink-tertiary)]
            transition-colors
            duration-150
            hover:bg-[var(--sunken)]
            hover:text-[var(--ink-primary)]
          "
        >
          <MoreVertical
            size={18}
            aria-hidden="true"
          />
        </button>
      </div>

      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={t(
              "employees.table.actionsFor",
              "Actions for {{name}}",
              {
                name: displayName,
              }
            )}
            onClick={(event) => event.stopPropagation()}
            className="
              fixed
              z-[9999]
              w-56
              overflow-hidden
              rounded-[10px]
              border
              border-[var(--hairline)]
              bg-[var(--panel)]
              py-1
              shadow-[var(--elevation-1)]
            "
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              visibility:
                menuPosition.top === 0
                  ? "hidden"
                  : "visible",
            }}
          >
            {/* View Details */}
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                navigate(`/hr/employees/${employee.id}`);
              }}
              className="
                flex
                w-full
                items-center
                gap-2.5
                px-3
                py-2.5
                text-start
                text-sm
                text-[var(--ink-primary)]
                hover:bg-[var(--sunken)]
              "
            >
              <Eye
                size={15}
                aria-hidden="true"
              />

              {t(
                "employees.actions.viewDetails",
                "View Details"
              )}
            </button>

            {/* Edit */}
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                navigate(`/hr/employees/${employee.id}/edit`);
              }}
              className="
                flex
                w-full
                items-center
                gap-2.5
                px-3
                py-2.5
                text-start
                text-sm
                text-[var(--ink-primary)]
                hover:bg-[var(--sunken)]
              "
            >
              <Pencil
                size={15}
                aria-hidden="true"
              />

              {t(
                "employees.actions.edit",
                "Edit Employee"
              )}
            </button>

            {/* Access */}
            {hasAccess ? (
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  closeMenu();
                  navigate(
                    `/hr/employees/${employee.id}?tab=access`
                  );
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  px-3
                  py-2.5
                  text-start
                  text-sm
                  text-[var(--ink-primary)]
                  hover:bg-[var(--sunken)]
                "
              >
                <ShieldCheck
                  size={15}
                  aria-hidden="true"
                />

                {t(
                  "employees.actions.viewAccess",
                  "View System Access"
                )}
              </button>
            ) : (
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  closeMenu();
                  onGrantAccess(employee);
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  px-3
                  py-2.5
                  text-start
                  text-sm
                  text-[var(--ink-primary)]
                  hover:bg-[var(--sunken)]
                "
              >
                <KeyRound
                  size={15}
                  aria-hidden="true"
                />

                {t(
                  "employees.actions.grantAccess",
                  "Grant Access"
                )}
              </button>
            )}

            {/* Divider */}
            <div
              className="my-1 h-px bg-[var(--hairline)]"
              aria-hidden="true"
            />

            {/* Delete */}
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                closeMenu();
                setConfirmDeleteOpen(true);
              }}
              className="
                flex
                w-full
                items-center
                gap-2.5
                px-3
                py-2.5
                text-start
                text-sm
                text-[var(--error)]
                hover:bg-[var(--error)]/5
              "
            >
              <Trash2
                size={15}
                aria-hidden="true"
              />

              {t(
                "employees.actions.delete",
                "Delete Employee"
              )}
            </button>
          </div>,
          document.body
        )}

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={confirmDeleteOpen}
        tone="destructive"
        title={t(
          "employees.deleteDialog.title",
          "Delete Employee?"
        )}
        body={t(
          "employees.deleteDialog.body",
          "You are about to permanently remove {{name}} ({{code}}). This action cannot be undone.",
          {
            name: displayName,
            code: employee.employeeCode || "—",
          }
        )}
        confirmLabel={t(
          "employees.deleteDialog.confirm",
          "Delete Employee"
        )}
        cancelLabel={t(
          "common.cancel",
          "Cancel"
        )}
        isSubmitting={deleteEmployee.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}