// src/pages/admin/accounts/AccountsListPage.tsx
//
// Wires AccountsTree + AccountPreviewPanel + AccountsKpiRow + toolbar
// together. Two-column desktop layout (tree left, preview right),
// stacks on mobile.
//
// UPDATED: Create is now an AccountDrawer opened from this page, not a
// navigation to /accounting/accounts/new — reversing the module design
// doc's original "pages, not drawers" call for Create specifically, per
// later direction. Edit still navigates to /accounting/accounts/:id
// (inline edit mode there) — that part is unchanged, since Edit's field
// set (code/name/isActive) is small enough that inline-on-Details still
// makes more sense than either a drawer or a route.
//
// Delete-blocked (has children) is computed client-side from the full
// loaded list, same technique as Departments' childIdsByParent. The
// typed-confirmation-required check fetches the target account's
// balance on demand when the delete dialog opens — not eagerly for
// every row, consistent with the rest of this module's balance rules.
//
// ASSUMPTION: hook names per this project's established convention.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { RefreshCw, Search } from "lucide-react";
import { AccountsKpiRow, type TypeCount } from "../../../components/admin/accounts/AccountsKpiRow";
import { AccountsTree, type AccountRow } from "../../../components/admin/accounts/AccountsTree";
import {
  AccountPreviewPanel,
  type AccountPreviewData,
} from "../../../components/admin/accounts/AccountPreviewPanel";
import { AccountDeleteDialog } from "../../../components/admin/accounts/AccountDeleteDialog";
import { AccountDrawer } from "../../../components/admin/accounts/AccountDrawer";

import {
  useAccountsList,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useAccountBalance,
  useAccountTypes,
} from "../../../hooks/useAccounts.crud";
import { AccountTypes } from "@/services/api/accounts.crud.api";

export function AccountsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | null>(null);
  const [rootOnly, setRootOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: accounts = [], isLoading, isError, refetch } = useAccountsList();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();
  const { data: accountTypes = [] } = useAccountTypes();

  const accountById = useMemo(() => {
    const map = new Map<string, (typeof accounts)[number]>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const childCountById = useMemo(() => {
    const map = new Map<string, number>();
    accounts.forEach((a) => {
      if (!a.parentAccountId) return;
      map.set(a.parentAccountId, (map.get(a.parentAccountId) ?? 0) + 1);
    });
    return map;
  }, [accounts]);


  const typeCounts: TypeCount[] = useMemo(() => {
    const counts = new Map<string, number>();
    accountTypes?.forEach((type) => counts.set(type.value, 0)); // ensure every known type shows a card, even at 0
    accounts.forEach((a) => counts.set(a.accountType, (counts.get(a.accountType) ?? 0) + 1));
    // Fixed order (matches ACCOUNT_TYPES) rather than sorted by frequency —
    // now that the type set is known and stable, a stable KPI order reads
    // better than one that reshuffles as data changes.
    return accountTypes.map((type) => ({ accountType: type.value, count: counts.get(type.value) ?? 0 }));
  }, [accounts]);

  const filteredRows: AccountRow[] = useMemo(() => {
    return accounts
      .filter((a) => {
        if (typeFilter && a.accountType !== typeFilter) return false;
        if (statusFilter === "active" && !a.isActive) return false;
        if (statusFilter === "inactive" && a.isActive) return false;
        if (rootOnly && a.parentAccountId) return false;
        return true;
      })
      .map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        accountType: a.accountType,
        parentAccountId: a.parentAccountId,
        isActive: a.isActive,
      }));
  }, [accounts, typeFilter, statusFilter, rootOnly]);

  const kpis = useMemo(
    () => ({
      total: accounts.length,
      active: accounts.filter((a) => a.isActive).length,
      inactive: accounts.filter((a) => !a.isActive).length, 
      root: accounts.filter((a) => !a.parentAccountId).length,
      child: accounts.filter((a) => !!a.parentAccountId).length,
    }),
    [accounts],
  );

  const selectedAccount = selectedId ? accountById.get(selectedId) : undefined;
  const previewData: AccountPreviewData | null = selectedAccount
    ? {
        id: selectedAccount.id,
        code: selectedAccount.code,
        name: selectedAccount.name,
        accountType: selectedAccount.accountType,
        isActive: selectedAccount.isActive,
        parentAccountName: selectedAccount.parentAccountId
          ? (accountById.get(selectedAccount.parentAccountId)?.name ?? null)
          : null,
      }
    : null;

  const deleteTarget = deleteTargetId ? accountById.get(deleteTargetId) : undefined;
  const { data: deleteTargetBalance } = useAccountBalance(deleteTargetId ?? undefined, !!deleteTargetId);
  const deleteRequiresTypedConfirmation =
    !!deleteTargetBalance &&
    (deleteTargetBalance.totalDebit !== 0 ||
      deleteTargetBalance.totalCredit !== 0 ||
      deleteTargetBalance.balance !== 0);

  async function handleSetActive(id: string, active: boolean) {
    const current = accountById.get(id);
    if (!current) return;
    await updateMutation.mutateAsync({
      id,
      code: current.code,
      name: current.name,
      isActive: active,
    });
    refetch();
  }

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deleteTargetId);
      if (selectedId === deleteTargetId) setSelectedId(null);
      setDeleteTargetId(null);
      refetch();
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDeleteRequest(id: string) {
    const hasChildren = (childCountById.get(id) ?? 0) > 0;
    if (hasChildren) {
      toast.error(t("accounts.dialogs.delete.blockedHasChildren"));
      return;
    }
    setDeleteTargetId(id);
  }

  async function handleCreateSubmit(values: {
    code: string;
    name: string;
    accountType: string;
    parentAccountId: string | null;
  }) {
    await createMutation.mutateAsync(values);
    setIsCreateOpen(false);
    refetch();
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
            {t("accounts.list.title")}
          </h1>
          <p className="text-sm text-[var(--ink-tertiary)]">
            {t("accounts.list.subtitleCount", { count: kpis.total })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)]"
        >
          {t("accounts.list.createAccount")}
        </button>
      </div>

      <AccountsKpiRow
        total={kpis.total}
        active={kpis.active}
        inactive={kpis.inactive}
        root={kpis.root}
        child={kpis.child}
        typeCounts={typeCounts}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--ink-tertiary)]"
          />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("accounts.list.search.placeholder")}
            className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] py-2 ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter ?? ""}
            onChange={(e) => setTypeFilter(e.target.value || null)}
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("accounts.list.filters.type")}</option>
            {accountTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.value}
              </option>
            ))}
          </select>

          <select
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter((e.target.value || null) as "active" | "inactive" | null)
            }
            className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)]"
          >
            <option value="">{t("accounts.list.filters.status")}</option>
            <option value="active">{t("users.status.active")}</option>
            <option value="inactive">{t("users.status.inactive")}</option>
          </select>

          <label className="flex items-center gap-1.5 text-sm text-[var(--ink-primary)]">
            <input
              type="checkbox"
              checked={rootOnly}
              onChange={(e) => setRootOnly(e.target.checked)}
              className="h-4 w-4 rounded-[4px] border-[var(--hairline)]"
            />
            {t("accounts.list.filters.rootOnly")}
          </label>

          <button
            type="button"
            onClick={() => refetch()}
            aria-label={t("common.actions.retry")}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_1fr]">
        <AccountsTree
          rows={filteredRows}
          isLoading={isLoading}
          hasError={isError}
          onRetry={() => refetch()}
          searchQuery={searchText}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <AccountPreviewPanel
          account={previewData}
          onOpenDetails={(id) => navigate(`/accounting/accounts/${id}`)}
          onEdit={(id) => navigate(`/accounting/accounts/${id}`)}
          onSetActive={handleSetActive}
          onDelete={handleDeleteRequest}
        />
      </div>

      <AccountDeleteDialog
        open={!!deleteTargetId}
        accountName={deleteTarget?.name ?? ""}
        accountCode={deleteTarget?.code ?? ""}
        requiresTypedConfirmation={deleteRequiresTypedConfirmation}
        isSubmitting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />

      <AccountDrawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        allAccounts={accounts.map((a) => ({
          id: a.id,
          code: a.code,
          name: a.name,
          accountType: a.accountType,
          parentAccountId: a.parentAccountId,
        }))}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}
