// Intended path: src/pages/admin/leaveRequests/LeaveRequestsListPage.tsx

import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLeaveRequests } from "../../../hooks/useLeaveRequests";
import { LeaveRequestsToolbar, countActiveFilters } from "../../../components/admin/leaveRequests/LeaveRequestsToolbar";
import {
  applyLeaveRequestFilters,
  EMPTY_LEAVE_REQUEST_FILTERS,
  LeaveRequestFilters,
  type LeaveRequestFiltersState,
} from "../../../components/admin/leaveRequests/LeaveRequestFilters";
import { LeaveRequestsTable } from "../../../components/admin/leaveRequests/LeaveRequestsTable";
import { LeaveRequestCard } from "../../../components/admin/leaveRequests/LeaveRequestCard";
import { CreateLeaveRequestDrawer } from "../../../components/admin/leaveRequests/CreateLeaveRequestDrawer";
import {
  ApproveLeaveRequestDialog,
  CancelLeaveRequestDialog,
  RejectLeaveRequestDialog,
} from "../../../components/admin/leaveRequests/LeaveRequestActionDialogs";
import { Drawer } from "../../../components/common/Drawer";
import { ErrorState } from "../../../components/common/ErrorState";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";

export function LeaveRequestsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: requests, isLoading, isError, refetch } = useLeaveRequests();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(searchParams.get("status"));
  const [filters, setFilters] = useState<LeaveRequestFiltersState>(EMPTY_LEAVE_REQUEST_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [approveTarget, setApproveTarget] = useState<LeaveRequestResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequestResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequestResponse | null>(null);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    let rows = requests;

    if (statusFilter) {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    rows = applyLeaveRequestFilters(rows, filters);

    if (search.trim()) {
      const lower = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(lower) ||
          r.leaveType.toLowerCase().includes(lower) ||
          (r.reason ?? "").toLowerCase().includes(lower) ||
          (r.status ?? "").toLowerCase().includes(lower)
      );
    }

    return rows;
  }, [requests, statusFilter, filters, search]);

  const isFiltered = Boolean(search.trim()) || countActiveFilters(filters) > 0 || Boolean(statusFilter);

  if (isError) {
    return <ErrorState onRetry={refetch} title={t("leaveRequests.error.loadFailed")} />;
  }

  
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--ink-primary)" }}>
          {t("leaveRequests.list.title")}
        </h1>
      </div>

      <LeaveRequestsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        activeFilterCount={countActiveFilters(filters)}
        onOpenAdvancedFilters={() => setIsFiltersOpen(true)}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* Desktop table */}
      <div className="hidden md:block">
        <LeaveRequestsTable
          requests={isFiltered ? filteredRequests : requests ?? []}
          isLoading={isLoading}
          onView={(r) => navigate(`/hr/leave-requests/${r.id}`)}
          onApprove={setApproveTarget}
          onReject={setRejectTarget}
          onCancel={setCancelTarget}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {isLoading && <p className="text-sm" style={{ color: "var(--ink-tertiary)" }}>{t("common.loading")}</p>}
        {!isLoading && filteredRequests.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "var(--ink-tertiary)" }}>
            {isFiltered ? t("leaveRequests.empty.noMatchTitle") : t("leaveRequests.empty.noneTitle")}
          </p>
        )}
        {filteredRequests.map((request) => (
          <LeaveRequestCard
            key={request.id}
            request={request}
            onView={(r) => navigate(`/hr/leave-requests/${r.id}`)}
            onApprove={setApproveTarget}
            onReject={setRejectTarget}
            onCancel={setCancelTarget}
          />
        ))}
      </div>

      {/* Filters: popover on desktop, Drawer sheet on mobile — reusing one filter body */}
      <Drawer open={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} title={t("leaveRequests.filters.filters")}>
        <LeaveRequestFilters
          value={filters}
          onChange={setFilters}
          onClearAll={() => {
            setFilters(EMPTY_LEAVE_REQUEST_FILTERS);
            setStatusFilter(null);
            setSearch("");
          }}
        />
      </Drawer>

      <CreateLeaveRequestDrawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ApproveLeaveRequestDialog request={approveTarget} onClose={() => setApproveTarget(null)} />
      <RejectLeaveRequestDialog request={rejectTarget} onClose={() => setRejectTarget(null)} />
      <CancelLeaveRequestDialog request={cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  );
}
