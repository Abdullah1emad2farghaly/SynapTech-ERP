// src/components/admin/users/AdvancedSearchPanel.tsx
//
// Filter panel for the Users List toolbar: Branch, Department, Role,
// Status. Rendered as a popover anchored to a "Filters" trigger button,
// kept separate from the global search input so the toolbar stays
// uncluttered (per the module design doc). Presentation + local draft
// state only — filters are committed via onApply, so the list doesn't
// refetch on every keystroke/click inside the panel.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
import type { MultiSelectOption } from "../../common/MultiSelectSearchable";

export interface UsersFilters {
  branchId: string | null;
  departmentId: string | null;
  roleId: string | null;
  status: "active" | "inactive" | null;
}

const EMPTY_FILTERS: UsersFilters = {
  branchId: null,
  departmentId: null,
  roleId: null,
  status: null,
};

export interface AdvancedSearchPanelProps {
  value: UsersFilters;
  onApply: (filters: UsersFilters) => void;
  branchOptions: MultiSelectOption[];
  departmentOptions: MultiSelectOption[];
  roleOptions: MultiSelectOption[];
}

function countActive(filters: UsersFilters): number {
  return Object.values(filters).filter((v) => v !== null).length;
}

export function AdvancedSearchPanel({
  value,
  onApply,
  branchOptions,
  departmentOptions,
  roleOptions,
}: AdvancedSearchPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<UsersFilters>(value);

  // Keep the draft in sync if filters are cleared elsewhere (e.g. the
  // table's "Clear filters" empty-state action).
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const activeCount = countActive(value);

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleClear() {
    setDraft(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
      >
        <SlidersHorizontal size={15} />
        {t("users.list.filters.trigger")}
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--signal)] px-1 text-[11px] font-medium text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute end-0 z-20 mt-2 w-72 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-4 shadow-[var(--elevation-1)]">
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--ink-secondary)]">
                  {t("users.list.filters.branch")}
                </label>
                <select
                  value={draft.branchId ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, branchId: e.target.value || null }))
                  }
                  className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                >
                  <option value="">—</option>
                  {branchOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--ink-secondary)]">
                  {t("users.list.filters.department")}
                </label>
                <select
                  value={draft.departmentId ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, departmentId: e.target.value || null }))
                  }
                  className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                >
                  <option value="">—</option>
                  {departmentOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--ink-secondary)]">
                  {t("users.list.filters.role")}
                </label>
                <select
                  value={draft.roleId ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, roleId: e.target.value || null }))}
                  className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                >
                  <option value="">—</option>
                  {roleOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--ink-secondary)]">
                  {t("users.list.filters.status")}
                </label>
                <select
                  value={draft.status ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      status: (e.target.value || null) as UsersFilters["status"],
                    }))
                  }
                  className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                >
                  <option value="">—</option>
                  <option value="active">{t("users.status.active")}</option>
                  <option value="inactive">{t("users.status.inactive")}</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-[var(--hairline)] pt-3">
              <button
                type="button"
                onClick={handleClear}
                className="text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              >
                {t("users.list.empty.clearFilters")}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="rounded-[10px] bg-[var(--signal)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
              >
                {t("users.list.filters.apply")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { EMPTY_FILTERS };
