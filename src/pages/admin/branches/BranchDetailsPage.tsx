// src/pages/admin/organization/branches/BranchDetailsPage.tsx
//
// Replaces the removed BranchDetailsDrawer. The page only composes
// components and hooks — no API calls happen here directly, all data
// comes through useBranch / useBranchDepartments / useUsers, and all
// mutations go through the existing branches/users CRUD hooks.
//
// Delete-blocked logic mirrors BranchActionMenu's reasoning (blocked if
// Departments or Users reference this branch), but computes the Users
// check more cheaply than BranchesPage does: rather than pulling the
// entire Users list, this only asks for pageSize: 1 filtered by
// branchId and reads totalCount — enough to know "does at least one
// user reference this branch" without fetching them all. Worth
// backporting to BranchesPage's own delete-guard at some point (it
// currently pulls the full list for the same purpose).

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { ConfirmationDialog } from "../../../components/common/ConfirmationDialog";
import { BranchHeader } from "../../../components/admin/branches/BranchHeader";
import { BranchInformationCard } from "../../../components/admin/branches/BranchInformationCard";
import { DepartmentsSection } from "../../../components/admin/branches/DepartmentsSection";
import { BranchDrawer, type BranchFormValues } from "../../../components/admin/branches/BranchDrawer";

import { useBranch } from "../../../hooks/useBranch";
import { useBranchDepartments } from "../../../hooks/useBranchDepartments";
import { useUpdateBranch, useDeleteBranch } from "../../../hooks/useBranches.crud";
import { useUsers } from "../../../hooks/useUsers";
import { useUpdateUser, useDeleteUser } from "../../../hooks/useUsers";

function BranchHeaderSkeleton() {
  return (
    <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
      <div className="mb-4 h-4 w-24 animate-pulse rounded-[4px] bg-[var(--sunken)]" />
      <div className="h-6 w-56 animate-pulse rounded-[4px] bg-[var(--sunken)]" />
      <div className="mt-3 h-5 w-32 animate-pulse rounded-[4px] bg-[var(--sunken)]" />
    </div>
  );
}

export function BranchDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: branch, isLoading, isError, refetch } = useBranch(id);
  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    refetch: refetchDepartments,
  } = useBranchDepartments(id);

  // pageSize: 1 — only need totalCount to know whether any user
  // references this branch, not the users themselves.
  const { data: usersCheck } = useUsers({
    searchText: "",
    filters: { branchId: id ?? null, departmentId: null, roleId: null, status: null },
    page: 1,
    pageSize: 1,
    // sortColumnId: null,
    sortDirection: null,
  });

  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const hasDepartments = departments.length > 0;
  const hasUsers = (usersCheck?.totalCount ?? 0) > 0;
  const deleteBlocked = hasDepartments || hasUsers;

  async function handleEditSubmit(values: BranchFormValues) {
    if (!branch) return;
    await updateBranchMutation.mutateAsync({ id: branch.id, ...values });
    setIsEditOpen(false);
    refetch();
  }

  async function handleDeleteConfirm() {
    if (!branch) return;
    setIsDeleting(true);
    try {
      await deleteBranchMutation.mutateAsync(branch.id);
      navigate("/organization/branches");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSetUserActive(userId: string, active: boolean) {
    await updateUserMutation.mutateAsync({ id: userId, isActive: active });
  }

  async function handleDeleteUser(userId: string) {
    await deleteUserMutation.mutateAsync(userId);
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-medium text-[var(--ink-primary)]">{t("branches.details.notFound")}</p>
        <button
          type="button"
          onClick={() => navigate("/organization/branches")}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("branches.details.backToList")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">

      {isLoading || !branch ? (
        <>
          <BranchHeaderSkeleton />
          <BranchHeaderSkeleton />
        </>
      ) : (
        <BranchHeader
          name={branch.name}
          code={branch.code}
          isActive={branch.isActive}
          isMain={branch.isMain}
          onBack={() => navigate("/organization/branches")}
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteConfirmOpen(true)}
          deleteDisabled={deleteBlocked}
          deleteDisabledReason={
            hasDepartments
              ? t("branches.dialogs.delete.blockedHasDepartments")
              : hasUsers
                ? t("branches.dialogs.delete.blockedHasUsers")
                : undefined
          }
        />
      )}

      {!isLoading && branch && <BranchInformationCard address={branch.address} phone={branch.phone} />}

      <DepartmentsSection
        departments={departments}
        isLoading={isDepartmentsLoading}
        hasError={isDepartmentsError}
        onRetry={() => refetchDepartments()}
        onSetUserActive={handleSetUserActive}
        onDeleteUser={handleDeleteUser}
      />

      {branch && (
        <BranchDrawer
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialValues={{
            id: branch.id,
            name: branch.name,
            code: branch.code,
            address: branch.address,
            phone: branch.phone,
            isMain: branch.isMain,
            isActive: branch.isActive,
          }}
          onSubmit={handleEditSubmit}
        />
      )}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        tone="destructive"
        title={t("branches.dialogs.delete.title")}
        body={
          branch?.isMain
            ? `${t("branches.dialogs.delete.body", { name: branch?.name })} ${t("branches.dialogs.delete.mainBranchWarning")}`
            : t("branches.dialogs.delete.body", { name: branch?.name })
        }
        confirmLabel={t("branches.actions.delete")}
        cancelLabel={t("users.actions.cancel")}
        isSubmitting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
}
