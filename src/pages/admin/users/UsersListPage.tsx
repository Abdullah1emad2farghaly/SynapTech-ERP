

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { RefreshCw, Columns3 } from "lucide-react";
import { UsersDataTable, type UserRow } from "../../../components/admin/users/UsersDataTable";
import { UserActionMenu } from "../../../components/admin/users/UserActionMenu";
import { CreateUserDrawer } from "../../../components/admin/users/CreateUserDrawer";
import { RoleAssignmentDrawer } from "../../../components/admin/users/RoleAssignmentDrawer";
import {
  AdvancedSearchPanel,
  EMPTY_FILTERS,
  type UsersFilters,
} from "../../../components/admin/users/AdvancedSearchPanel";
import { BulkActionsToolbar } from "../../../components/admin/users/BulkActionsToolbar";
import { DataTablePagination, type SortDirection } from "../../../components/common/DataTable";

// Replace these with the project's actual hooks.
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAssignRoles,
} from "@/hooks/useUsers";

import { useBranches } from "../../../hooks/useBranches";
import { useDepartments } from "../../../hooks/useDepartments";
import { useRoles } from "../../../hooks/useRoles";
import { User } from "@/types/users.types";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";
import toast from "react-hot-toast";

const DEFAULT_PAGE_SIZE = 25;

export function UsersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<UsersFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hiddenColumnIds, setHiddenColumnIds] = useState<string[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [roleDrawerUser, setRoleDrawerUser] = useState<UserRow | null>(null);

  const isFiltered =
    searchText.trim().length > 0 ||
    Object.values(filters).some((v) => v !== null);

  const { data, isLoading, isError, refetch } = useUsers({
    searchText,
    filters,
    page,
    pageSize,
    // sortColumnId,
    sortDirection,
  });

  const { data: branchOptions = [] } = useBranches();
  const { data: departmentOptions = [] } = useDepartments();
  const { data: roleOptions = [] } = useRoles();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const assignRolesMutation = useAssignRoles();

  const rows: User[] = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const roleIdsByUser = useMemo(() => {
    const map = new Map<string, string[]>();
    rows.forEach((row) => map.set(row.id, row.roles));
    return map;
  }, [rows]);

  function handleClearFilters() {
    setSearchText("");
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  async function handleCreateSubmit(values: {
    fullName: string;
    email: string;
    branchId: string | null;
    departmentId: string | null;
    roleNames: string[];
  }) {
    try {
      await createUserMutation.mutateAsync(values);
      setCreateOpen(false);
      refetch();
      toast.success(t("users.create.success",{
        name: values.fullName
      }))
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors);
      }
    }
  }

  async function handleSetActive(user: User) {
    await updateUserMutation.mutateAsync({ ...user, isActive: !user.isActive });
    refetch();
  }

  async function handleDelete(userId: string) {
    await deleteUserMutation.mutateAsync(userId);
    refetch();
  }

  async function handleDeactivateSelected() {
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        updateUserMutation.mutateAsync({ id, isActive: false }),
      ),
    );
    refetch();
  }

  async function handleAssignRoles(userId: string, roleNames: string[]) {
    await assignRolesMutation.mutateAsync({ id: userId, roleNames });
    refetch();
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">
            {t("users.list.title")}
          </h1>
          <p className="text-sm text-[var(--ink-tertiary)]">
            {t("users.list.subtitleCount", { count: totalCount })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)]"
        >
          {t("users.list.createUser")}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
          placeholder={t("users.list.search.placeholder")}
          className="w-full max-w-sm rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
        />

        <div className="flex items-center gap-2">
          <AdvancedSearchPanel
            value={filters}
            onApply={(next) => {
              setFilters(next);
              setPage(1);
            }}
            branchOptions={branchOptions}
            departmentOptions={departmentOptions}
            roleOptions={roleOptions}
          />

          <button
            type="button"
            onClick={() =>
              setHiddenColumnIds((prev) =>
                prev.includes("branch") ? prev.filter((c) => c !== "branch") : [...prev, "branch"],
              )
            }
            aria-label={t("users.list.columnVisibility")}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            <Columns3 size={16} />
          </button>

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

      <BulkActionsToolbar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onDeactivateSelected={handleDeactivateSelected}
      />

      <UsersDataTable
        rows={rows}
        isLoading={isLoading}
        hasError={isError}
        onRetry={() => refetch()}
        onClearFilters={handleClearFilters}
        isFiltered={isFiltered}
        sortColumnId={sortColumnId}
        sortDirection={sortDirection}
        onSortChange={(columnId, direction) => {
          setSortColumnId(direction ? columnId : null);
          setSortDirection(direction);
        }}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => navigate(`${row.id}`)}
        hiddenColumnIds={hiddenColumnIds}
        renderRowActions={(row) => (
          <UserActionMenu
            userId={row.id}
            userName={row.fullName}
            isActive={row}
            onAssignRoles={() => setRoleDrawerUser(row)}
            onSetActive={handleSetActive}
            onDelete={handleDelete}
          />
        )}
      />

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <CreateUserDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        branchOptions={branchOptions}
        departmentOptions={departmentOptions}
        roleOptions={roleOptions}
      />

      {roleDrawerUser && (
        <RoleAssignmentDrawer
          open={!!roleDrawerUser}
          onClose={() => setRoleDrawerUser(null)}
          userId={roleDrawerUser.id}
          userName={roleDrawerUser.fullName}
          currentRoleIds={roleIdsByUser.get(roleDrawerUser.id) ?? []}
          roleOptions={roleOptions}
          onSubmit={handleAssignRoles}
        />
      )}
    </div>
  );
}
