// Project path: src/pages/admin/roles/RoleDetailsPage.tsx
// Route: /organization/roles/:id

import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Pencil, KeyRound, Trash2, Clock } from "lucide-react";
import { useRole } from "../../../hooks/useRoles";
import { EditRoleDrawer } from "../../../components/admin/roles/EditRoleDrawer";
import { ManagePermissionsDrawer } from "../../../components/admin/roles/ManagePermissionsDrawer";
import { DeleteRoleDialog } from "../../../components/admin/roles/DeleteRoleDialog";

export function RoleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: role, isLoading } = useRole(id);

  const [editOpen, setEditOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const groupedPermissions = useMemo(() => {
    // Details page only has the role's flat permission-code list (RoleResponse
    // doesn't include each permission's module/description) — group is by
    // splitting on the code's leading segment (e.g. "Users.Read" -> "Users")
    // as a readable fallback until the catalog is cross-referenced.
    if (!role) return [];
    const byModule = new Map<string, string[]>();
    for (const code of role.permissions) {
      const module = code.split(".")[0] || code;
      const list = byModule.get(module) ?? [];
      list.push(code);
      byModule.set(module, list);
    }
    return Array.from(byModule.entries());
  }, [role]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[--sunken]" />
        <div className="h-40 animate-pulse rounded-lg bg-[--sunken]" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="p-6 text-center text-sm text-[--ink-secondary]">
        {t("roles.details.notFound")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:p-6 py-6 px-2">
      <button
        type="button"
        onClick={() => navigate("/administration/roles")}
        className="flex w-fit items-center gap-1.5 text-sm text-[--ink-secondary] hover:text-[--ink-primary]"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("roles.details.back")}
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[--ink-primary]">
            {role.name}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[--ink-secondary]">
            {role.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPermissionsOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
          >
            <KeyRound size={15} />
            {t("roles.actions.managePermissions")}
          </button>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--ink-primary] hover:bg-[--sunken]"
          >
            <Pencil size={15} />
            {t("roles.actions.edit")}
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[--hairline] px-3 py-2 text-sm font-medium text-[--error] hover:bg-[--error]/5"
          >
            <Trash2 size={15} />
            {t("roles.actions.delete")}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[--hairline] bg-[--panel] p-5">
        <p className="text-sm text-[--ink-secondary]">
          {t("roles.details.permissionsCount", {
            count: role.permissions.length,
          })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[--ink-primary]">
          {t("roles.details.assignedPermissions")}
        </h2>

        {groupedPermissions.length === 0 ? (
          <p className="text-sm text-[--ink-tertiary]">
            {t("roles.table.noPermissions")}
          </p>
        ) : (
          groupedPermissions.map(([module, codes]) => (
            <div
              key={module}
              className="overflow-hidden rounded-lg border border-[--hairline]"
            >
              <div className="bg-[--sunken] px-4 py-2 text-sm font-medium text-[--ink-primary]">
                {module}
              </div>
              <div className="flex flex-wrap gap-2 p-3">
                {codes.map((code) => (
                  <span
                    key={code}
                    className="rounded-md bg-[--sunken] px-2 py-1 font-mono text-xs text-[--ink-secondary]"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity is explicitly out of scope — no audit/activity endpoint exists yet. */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-[--hairline] p-4 text-sm text-[--ink-tertiary]">
        <Clock size={16} />
        {t("roles.details.activityComingSoon")}
      </div>

      <EditRoleDrawer role={role} open={editOpen} onClose={() => setEditOpen(false)} />
      <ManagePermissionsDrawer
        role={role}
        open={permissionsOpen}
        onClose={() => setPermissionsOpen(false)}
      />
      <DeleteRoleDialog
        role={role}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
