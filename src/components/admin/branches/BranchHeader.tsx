// src/components/admin/organization/branches/BranchHeader.tsx
//
// Premium header card for BranchDetailsPage: name, code, badges, and the
// primary actions (Edit, Delete, Back). Presentation-only — Edit opens
// the existing BranchDrawer (reused, not reimplemented as a second form)
// and Delete opens the existing ConfirmationDialog via BranchActionMenu's
// same pattern; this component owns none of that state itself, it just
// renders the trigger buttons and forwards clicks to the page.

import { useTranslation } from "react-i18next";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge";
import { MainBranchBadge } from "../../common/MainBranchBadge";

export interface BranchHeaderProps {
  name: string;
  code: string;
  isActive: boolean;
  isMain: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
}

export function BranchHeader({
  name,
  code,
  isActive,
  isMain,
  onBack,
  onEdit,
  onDelete,
  deleteDisabled,
  deleteDisabledReason,
}: BranchHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("branches.details.back")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--ink-primary)]">{name}</h1>
            <span className="font-mono text-sm text-[var(--ink-tertiary)]">{code}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge
              status={isActive ? "active" : "inactive"}
              label={isActive ? t("users.status.active") : t("users.status.inactive")}
              size="md"
            />
            {isMain && <MainBranchBadge label={t("branches.badge.main")} size="md" />}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
          >
            <Pencil size={14} />
            {t("branches.actions.edit")}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleteDisabled}
            title={deleteDisabled ? deleteDisabledReason : undefined}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Trash2 size={14} />
            {t("branches.actions.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
