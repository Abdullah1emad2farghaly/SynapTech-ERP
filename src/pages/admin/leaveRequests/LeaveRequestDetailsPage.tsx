// Intended path: src/pages/admin/leaveRequests/LeaveRequestDetailsPage.tsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, X, CalendarX2 } from "lucide-react";
import { useLeaveRequest } from "../../../hooks/useLeaveRequests";
import { LeaveRequestStatusBadge } from "../../../components/admin/leaveRequests/LeaveRequestStatusBadge";
import { LeaveRequestStatusTracker } from "../../../components/admin/leaveRequests/LeaveRequestStatusTracker";
import { DurationDisplay } from "../../../components/admin/leaveRequests/DurationDisplay";
import { Avatar } from "../../../components/common/Avatar";
import { Skeleton } from "../../../components/common/Skeleton";
import { ErrorState } from "../../../components/common/ErrorState";
import { getLeaveTypeOption } from "../../../constants/leaveTypes";
import { getAvailableLeaveRequestActions } from "../../../utils/leaveRequestActions";
import {
  ApproveLeaveRequestDialog,
  CancelLeaveRequestDialog,
  RejectLeaveRequestDialog,
} from "../../../components/admin/leaveRequests/LeaveRequestActionDialogs";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";

export function LeaveRequestDetailsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: request, isLoading, isError, refetch } = useLeaveRequest(id);

  const [approveTarget, setApproveTarget] = useState<LeaveRequestResponse | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequestResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequestResponse | null>(null);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(i18n.language, { year: "numeric", month: "long", day: "numeric" });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }
  

  if (isError || !request) {
    return (
      <ErrorState
        onRetry={refetch}
        title={t("leaveRequests.error.notFound")}
        retryLabel={t("leaveRequests.details.backToList")}
      />
    );
  }

  const actions = getAvailableLeaveRequestActions(request.status);
  const leaveTypeOption = getLeaveTypeOption(request.leaveType);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <button
        type="button"
        onClick={() => navigate("/leave-requests/all")}
        className="inline-flex items-center gap-1 text-sm"
        style={{ color: "var(--ink-secondary)" }}
      >
        <ArrowLeft size={14} />
        {t("leaveRequests.details.backToList")}
      </button>

      <div className="flex items-center gap-3">
        <Avatar name={request.employeeName} size="lg" />
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--ink-primary)" }}>
            {request.employeeName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm" style={{ color: "var(--ink-tertiary)" }}>
              {leaveTypeOption ? t(leaveTypeOption.labelKey) : request.leaveType}
            </span>
            <LeaveRequestStatusBadge status={request.status} size="sm" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--panel)", border: "1px solid var(--hairline)" }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--ink-primary)" }}>
              {t("leaveRequests.details.requestPeriod")}
            </h2>
            <div className="flex items-center justify-between text-sm">
              <div>
                <div style={{ color: "var(--ink-tertiary)" }}>{t("leaveRequests.form.startDate")}</div>
                <div style={{ color: "var(--ink-primary)" }}>{formatDate(request.startDate)}</div>
              </div>
              <div className="text-lg" style={{ color: "var(--ink-tertiary)" }}>
                →
              </div>
              <div>
                <div style={{ color: "var(--ink-tertiary)" }}>{t("leaveRequests.form.endDate")}</div>
                <div style={{ color: "var(--ink-primary)" }}>{formatDate(request.endDate)}</div>
              </div>
              <div>
                <div style={{ color: "var(--ink-tertiary)" }}>{t("leaveRequests.form.duration")}</div>
                <DurationDisplay startDate={request.startDate} endDate={request.endDate} />
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--panel)", border: "1px solid var(--hairline)" }}>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink-primary)" }}>
              {t("leaveRequests.details.reason")}
            </h2>
            <p className="text-sm" style={{ color: request.reason ? "var(--ink-secondary)" : "var(--ink-tertiary)" }}>
              {request.reason || t("leaveRequests.details.noReason")}
            </p>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--panel)", border: "1px solid var(--hairline)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--ink-primary)" }}>
              {t("leaveRequests.details.workflowStatus")}
            </h2>
            <LeaveRequestStatusTracker request={request} variant="full" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--panel)", border: "1px solid var(--hairline)" }}>
            <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink-primary)" }}>
              {t("leaveRequests.details.approvalInformation")}
            </h2>
            <div className="text-sm" style={{ color: "var(--ink-secondary)" }}>
              {request.status === "Approved" && request.approvedAt && formatDate(request.approvedAt)}
              {request.status === "Pending" && t("leaveRequests.details.notYetDecided")}
              {(request.status === "Rejected" || request.status === "Cancelled") && "—"}
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--ink-tertiary)" }}>
              {t("leaveRequests.details.noAuditTrailNote")}
            </p>
          </div>

          {
            (request.status !== "Approved" && request.status !== "Rejected" && request.status !== "Cancelled") && (
              <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: "var(--panel)", border: "1px solid var(--hairline)" }}>
                <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--ink-primary)" }}>
                  {t("leaveRequests.details.quickActions")}
                </h2>
                {actions.includes("approve") && (
                  <button
                    type="button"
                    onClick={() => setApproveTarget(request)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                    style={{ backgroundColor: "var(--success)", color: "var(--on-signal)" }}
                  >
                    <Check size={14} />
                    {t("leaveRequests.actions.approve")}
                  </button>
                )}
                {actions.includes("reject") && (
                  <button
                    type="button"
                    onClick={() => setRejectTarget(request)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                    style={{ border: "1px solid var(--error)", color: "var(--error)" }}
                  >
                    <X size={14} />
                    {t("leaveRequests.actions.reject")}
                  </button>
                )}
                {actions.includes("cancel") && (
                  <button
                    type="button"
                    onClick={() => setCancelTarget(request)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                    style={{ border: "1px solid var(--hairline)", color: "var(--ink-secondary)" }}
                  >
                    <CalendarX2 size={14} />
                    {t("leaveRequests.actions.cancel")}
                  </button>
                )}
                {actions.length === 1 && (
                  <p className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
                    {t("leaveRequests.details.noActionsAvailable")}
                  </p>
                )}
              </div>
            )
          }
        </div>
      </div>

      <ApproveLeaveRequestDialog request={approveTarget} onClose={() => setApproveTarget(null)} />
      <RejectLeaveRequestDialog request={rejectTarget} onClose={() => setRejectTarget(null)} />
      <CancelLeaveRequestDialog request={cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  );
}
