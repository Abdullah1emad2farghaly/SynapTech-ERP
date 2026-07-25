// src/components/admin/organization/branches/DepartmentsSection.tsx
//
// Wraps the "Departments" heading plus loading/error/empty states for the
// branch's department list, and renders DepartmentsAccordion once data
// is available. Kept separate from DepartmentsAccordion itself so the
// accordion component stays a pure "list of departments in, accordion
// out" component or without knowing about the section-level states.

import { useTranslation } from "react-i18next";
import { FolderTree } from "lucide-react";
import { DepartmentsAccordion, type AccordionDepartment } from "./DepartmentsAccordion";

export interface DepartmentsSectionProps {
  departments: AccordionDepartment[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onSetUserActive: (userId: string, active: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

function DepartmentsListSkeleton() {
  return (
    <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)]">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border-b border-[var(--hairline)] px-4 py-4 last:border-b-0">
          <div className="h-4 w-40 animate-pulse rounded-[4px] bg-[var(--sunken)]" />
        </div>
      ))}
    </div>
  );
}

export function DepartmentsSection({
  departments,
  isLoading,
  hasError,
  onRetry,
  onSetUserActive,
  onDeleteUser,
}: DepartmentsSectionProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-[var(--ink-primary)]">
        {t("branches.details.sections.departments")}
      </h2>

      {hasError ? (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] py-10 text-center">
          <p className="text-sm font-medium text-[var(--error)]">{t("common.errors.loadFailed")}</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
          >
            {t("common.actions.retry")}
          </button>
        </div>
      ) : isLoading ? (
        <DepartmentsListSkeleton />
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] py-10 text-center">
          <FolderTree size={24} className="text-[var(--ink-tertiary)]" />
          <p className="text-sm font-medium text-[var(--ink-primary)]">
            {t("branches.details.noDepartments")}
          </p>
        </div>
      ) : (
        <DepartmentsAccordion
          departments={departments}
          onSetUserActive={onSetUserActive}
          onDeleteUser={onDeleteUser}
        />
      )}
    </div>
  );
}
