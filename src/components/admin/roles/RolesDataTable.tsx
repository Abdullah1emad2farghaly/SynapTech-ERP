// Project path: src/components/admin/roles/RolesDataTable.tsx
//
// Built on the shared generic DataTable shell. Columns are Role / Description /
// Permissions / Actions only — Status and Last Updated are cut (no backing
// field on RoleResponse; see handoff notes).

import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { PermissionPreviewChips } from "./PermissionPreviewChips";
import { RoleActionMenu } from "./RoleActionMenu";
import type { RoleResponse } from "../../../types/roles.types";

interface RolesDataTableProps {
  roles: RoleResponse[];
  isLoading: boolean;
  onView: (role: RoleResponse) => void;
  onEdit: (role: RoleResponse) => void;
  onManagePermissions: (role: RoleResponse) => void;
  onDuplicate: (role: RoleResponse) => void;
  onDelete: (role: RoleResponse) => void;
}

export function RolesDataTable({
  roles,
  isLoading,
  onView,
  onEdit,
  onManagePermissions,
  onDuplicate,
  onDelete,
}: RolesDataTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<RoleResponse>[] = [
    {
      id: "name",
      header: t("roles.table.role"),
      cell: (role) => (
        <button
          type="button"
          onClick={() => onView(role)}
          className="flex items-center gap-3 text-start"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[--signal]/10 text-[--signal]">
            <ShieldCheck size={16} />
          </span>
          <span className="font-medium text-[--ink-primary] hover:text-[--signal]">
            {role.name}
          </span>
        </button>
      ),
    },
    {
      id: "description",
      header: t("roles.table.description"),
      cell: (role) => (
        <span className="line-clamp-1 text-sm text-[--ink-secondary]">
          {role.description}
        </span>
      ),
    },
    {
      id: "permissions",
      header: t("roles.table.permissions"),
      cell: (role) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[--ink-tertiary]">
            {t("roles.table.permissionsCount", {
              count: role.permissions.length,
            })}
          </span>
          <PermissionPreviewChips permissionCodes={role.permissions} />
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (role) => (
        <RoleActionMenu
          role={role}
          onView={onView}
          onEdit={onEdit}
          onManagePermissions={onManagePermissions}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={roles}
      getRowId={(role) => role.id}
      isLoading={isLoading}
      skeletonRowCount={6}
      emptyState={
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <ShieldCheck size={32} className="text-[--ink-tertiary]" />
          <p className="font-medium text-[--ink-primary]">
            {t("roles.empty.title")}
          </p>
          <p className="max-w-sm text-sm text-[--ink-secondary]">
            {t("roles.empty.description")}
          </p>
        </div>
      }
    />
  );
}
