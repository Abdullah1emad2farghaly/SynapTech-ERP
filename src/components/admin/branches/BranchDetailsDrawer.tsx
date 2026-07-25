// src/components/admin/branches/BranchDetailsDrawer.tsx
//
// Read-only summary opened on row click, replacing a dedicated
// /branches/:id page — same reasoning as Departments: 6 fields per
// record isn't enough to justify a full page.
//
// Departments/Users counts are shown here as on-demand data (only
// computed while this drawer is open), not as a live table column or
// KPI — per the design doc's decision that these are real but too
// expensive to keep always-fetched, given no backend aggregate exists.

import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import { StatusBadge } from "../../common/StatusBadge";
import { MainBranchBadge } from "../../common/MainBranchBadge";

export interface BranchDetailsData {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
  isActive: boolean;
}

export interface BranchDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  branch: BranchDetailsData | null;
  /** Computed by the parent page from the already-loaded Departments/Users sets. */
  departmentsCount: number;
  usersCount: number;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function BranchDetailsDrawer({
  open,
  onClose,
  branch,
  departmentsCount,
  usersCount,
  onEdit,
  onDuplicate,
}: BranchDetailsDrawerProps) {
  const { t } = useTranslation();

  if (!branch) return null;

  return (
    <Drawer open={open} onClose={onClose} title={branch.name} subtitle={branch.code}>
      <div className="mb-4 flex items-center gap-2">
        <StatusBadge
          status={branch.isActive ? "active" : "inactive"}
          label={branch.isActive ? t("users.status.active") : t("users.status.inactive")}
        />
        {branch.isMain && <MainBranchBadge label={t("branches.badge.main")} />}
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("branches.details.sections.overview")}
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--ink-tertiary)]">{t("branches.column.branch")}</span>
            <span className="text-[var(--ink-primary)]">{branch.name}</span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("branches.details.sections.contact")}
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--ink-tertiary)]">{t("branches.column.address")}</span>
            <span className="text-[var(--ink-primary)]">{branch.address || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ink-tertiary)]">{t("branches.column.phone")}</span>
            <span dir="ltr" className="text-[var(--ink-primary)]">
              {branch.phone || "—"}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("branches.details.sections.relatedData")}
        </h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--ink-tertiary)]">{t("branches.details.departmentsCount")}</span>
            <span className="text-[var(--ink-primary)]">{departmentsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ink-tertiary)]">{t("branches.details.usersCount")}</span>
            <span className="text-[var(--ink-primary)]">{usersCount}</span>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
        <button
          type="button"
          onClick={() => onDuplicate(branch.id)}
          className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
        >
          {t("branches.actions.duplicate")}
        </button>
        <button
          type="button"
          onClick={() => onEdit(branch.id)}
          className="rounded-[10px] bg-[var(--signal)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
        >
          {t("branches.actions.edit")}
        </button>
      </div>
    </Drawer>
  );
}
