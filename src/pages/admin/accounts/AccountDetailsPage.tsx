// src/pages/admin/accounts/AccountDetailsPage.tsx
//
// Hero header + General Information + Financial Summary + Hierarchy +
// Child Accounts + Activity Timeline placeholder. No Drawer anywhere.
//
// Edit is INLINE on this page (Code/Name/Active toggle become editable
// in place), not a separate route — per the design doc's recommendation:
// Update's real payload is only 3 fields, 2 of which (Type, Parent) can
// never change, so a dedicated /edit route would be thinner than it's
// worth. Type and Parent render as plain read-only text in edit mode
// (not disabled inputs), with an explicit note that they can't change —
// honest about permanence rather than implying a conditional edit.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Pencil, Lock } from "lucide-react";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { AccountTypeBadge } from "../../../components/common/AccountTypeBadge";
import { AccountBalanceCard } from "../../../components/admin/accounts/AccountBalanceCard";
import { AccountHierarchyPath } from "../../../components/admin/accounts/AccountHierarchyPath";
import { ChildAccountsTable } from "../../../components/admin/accounts/ChildAccountsTable";
import { ActivityTimelinePlaceholder } from "../../../components/admin/accounts/ActivityTimelinePlaceholder";
import { AccountDeleteDialog } from "../../../components/admin/accounts/AccountDeleteDialog";

import {
  useAccount,
  useAccountsList,
  useAccountBalance,
  useUpdateAccount,
  useDeleteAccount,
} from "../../../hooks/useAccounts.crud";
import { hasAnyPermission } from "@/utils/permissions";
import toast from "react-hot-toast";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface EditFormState {
  code: string;
  name: string;
  isActive: boolean;
}

export function AccountDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  let { data: account, isLoading, isError, refetch } = useAccount(id);
  const { data: allAccounts = [] } = useAccountsList(); // for parent lookup + children
  const { data: balance, isLoading: isBalanceLoading } = useAccountBalance(id, !!id);


  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();
  const canManageAccess = hasAnyPermission(["accounting.accounts.manage"]);


  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (account && !isEditing) {
      setForm({ code: account.code, name: account.name, isActive: account.isActive });
    }
  }, [account, isEditing]);

  const parent = account?.parentAccountId
    ? allAccounts.find((a) => a.id === account.parentAccountId)
    : null;
  const children = account ? allAccounts.filter((a) => a.parentAccountId === account.id) : [];
  const hasChildren = children.length > 0;

  const requiresTypedConfirmation =
    !!balance && (balance.totalDebit !== 0 || balance.totalCredit !== 0 || balance.balance !== 0);

  function handleDeleteClick() {
    if (hasChildren) return; // trigger itself is disabled in this case — see the button below
    setIsDeleteOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!account) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(account.id);
      navigate("/accounting/accounts");
      toast.success(t("accounts.success.deleted", {
        name: form?.name
      }))
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSetActive(active: boolean) {
    if (!account) return;
    setLoading(true)
    try {
      await updateMutation.mutateAsync({ id: account.id, code: account.code, name: account.name, isActive: active });
      refetch();
    } finally {
      setLoading(false)
    }
  }

  function handleCancelEdit() {
    if (account) setForm({ code: account.code, name: account.name, isActive: account.isActive });
    setIsEditing(false);
  }

  async function handleSaveEdit() {
    if (!account || !form) return;
    setLoading(true)
    try {
      await updateMutation.mutateAsync({ id: account.id, ...form });
      setIsEditing(false);
      toast.success(t("accounts.success.updated", {
        name: form.name
      }))
      refetch();
    }catch(error){
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors);
      }
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !form) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-16 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        <div className="h-16 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        <div className="h-48 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
        <div className="h-48 animate-pulse rounded-[16px] bg-[var(--sunken)]" />
      </div>
    );
  }

  if (isError || !account) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-medium text-[var(--ink-primary)]">{t("accounts.details.notFound")}</p>
        <button
          type="button"
          onClick={() => navigate("/accounting/accounts")}
          className="text-sm text-[var(--signal)] hover:text-[var(--signal-hover)]"
        >
          {t("accounts.details.backToList")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Hero header */}
      <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
        <button
          type="button"
          onClick={() => navigate("/accounting/accounts")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
        >
          <ArrowLeft size={15} className="rtl:rotate-180" />
          {t("accounts.details.back")}
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-[var(--ink-primary)]">{account.name}</h1>
              <span className="font-mono text-sm text-[var(--ink-tertiary)]">{account.code}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <AccountTypeBadge accountType={account.accountType} size="md" />
              <StatusBadge
                status={account.isActive ? "active" : "inactive"}
                label={account.isActive ? t("users.status.active") : t("users.status.inactive")}
                size="md"
              />
            </div>
          </div>

          {
            canManageAccess && (
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
                  >
                    <Pencil size={14} />
                    {t("accounts.actions.edit")}
                  </button>
                )}
                {account.isActive ? (
                  <button
                    type="button"
                    onClick={() => handleSetActive(false)}
                    disabled={loading}
                    className="rounded-[10px] disabled:cursor-not-allowed border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
                  >
                    {loading ? t("users.roles.saving") : t("accounts.actions.activate")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetActive(true)}
                    disabled={loading}
                    className="rounded-[10px] border disabled:cursor-not-allowed border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
                  >
                    {loading ? t("users.roles.saving") : t("accounts.actions.activate")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={hasChildren}
                  title={hasChildren ? t("accounts.dialogs.delete.blockedHasChildren") : undefined}
                  className="rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  {t("accounts.actions.delete")}
                </button>
              </div>
            )
          }

        </div>
      </div>

      {/* Section 1 — General Information */}
      <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("accounts.details.sections.general")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("accounts.create.fields.code")}
            </label>
            {isEditing ? (
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 font-mono text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />
            ) : (
              <p className="font-mono text-sm text-[var(--ink-primary)]">{account.code}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("accounts.create.fields.name")}
            </label>
            {isEditing ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
              />
            ) : (
              <p className="text-sm text-[var(--ink-primary)]">{account.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--ink-primary)]">
              {t("accounts.create.fields.type")}
              {isEditing && <Lock size={12} className="text-[var(--ink-tertiary)]" />}
            </label>
            <p className="text-sm text-[var(--ink-primary)]">{account.accountType}</p>
            {isEditing && (
              <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                {t("accounts.details.typeCannotChange")}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[var(--ink-primary)]">
              {t("accounts.create.fields.parentAccount")}
              {isEditing && <Lock size={12} className="text-[var(--ink-tertiary)]" />}
            </label>
            <p className="text-sm text-[var(--ink-primary)]">
              {parent ? parent.name : t("accounts.details.noParent")}
            </p>
            {isEditing && (
              <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
                {t("accounts.details.parentCannotChange")}
              </p>
            )}
          </div>

          {isEditing && (
            <label className="flex items-center gap-2 text-sm text-[var(--ink-primary)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded-[4px] border-[var(--hairline)]"
              />
              {t("users.status.active")}
            </label>
          )}
        </div>

        {isEditing && (
          <div className="mt-5 flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
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
              disabled={loading}
              className="rounded-[10px] disabled:cursor-not-allowed bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
            >
              {loading ? t("users.roles.saving") : t("users.actions.save")}
            </button>
          </div>
        )}
      </section>

      {/* Section 2 — Financial Summary */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-[var(--ink-primary)]">
          {t("accounts.details.sections.financial")}
        </h2>
        <AccountBalanceCard
          totalDebit={balance?.totalDebit ?? 0}
          totalCredit={balance?.totalCredit ?? 0}
          balance={balance?.balance ?? 0}
          isLoading={isBalanceLoading}
        />
      </section>

      {/* Section 3 — Hierarchy */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-[var(--ink-primary)]">
          {t("accounts.details.sections.hierarchy")}
        </h2>
        <AccountHierarchyPath
          parent={parent ? { id: parent.id, code: parent.code, name: parent.name } : null}
          current={{ code: account.code, name: account.name }}
          childrenCount={children.length}
        />
      </section>

      {/* Section 4 — Child Accounts */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-[var(--ink-primary)]">
          {t("accounts.details.sections.children")}
        </h2>
        <ChildAccountsTable
          rows={children.map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            accountType: c.accountType,
            isActive: c.isActive,
          }))}
        />
      </section>

      {/* Section 5 — Activity Timeline (placeholder) */}
      {/* <section>
        <h2 className="mb-3 text-base font-semibold text-[var(--ink-primary)]">
          {t("accounts.details.sections.activity")}
        </h2>
        <ActivityTimelinePlaceholder />
      </section> */}

      <AccountDeleteDialog
        open={isDeleteOpen}
        accountName={account.name}
        accountCode={account.code}
        requiresTypedConfirmation={requiresTypedConfirmation}
        isSubmitting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
