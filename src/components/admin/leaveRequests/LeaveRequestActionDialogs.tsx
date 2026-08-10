// Intended path: src/components/admin/leaveRequests/LeaveRequestActionDialogs.tsx
//
// ASSUMPTION: reuses the existing generic `ConfirmationDialog` shell (same one
// used for Approve/Reject/Cancel-style flows on Purchase/Sales Orders). Its
// prop surface is assumed to accept isOpen/title/body/tone/onConfirm/
// isSubmitting/onClose — verify against the real component.

import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ConfirmationDialog } from "../../common/ConfirmationDialog";
import {
  useApproveLeaveRequest,
  useCancelLeaveRequest,
  useRejectLeaveRequest,
} from "../../../hooks/useLeaveRequests";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";
import axios from "axios";

interface ActionDialogProps {
  request: LeaveRequestResponse | null;
  onClose: () => void;
}

export function ApproveLeaveRequestDialog({ request, onClose }: ActionDialogProps) {
  const { t } = useTranslation();
  const approveMutation = useApproveLeaveRequest();

  const handleConfirm = async () => {
    if (!request) return;
    try {
      await approveMutation.mutateAsync(request.id);
      toast.success(t("leaveRequests.toast.approved"));
      onClose();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <ConfirmationDialog
      open={Boolean(request)}
      onCancel={onClose}
      onConfirm={handleConfirm}
      cancelLabel={t("leaveRequests.actions.cancel")}
      isSubmitting={approveMutation.isPending}
      tone="neutral"
      title={t("leaveRequests.approve.title")}
      body={
        request
          ? t("leaveRequests.approve.body", {
              employee: request.employeeName,
              startDate: request.startDate,
              endDate: request.endDate,
            })
          : ""
      }
      confirmLabel={t("leaveRequests.actions.approve")}
    />
  );
}

export function RejectLeaveRequestDialog({ request, onClose }: ActionDialogProps) {
  const { t } = useTranslation();
  const rejectMutation = useRejectLeaveRequest();

  const handleConfirm = async () => {
    if (!request) return;
    try {
      await rejectMutation.mutateAsync(request.id);
      toast.success(t("leaveRequests.toast.rejected"));
      onClose();
    } catch {
      toast.error(t("common.errors.actionFailed"));
    }
  };

  return (
    <ConfirmationDialog
      open={Boolean(request)}
      onCancel={onClose}
      onConfirm={handleConfirm}
      cancelLabel={t("leaveRequests.actions.cancel")}
      isSubmitting={rejectMutation.isPending}
      tone="destructive"
      title={t("leaveRequests.reject.title")}
      body={
        request
          ? t("leaveRequests.reject.body", {
              employee: request.employeeName,
              startDate: request.startDate,
              endDate: request.endDate,
            })
          : ""
      }
      confirmLabel={t("leaveRequests.actions.reject")}
    />
  );
}

export function CancelLeaveRequestDialog({ request, onClose }: ActionDialogProps) {
  const { t } = useTranslation();
  const cancelMutation = useCancelLeaveRequest();

  const handleConfirm = async () => {
    if (!request) return;
    try {
      await cancelMutation.mutateAsync(request.id);
      toast.success(t("leaveRequests.toast.cancelled"));
      onClose();
    } catch (error) {
      if(axios.isAxiosError(error)){
        console.log(error.response?.data)
      }
      toast.error(t("common.errors.actionFailed"));
    }
  };

  const bodyKey =
    request?.status === "Approved" ? "leaveRequests.cancel.bodyApproved" : "leaveRequests.cancel.body";

  return (
    <ConfirmationDialog
      open={Boolean(request)}
      onCancel={onClose}
      cancelLabel={t("leaveRequests.actions.cancel")}
      onConfirm={handleConfirm}
      isSubmitting={cancelMutation.isPending}
      tone="destructive"
      title={t("leaveRequests.cancel.title")}
      body={
        request
          ? t(bodyKey, {
              employee: request.employeeName,
              startDate: request.startDate,
              endDate: request.endDate,
            })
          : ""
      }
      confirmLabel={t("leaveRequests.actions.cancel")}
    />
  );
}
