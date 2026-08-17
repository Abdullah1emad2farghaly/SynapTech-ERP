// src/components/admin/employees/EmployeeActionMenu.tsx

import { useEffect, useRef, useState } from "react";
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

  const hasAccess = Boolean(employee.userId);
  const displayName = employee.fullName || employee.employeeCode || "";

  /**
   * Close menu when clicking anywhere outside this specific employee menu.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

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
        handleErrors(error.response?.data.errors)
      }
    }
  }

  return (
    <div
      ref={menuRef}
      className="relative inline-flex"
    >
      {/* Three dots */}
      <button
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

      {menuOpen && (
        <div
          role="menu"
          aria-label={t(
            "employees.table.actionsFor",
            "Actions for {{name}}",
            {
              name: displayName,
            }
          )}
          className="
            absolute
            end-0
            top-full
            z-[100]
            mt-1
            w-56
            overflow-hidden
            rounded-[10px]
            border
            border-[var(--hairline)]
            bg-[var(--panel)]
            py-1
            shadow-[var(--elevation-1)]
          "
          onClick={(event) => event.stopPropagation()}
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
        </div>
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
    </div>
  );
}
