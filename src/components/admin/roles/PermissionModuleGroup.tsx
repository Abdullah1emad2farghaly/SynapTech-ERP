// Project path: src/components/admin/roles/PermissionModuleGroup.tsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import type { PermissionResponse } from "../../../types/roles.types";

interface PermissionModuleGroupProps {
  module: string;
  permissions: PermissionResponse[];
  selectedCodes: Set<string>;
  onToggle: (code: string) => void;
  onSelectAll: (codes: string[]) => void;
  onClearAll: (codes: string[]) => void;
  defaultExpanded?: boolean;
}

export function PermissionModuleGroup({
  module,
  permissions,
  selectedCodes,
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
            return (
              <label
                key={permission.code}
                className={`flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm transition-colors ${
                  checked
                    ? "border-[--signal] bg-[--signal]/5"
                    : "border-[--hairline] hover:bg-[--sunken]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(permission.code)}
                  className="mt-0.5 accent-[--signal]"
                />
                <span>
                  <span className="block font-medium text-[--ink-primary]">
                    {permission.description}
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
