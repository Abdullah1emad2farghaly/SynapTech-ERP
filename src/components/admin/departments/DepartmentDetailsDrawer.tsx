// src/components/admin/departments/DepartmentDetailsDrawer.tsx
//
// Read-only summary opened on row click, replacing what would otherwise
// be a dedicated /departments/:id page — with only 4 real fields per
// record, a full page would mostly be empty space. Shows the department's
// own data plus its direct children (derived from the already-loaded
// full department list, not a separate fetch), and offers the same quick
// actions as the row kebab menu so a person doesn't have to close the
// drawer to act.
//
// Reuses the shared Drawer shell (RTL-aware, focus-trapped, motion
// already handled) rather than a bespoke panel — consistent with every
// other drawer in the product.

import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import { StatusBadge } from "../../common/StatusBadge";

export interface DepartmentDetailsData {
  id: string;
  name: string;
  branchName: string;
  parentDepartmentName: string | null;
  isActive: boolean;
}

export interface DepartmentDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  department: DepartmentDetailsData | null;
  /** Direct children only, derived by the parent page from the full loaded set. */
  childDepartments: { id: string; name: string }[];
  onEdit: (id: string) => void;
  onMove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function DepartmentDetailsDrawer({
  open,
  onClose,
  department,
  childDepartments,
  onEdit,
  onMove,
  onDuplicate,
}: DepartmentDetailsDrawerProps) {
  const { t } = useTranslation();

  if (!department) return null;

  return (
    <Drawer open={open} onClose={onClose} title={department.name}>
      <div className="mb-2">
        <StatusBadge
          status={department.isActive ? "active" : "inactive"}
          label={department.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
      </div>

      <section className="mb-6 mt-4">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("departments.details.sections.overview")}
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--ink-tertiary)]">{t("departments.column.branch")}</span>
            <span className="text-[var(--ink-primary)]">{department.branchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ink-tertiary)]">
              {t("departments.column.parentDepartment")}
            </span>
            <span className="text-[var(--ink-primary)]">
              {department.parentDepartmentName ??
                t("departments.create.fields.parentDepartmentNone")}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("departments.details.sections.children")}
        </h3>
        {childDepartments.length === 0 ? (
          <p className="text-sm text-[var(--ink-tertiary)]">{t("departments.details.noChildren")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {childDepartments.map((child) => (
              <li
                key={child.id}
                className="rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm text-[var(--ink-primary)]"
              >
                {child.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
        <button
          type="button"
          onClick={() => onDuplicate(department.id)}
          className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
        >
          {t("departments.actions.duplicate")}
        </button>
        <button
          type="button"
          onClick={() => onMove(department.id)}
          className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
        >
          {t("departments.actions.move")}
        </button>
        <button
          type="button"
          onClick={() => onEdit(department.id)}
          className="rounded-[10px] bg-[var(--signal)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
        >
          {t("departments.actions.edit")}
        </button>
      </div>
    </Drawer>
  );
}
