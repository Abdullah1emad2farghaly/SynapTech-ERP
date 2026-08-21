// Intended path: src/components/admin/leaveRequests/LeaveRequestCard.tsx

import { useTranslation } from "react-i18next";
import { Avatar } from "../../common/Avatar";
import { DurationDisplay } from "./DurationDisplay";
import { LeaveRequestStatusBadge } from "./LeaveRequestStatusBadge";
import { LeaveRequestActionMenu } from "./LeaveRequestActionMenu";
import { getLeaveTypeOption } from "../../../constants/leaveTypes";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";
import { hasAnyPermission } from "@/utils/permissions";
import { getUserPermissions } from "@/pages/common/LoginPage";

interface LeaveRequestCardProps {
  request: LeaveRequestResponse;
  onView: (request: LeaveRequestResponse) => void;
  onApprove: (request: LeaveRequestResponse) => void;
  onReject: (request: LeaveRequestResponse) => void;
  onCancel: (request: LeaveRequestResponse) => void;
  /** My Requests context omits the employee identity row (it's always "me"). */
  showEmployee?: boolean;
}

export function LeaveRequestCard({
  request,
  onView,
  onApprove,
  onReject,
  onCancel,
  showEmployee = true,
}: LeaveRequestCardProps) {
  const { t, i18n } = useTranslation();
  const option = getLeaveTypeOption(request.leaveType);
  const canApproveAccess = hasAnyPermission([
    "hr.leaves.approve",
  ], getUserPermissions());

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(i18n.language, { month: "short", day: "numeric" });

  return (
    <div
      onClick={() => onView(request)}
      className="rounded-lg p-4 cursor-pointer"
      style={{ backgroundColor: "var(--panel)", border: "1px solid var(--hairline)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {showEmployee && <Avatar name={request.employeeName} size="sm" />}
          <div>
            {showEmployee && (
              <div className="text-sm font-medium" style={{ color: "var(--ink-primary)" }}>
                {request.employeeName}
              </div>
            )}
            <div className="text-xs" style={{ color: "var(--ink-tertiary)" }}>
              {option ? t(option.labelKey) : request.leaveType}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <LeaveRequestStatusBadge status={request.status} size="sm" />
          {
            (
              <LeaveRequestActionMenu
                request={request}
                onView={onView}
                onApprove={onApprove}
                onReject={onReject}
                onCancel={onCancel}
              />
            )
          }

        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span style={{ color: "var(--ink-secondary)" }}>
          {formatDate(request.startDate)} – {formatDate(request.endDate)}
        </span>
        <DurationDisplay startDate={request.startDate} endDate={request.endDate} />
      </div>

      {request.reason && (
        <p className="mt-2 text-sm line-clamp-2" style={{ color: "var(--ink-tertiary)" }}>
          {request.reason}
        </p>
      )}
    </div>
  );
}
