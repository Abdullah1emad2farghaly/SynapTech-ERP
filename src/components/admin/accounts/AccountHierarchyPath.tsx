// src/components/admin/accounts/AccountHierarchyPath.tsx
//
// Section 3's visual "where am I" indicator — Parent -> Current ->
// Children (count). Deliberately NOT a second interactive tree widget;
// AccountsTree already exists for browsing/navigating the full
// hierarchy. This is a simple vertical path, read-only except for the
// parent link (navigates to the parent's own Details page) and the
// children count (scrolls to / is elaborated by ChildAccountsTable
// below it on the same page, not a separate interaction here).

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ArrowDown } from "lucide-react";

export interface AccountHierarchyPathProps {
  parent: { id: string; code: string; name: string } | null;
  current: { code: string; name: string };
  childrenCount: number;
}

export function AccountHierarchyPath({ parent, current, childrenCount }: AccountHierarchyPathProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-start gap-1">
      {parent ? (
        <>
          <button
            type="button"
            onClick={() => navigate(`/accounting/accounts/${parent.id}`)}
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--sunken)] px-3 py-2 text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
          >
            <span className="font-mono text-xs text-[var(--ink-tertiary)]">{parent.code}</span>{" "}
            {parent.name}
          </button>
          <ArrowDown size={14} className="ms-3 text-[var(--ink-tertiary)]" aria-hidden="true" />
        </>
      ) : (
        <p className="text-xs text-[var(--ink-tertiary)]">{t("accounts.details.noParent")}</p>
      )}

      <div className="rounded-[10px] border border-[var(--signal)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)]">
        <span className="font-mono text-xs text-[var(--ink-tertiary)]">{current.code}</span>{" "}
        {current.name}
      </div>

      {childrenCount > 0 && (
        <>
          <ArrowDown size={14} className="ms-3 text-[var(--ink-tertiary)]" aria-hidden="true" />
          <p className="rounded-[10px] border border-[var(--hairline)] bg-[var(--sunken)] px-3 py-2 text-sm text-[var(--ink-secondary)]">
            {t("accounts.details.childrenCount", { count: childrenCount })}
          </p>
        </>
      )}
    </div>
  );
}
