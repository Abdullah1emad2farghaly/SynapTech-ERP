// Intended path: src/pages/admin/leaveRequests/LeaveRequestsDashboardPage.tsx

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useApproveLeaveRequest, useCancelLeaveRequest, useLeaveRequests, useRejectLeaveRequest } from "../../../hooks/useLeaveRequests";
import { LeaveRequestKpiCards } from "../../../components/admin/leaveRequests/LeaveRequestKpiCards";
import { LeaveRequestCard } from "../../../components/admin/leaveRequests/LeaveRequestCard";
import { CreateLeaveRequestDrawer } from "../../../components/admin/leaveRequests/CreateLeaveRequestDrawer";
import {
  ApproveLeaveRequestDialog,
  CancelLeaveRequestDialog,
  RejectLeaveRequestDialog,
} from "../../../components/admin/leaveRequests/LeaveRequestActionDialogs";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";
import { ErrorState } from "../../../components/common/ErrorState";
import { Skeleton } from "../../../components/common/Skeleton";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export function LeaveRequestsDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: requests, isLoading, isError, refetch } = useLeaveRequests();
  const approveMutation = useApproveLeaveRequest()
  const cancelMutation = useCancelLeaveRequest()
  const rejectMutation = useRejectLeaveRequest();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<LeaveRequestResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequestResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequestResponse | null>(null);

  
  const pendingRequests = useMemo(() => {
    if (!requests) return [];
    return requests
      .filter((r) => r.status === "Pending")
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 8);
  }, [requests]);

  const recentRequests = useMemo(() => {
    if (!requests) return [];
    return [...requests].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 8);
  }, [requests]);

  const handleKpiClick = (status: string | null) => {
    navigate(status ? `all?status=${status}` : "all");
  };

  if (isError) {
    return <ErrorState onRetry={refetch} title={t("leaveRequests.error.loadFailed")} />;
  }

  const handleSubmit = (id: string, type: string) => {
    try {
      if(type === 'approve'){
        approveMutation.mutate(id)
      }else if(type === 'cancel'){
        cancelMutation.mutate(id);
      }else {
        rejectMutation.mutate(id);
      }
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors);
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--ink-primary)" }}>
            {t("leaveRequests.dashboard.title")}
          </h1>
          <p className="text-sm" style={{ color: "var(--ink-tertiary)" }}>
            {t("leaveRequests.dashboard.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
          style={{ backgroundColor: "var(--signal)", color: "var(--on-signal)" }}
        >
          <Plus size={16} />
          {t("leaveRequests.actions.create")}
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
            {t("leaveRequests.empty.noneTitle")}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-tertiary)" }}>
            {t("leaveRequests.empty.noneDescription")}
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: "var(--signal)", color: "var(--on-signal)" }}
          >
            <Plus size={16} />
            {t("leaveRequests.actions.create")}
          </button>
        </div>
      ) : (
        <>
          <LeaveRequestKpiCards requests={requests} onCardClick={handleKpiClick} />

          <div className="grid lg:grid-cols-2 gap-6">
            <section>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--ink-primary)" }}>
                {t("leaveRequests.dashboard.pendingPanel")}
              </h2>
              <div className="space-y-2">
                {pendingRequests.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--ink-tertiary)" }}>
                    {t("leaveRequests.dashboard.noPending")}
                  </p>
                ) : (
                  pendingRequests.map((request) => (
                    <LeaveRequestCard
                      key={request.id}
                      request={request}
                      onView={(r) => navigate(`${r.id}`)}
                      onApprove={setApproveTarget}
                      onReject={setRejectTarget}
                      onCancel={setCancelTarget}
                    />
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--ink-primary)" }}>
                {t("leaveRequests.dashboard.recentPanel")}
              </h2>
              <div className="space-y-2">
                {recentRequests.map((request) => (
                  <LeaveRequestCard
                    key={request.id}
                    request={request}
                    onView={(r) => navigate(`${r.id}`)}
                    onApprove={setApproveTarget}
                    onReject={setRejectTarget}
                    onCancel={setCancelTarget}
                  />
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      <CreateLeaveRequestDrawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ApproveLeaveRequestDialog request={approveTarget} onClose={() => setApproveTarget(null)} />
      <RejectLeaveRequestDialog request={rejectTarget} onClose={() => setRejectTarget(null)} />
      <CancelLeaveRequestDialog request={cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  );
}
