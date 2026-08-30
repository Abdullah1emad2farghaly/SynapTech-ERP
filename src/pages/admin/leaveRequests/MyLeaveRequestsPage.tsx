// Intended path: src/pages/admin/leaveRequests/MyLeaveRequestsPage.tsx
//
// Uses GET /api/LeaveRequests/my-requests exclusively — never touches the
// admin GET /api/LeaveRequests endpoint. See leave-requests-ux-spec.md Section 11.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useMyLeaveRequests } from "../../../hooks/useLeaveRequests";
import { LeaveRequestKpiCards } from "../../../components/admin/leaveRequests/LeaveRequestKpiCards";
import { LeaveRequestCard } from "../../../components/admin/leaveRequests/LeaveRequestCard";
import { CreateLeaveRequestDrawer } from "../../../components/admin/leaveRequests/CreateLeaveRequestDrawer";
import {
  ApproveLeaveRequestDialog,
  CancelLeaveRequestDialog,
  RejectLeaveRequestDialog,
} from "../../../components/admin/leaveRequests/LeaveRequestActionDialogs";
import { ErrorState } from "../../../components/common/ErrorState";
import { Skeleton } from "../../../components/common/Skeleton";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";

// Section 17, open question #1. Left undefined here; wire in once available.
const CURRENT_EMPLOYEE_ID: string | undefined = undefined;

export function MyLeaveRequestsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: requests, isLoading, isError, refetch } = useMyLeaveRequests();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<LeaveRequestResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequestResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequestResponse | null>(null);

  const sortedRequests = useMemo(() => {
    if (!requests) return [];
    return [...requests].sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [requests]);

  if (isError) {
    return <ErrorState onRetry={refetch} title={t("leaveRequests.error.loadFailed")} />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--ink-primary)" }}>
          {t("leaveRequests.myRequests.title")}
        </h1>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
          style={{ backgroundColor: "var(--signal)", color: "var(--on-signal)" }}
        >
          <Plus size={16} />
          {t("leaveRequests.myRequests.requestLeave")}
        </button>
      </div>

      {isLoading || !requests ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg p-10 text-center" style={{ border: "1px dashed var(--hairline)" }}>
          <p className="font-medium" style={{ color: "var(--ink-primary)" }}>
            {t("leaveRequests.myRequests.emptyTitle")}
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: "var(--signal)", color: "var(--on-signal)" }}
          >
            <Plus size={16} />
            {t("leaveRequests.myRequests.requestLeave")}
          </button>
        </div>
      ) : (
        <>
          <LeaveRequestKpiCards requests={requests} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedRequests.map((request) => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                showEmployee={false}
                onView={(r) => navigate(`/leave-requests/${r.id}`)}
                onApprove={setApproveTarget}
                onReject={setRejectTarget}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        </>
      )}

      <CreateLeaveRequestDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        lockedEmployeeId={CURRENT_EMPLOYEE_ID}
      />
      <ApproveLeaveRequestDialog request={approveTarget} onClose={() => setApproveTarget(null)} />
      <RejectLeaveRequestDialog request={rejectTarget} onClose={() => setRejectTarget(null)} />
      <CancelLeaveRequestDialog request={cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  );
}
