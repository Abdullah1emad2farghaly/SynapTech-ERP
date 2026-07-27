// Project path: src/pages/admin/roles/RolesListPage.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRoles, usePermissionsCatalog } from "../../../hooks/useRoles";
import { RolesStatsCards } from "../../../components/admin/roles/RolesStatsCards";
import {
  RolesToolbar,
  type RolesSortOption,
} from "../../../components/admin/roles/RolesToolbar";
import { RolesDataTable } from "../../../components/admin/roles/RolesDataTable";
import { CreateRoleDrawer } from "../../../components/admin/roles/CreateRoleDrawer";
import { EditRoleDrawer } from "../../../components/admin/roles/EditRoleDrawer";
import { ManagePermissionsDrawer } from "../../../components/admin/roles/ManagePermissionsDrawer";
import { DeleteRoleDialog } from "../../../components/admin/roles/DeleteRoleDialog";
import type { RoleResponse } from "../../../types/roles.types";

type DrawerState =
  | { type: "create" }
  | { type: "duplicate"; role: RoleResponse }
  | { type: "edit"; role: RoleResponse }
  | { type: "managePermissions"; role: RoleResponse }
  | { type: "delete"; role: RoleResponse }
  | null;

export function RolesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: roles = [], isLoading, isFetching, refetch } = useRoles();
  const { data: catalog = [] } = usePermissionsCatalog();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<RolesSortOption>("nameAsc");
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const visibleRoles = useMemo(() => {
    let result = roles;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sort === "nameAsc") return a.name.localeCompare(b.name);
      if (sort === "nameDesc") return b.name.localeCompare(a.name);
      return b.permissions.length - a.permissions.length;
    });
  }, [roles, search, sort]);

  return (
    <div className="flex flex-col gap-6 md:p-6 py-6 px-2">
      <div>
        <h1 className="text-2xl font-semibold text-[--ink-primary]">
          {t("roles.page.title")}
        </h1>
        <p className="mt-1 text-sm text-[--ink-secondary]">
          {t("roles.page.description")}
        </p>
      </div>

      <RolesStatsCards
        roles={roles}
        permissionsCatalog={catalog}
        isLoading={isLoading}
      />

      <RolesToolbar
        searchValue={search}
        onSearchChange={setSearch}
        sortValue={sort}
        onSortChange={setSort}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        onCreateRole={() => setDrawer({ type: "create" })}
      />

      <RolesDataTable
        roles={visibleRoles}
        isLoading={isLoading}
        onView={(role) => navigate(`/organization/roles/${role.id}`)}
        onEdit={(role) => setDrawer({ type: "edit", role })}
        onManagePermissions={(role) =>
          setDrawer({ type: "managePermissions", role })
        }
        onDuplicate={(role) => setDrawer({ type: "duplicate", role })}
        onDelete={(role) => setDrawer({ type: "delete", role })}
      />

      <CreateRoleDrawer
        open={drawer?.type === "create" || drawer?.type === "duplicate"}
        onClose={() => setDrawer(null)}
        duplicateFrom={
          drawer?.type === "duplicate" ? drawer.role : undefined
        }
      />

      <EditRoleDrawer
        role={drawer?.type === "edit" ? drawer.role : null}
        open={drawer?.type === "edit"}
        onClose={() => setDrawer(null)}
      />

      <ManagePermissionsDrawer
        role={drawer?.type === "managePermissions" ? drawer.role : null}
        open={drawer?.type === "managePermissions"}
        onClose={() => setDrawer(null)}
      />

      <DeleteRoleDialog
        role={drawer?.type === "delete" ? drawer.role : null}
        open={drawer?.type === "delete"}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}
