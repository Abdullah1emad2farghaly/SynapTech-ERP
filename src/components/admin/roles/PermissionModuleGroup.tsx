// Project path: src/components/admin/roles/PermissionModuleGroup.tsx
//
// UPDATE: accepts `lockedBy` (requiredCode -> selected codes that need it).
// A locked row's checkbox is disabled and visually muted, with a title
// tooltip listing what still depends on it, so unchecking it requires
// first unchecking whatever requires it.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Lock } from "lucide-react";
import type { PermissionResponse } from "../../../types/roles.types";

interface PermissionModuleGroupProps {
  module: string;
  permissions: PermissionResponse[];
  selectedCodes: Set<string>;
  lockedBy: Map<string, string[]>;
  onToggle: (code: string) => void;
  onSelectAll: (codes: string[]) => void;
  onClearAll: (codes: string[]) => void;
  defaultExpanded?: boolean;
}

export function PermissionModuleGroup({
  module,
  permissions,
  selectedCodes,
  lockedBy,
  onToggle,
  onSelectAll,
  onClearAll,
  defaultExpanded = true,
}: PermissionModuleGroupProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const codes = permissions.map((p) => p.code);
  const selectedInModule = codes.filter((c) => selectedCodes.has(c)).length;

  return (
    <div className="overflow-hidden rounded-lg border border-[--hairline]">
      <div className="flex items-center justify-between bg-[--sunken] px-4 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-2 text-sm font-medium text-[--ink-primary]"
          aria-expanded={expanded}
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-150 ${
              expanded ? "" : "-rotate-90 rtl:rotate-90"
            }`}
          />
          {module}
          <span className="text-xs font-normal text-[--ink-tertiary]">
            ({selectedInModule}/{codes.length})
          </span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectAll(codes)}
            className="text-[--signal] hover:underline"
          >
            {t("roles.permissions.selectAll")}
          </button>
          <span className="text-[--hairline]">|</span>
          <button
            type="button"
            onClick={() => onClearAll(codes)}
            className="text-[--ink-secondary] hover:underline"
          >
            {t("roles.permissions.clearAll")}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
          {permissions.map((permission) => {
            const checked = selectedCodes.has(permission.code);
            const dependents = lockedBy.get(permission.code);
            const locked = checked && !!dependents?.length;

            return (
              <label
                key={permission.code}
                title={
                  locked
                    ? t("roles.permissions.lockedTooltip", {
                        codes: dependents!.join(", "),
                      })
                    : undefined
                }
                className={`flex items-start gap-2 rounded-md border p-2.5 text-sm transition-colors ${
                  locked ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                } ${
                  checked
                    ? "border-[--signal] bg-[--signal]/5"
                    : "border-[--hairline] hover:bg-[--sunken]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={locked}
                  onChange={() => onToggle(permission.code)}
                  className="mt-0.5 accent-[--signal] disabled:cursor-not-allowed"
                />
                <span>
                  <span className="flex items-center gap-1 font-medium text-[--ink-primary]">
                    {permission.description}
                    {locked && (
                      <Lock
                        size={11}
                        className="shrink-0 text-[--ink-tertiary]"
                      />
                    )}
                  </span>
                  <span className="block font-mono text-xs text-[--ink-tertiary]">
                    {permission.code}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}