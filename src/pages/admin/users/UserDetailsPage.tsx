// src/pages/admin/users/UserDetailsPage.tsx
//
// Single-record read view with inline Edit mode, matching PUT /api/Users/{id}
// exactly (Full Name, Branch, Department, Active Status). Email is never
// editable and Roles never appear in edit mode — both stay visually locked
// even while the rest of the page is editing, so the boundary between
// "Update User" and "Assign Roles" (its own drawer, its own endpoint)
// is never ambiguous. Sections ordered per the module design doc: Basic
// Information, Contact Information, Organization, Roles, Status.
//
// ASSUMPTION: hook names (useUser, useUpdateUser) inferred per the
// project's stated convention. Wire to your actual hooks/useUsers.ts.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Lock } from "lucide-react";
import { Avatar } from "../../../components/common/Avatar";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { RoleBadge } from "../../../components/admin/users/RoleBadge";
import { UserActionMenu } from "../../../components/admin/users/UserActionMenu";
import { RoleAssignmentDrawer } from "../../../components/admin/users/RoleAssignmentDrawer";

import { useUser, useUpdateUser, useDeleteUser, useAssignRoles } from "../../../hooks/useUsers";
import { useBranches } from "../../../hooks/useBranches";
import { useDepartments } from "../../../hooks/useDepartments";
import { useRoles } from "../../../hooks/useRoles";
import { User } from "@/types/users.types";

interface EditFormState {
  fullName: string;
  branchId: string;
  departmentId: string;
}

export function UserDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading, isError, refetch } = useUser(id!);
  const { data: branchOptions = [] } = useBranches();
  const { data: departmentOptions = [] } = useDepartments();
  const { data: roleOptions = [] } = useRoles();

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const assignRolesMutation = useAssignRoles();

  const [isEditing, setIsEditing] = useState(false);
  const [roleDrawerOpen, setRoleDrawerOpen] = useState(false);
  const [form, setForm] = useState<EditFormState | null>(null);

  useEffect(() => {
    if (user && !isEditing) {
      setForm({
        fullName: user.fullName,
        branchId: user.branchId,
        departmentId: user.departmentId,
      });
    }
  }, [user, isEditing]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-20 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        <div className="h-20 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        <div className="h-20 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        <div className="h-20 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        <div className="h-20 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        <div className="h-20 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-medium text-[var(--ink-primary)]">
          {t("users.details.notFound")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("users.details.backToList")}
        </button>
      </div>
    );
  }

  async function handleSetActive(user: User) {
    await updateUserMutation.mutateAsync({ ...user, isActive: !user.isActive });
    refetch();
  }

  async function handleDelete(userId: string) {
    await deleteUserMutation.mutateAsync(userId);
  }

  async function handleSaveEdit() {
    if (!form) return;
    await updateUserMutation.mutateAsync({
      id: user ? user.id : '',
      fullName: form.fullName,
      branchId: form.branchId,
      departmentId: form.departmentId,
      isActive: user?.isActive,
    });
    setIsEditing(false);
    refetch();
  }

  function handleCancelEdit() {
    setForm({ fullName: user? user.fullName: '', branchId: user? user.branchId: '', departmentId: user? user.departmentId: '' });
    setIsEditing(false);
  }

  const branchName = branchOptions.find((b) => b.value === user.branchId)?.label ?? "———";
  const departmentName =
    departmentOptions.find((d) => d.value === user.departmentId)?.label ?? "———";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header band */}
      <div className="flex items-start justify-between rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} size="lg" />
          <div>
            <h1 className="text-lg font-semibold text-[var(--ink-primary)]">{user.fullName}</h1>
            <p className="text-sm text-[var(--ink-tertiary)]">{user.email}</p>
            <div className="mt-1">
              <StatusBadge
                status={user.isActive ? "active" : "inactive"}
                label={user.isActive ? t("users.status.active") : t("users.status.inactive")}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              {t("users.actions.edit")}
            </button>
          )}
          <UserActionMenu
            userId={user.id}
            userName={user.fullName}
            isActive={user}
            onAssignRoles={() => setRoleDrawerOpen(true)}
            onSetActive={handleSetActive}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {/* Basic Information */}
        <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.basicInfo")}
          </h2>
          {isEditing && form ? (
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full max-w-sm rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />
          ) : (
            <p className="text-sm text-[var(--ink-primary)]">{user.fullName}</p>
          )}
        </section>

        {/* Contact Information */}
        <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.contactInfo")}
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-[var(--ink-primary)]">{user.email}</p>
            <span
              className="flex items-center gap-1 text-xs text-[var(--ink-tertiary)]"
              title={t("users.details.emailNotEditable")}
            >
              <Lock size={12} aria-hidden="true" />
              {t("users.details.emailNotEditable")}
            </span>
          </div>
        </section>

        {/* Organization */}
        <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.organization")}
          </h2>
          {isEditing && form ? (
            <div className="grid max-w-md grid-cols-2 gap-3">
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
              >
                {branchOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={form?.departmentId || ""}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
              >
                {departmentOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm text-[var(--ink-primary)]">
              <p>{branchName}</p>
              <p>{departmentName}</p>
            </div>
          )}
        </section>

        {/* Roles — never editable here, always via its own drawer */}
        <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
              {t("users.details.sections.roles")}
            </h2>
            <button
              type="button"
              onClick={() => setRoleDrawerOpen(true)}
              className="text-xs font-medium text-[var(--signal)] hover:text-[var(--signal-hover)]"
            >
              {t("users.actions.assignRoles")}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.roles.map((role: string) => (
              <RoleBadge key={role} label={role} size="md" />
            ))}
          </div>
        </section>

        {/* Status */}
        <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
            {t("users.details.sections.status")}
          </h2>
          <div className="flex items-center justify-between">
            <StatusBadge
              status={user.isActive ? "active" : "inactive"}
              label={user.isActive ? t("users.status.active") : t("users.status.inactive")}
              size="md"
            />
          </div>
        </section>
      </div>

      {isEditing && (
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[var(--hairline)] bg-[var(--canvas)] py-3">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t("users.actions.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSaveEdit}
            className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
          >
            {t("users.actions.save")}
          </button>
        </div>
      )}

      <RoleAssignmentDrawer
        open={roleDrawerOpen}
        onClose={() => setRoleDrawerOpen(false)}
        userId={user.id}
        userName={user.fullName}
        currentRoleIds={user.roles}
        roleOptions={roleOptions}
        onSubmit={async (userId, roleIds) => {
          await assignRolesMutation.mutateAsync({ id: userId, roleIds });
          setRoleDrawerOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
