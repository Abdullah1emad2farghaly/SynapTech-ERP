// Project path: src/components/admin/roles/PermissionPicker.tsx
//
// Groups the confirmed permissions-catalog response by `module` client-side
// (the catalog endpoint returns a flat list — grouping is derived, not a
// server shape). Used by both CreateRoleDrawer and ManagePermissionsDrawer.
//
// UPDATE: selecting a permission transitively auto-selects any permissions
// it `requires` (see constants/permissionDependencies.ts). A permission
// currently required by another SELECTED permission is "locked" — toggle()
// no-ops on it, and `lockedBy` (required code -> codes that need it) is
// passed down so PermissionModuleGroup can render it disabled with a
// tooltip naming what still depends on it. Locks are recalculated from the
// current selection on every render, so a permission unlocks automatically
// once nothing selected still needs it.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { PermissionModuleGroup } from "./PermissionModuleGroup";
import { getRequiredPermissions } from "../../../constants/permissionDependencies";
import type { PermissionResponse } from "../../../types/roles.types";

interface PermissionPickerProps {
  catalog: PermissionResponse[];
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
}

export function PermissionPicker({
  catalog,
  selectedCodes,
  onChange,
}: PermissionPickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);

  // requiredCode -> selected codes that still need it. Any key in this map
  // is locked: it can't be unchecked until every code listed for it is
  // unchecked first.
  const lockedBy = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const code of selectedCodes) {
      for (const required of getRequiredPermissions(code)) {
        const dependents = map.get(required) ?? [];
        dependents.push(code);
        map.set(required, dependents);
      }
    }
    return map;
  }, [selectedCodes]);

  const filteredCatalog = useMemo(() => {
    if (!search.trim()) return catalog;
    const q = search.trim().toLowerCase();
    return catalog.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  const groups = useMemo(() => {
    const byModule = new Map<string, PermissionResponse[]>();
    for (const permission of filteredCatalog) {
      const list = byModule.get(permission.module) ?? [];
      list.push(permission);
      byModule.set(permission.module, list);
    }
    return Array.from(byModule.entries()).map(([module, permissions]) => ({
      module,
      permissions,
    }));
  }, [filteredCatalog]);

  const toggle = (code: string) => {
    if (selectedSet.has(code)) {
      if (lockedBy.has(code)) return; // locked — can't unselect directly
      onChange(selectedCodes.filter((c) => c !== code));
      return;
    }

    const required = getRequiredPermissions(code).filter(
      (c) => !selectedSet.has(c)
    );
    onChange([...selectedCodes, code, ...required]);
  };

  const selectAll = (codes: string[]) => {
    const merged = new Set(selectedCodes);
    for (const code of codes) {
      merged.add(code);
      for (const required of getRequiredPermissions(code)) {
        merged.add(required);
      }
    }
    onChange(Array.from(merged));
  };

  const clearAll = (codes: string[]) => {
    // Locked codes (needed by a selection possibly outside this group)
    // are preserved; everything else in the group is removed.
    const remove = new Set(codes.filter((c) => !lockedBy.has(c)));
    onChange(selectedCodes.filter((c) => !remove.has(c)));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[--ink-tertiary]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("roles.permissions.searchPlaceholder")}
            className="w-full rounded-md border border-[--hairline] bg-[--sunken] py-2 ps-9 pe-3 text-sm outline-none focus:border-[--signal] focus:ring-2 focus:ring-[--synapse]/30"
          />
        </div>
        <p className="text-sm text-[--ink-secondary]">
          {t("roles.permissions.selectedCount", {
            count: selectedCodes.length,
          })}
        </p>
      </div>

      {selectedCodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-md bg-[--sunken] p-2.5">
          {selectedCodes.slice(0, 8).map((code) => (
            <span
              key={code}
              className="rounded-md bg-[--panel] px-2 py-0.5 font-mono text-xs text-[--ink-secondary] shadow-sm"
            >
              {code}
            </span>
          ))}
          {selectedCodes.length > 8 && (
            <span className="rounded-md bg-[--signal]/10 px-2 py-0.5 text-xs font-medium text-[--signal]">
              +{selectedCodes.length - 8}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {groups.length === 0 ? (
          <p className="py-6 text-center text-sm text-[--ink-tertiary]">
            {t("roles.permissions.noResults")}
          </p>
        ) : (
          groups.map(({ module, permissions }) => (
            <PermissionModuleGroup
              key={module}
              module={module}
              permissions={permissions}
              selectedCodes={selectedSet}
              lockedBy={lockedBy}
              onToggle={toggle}
              onSelectAll={selectAll}
              onClearAll={clearAll}
            />
          ))
        )}
      </div>
    </div>
  );
}