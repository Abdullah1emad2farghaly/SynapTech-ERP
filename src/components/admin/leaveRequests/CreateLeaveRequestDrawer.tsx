// Intended path: src/components/admin/leaveRequests/CreateLeaveRequestDrawer.tsx
//
// ASSUMPTION: reuses the existing generic `Drawer` shell (same one used for every
// other create flow in the project). No separate "Summary" screen — a persistent
// compact recap strip sits above the sticky Submit button instead, since this
// form only has 5 real fields (see leave-requests-ux-spec.md Section 6).

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Drawer } from "../../common/Drawer";
import { EmployeeSelector } from "./EmployeeSelector";
import { LeaveTypeSelector } from "./LeaveTypeSelector";
import { DurationDisplay } from "./DurationDisplay";
import { useCreateLeaveRequest } from "../../../hooks/useLeaveRequests";
import {
  CreateLeaveRequestSchema,
  type CreateLeaveRequestFormValues,
  REASON_SOFT_LIMIT,
} from "../../../schemas/leaveRequest.schema";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

interface CreateLeaveRequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Locks + pre-fills the employee field — used from the My Leave Requests
   *  self-service entry point. See EmployeeSelector's lockedEmployeeId note. */
  lockedEmployeeId?: string;
}

export function CreateLeaveRequestDrawer({
  isOpen,
  onClose,
  lockedEmployeeId,
}: CreateLeaveRequestDrawerProps) {
  const { t } = useTranslation();
  const createMutation = useCreateLeaveRequest();

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateLeaveRequestFormValues>({
    resolver: zodResolver(CreateLeaveRequestSchema),
    defaultValues: {
      employeeId: lockedEmployeeId ?? "",
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const reason = watch("reason") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({
        employeeId: values.employeeId,
        leaveType: values.leaveType,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason || undefined,
      });
      toast.success(t("leaveRequests.toast.created"));
      reset();
      onClose();
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  });

  return (
    <Drawer open={isOpen} onClose={onClose} title={t("leaveRequests.create.title")}>
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
              {t("leaveRequests.form.employee")}
            </label>
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <EmployeeSelector
                  value={field.value}
                  onChange={field.onChange}
                  lockedEmployeeId={lockedEmployeeId}
                  error={errors.employeeId?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
              {t("leaveRequests.form.leaveType")}
            </label>
            <Controller
              name="leaveType"
              control={control}
              render={({ field }) => (
                <LeaveTypeSelector value={field.value} onChange={field.onChange} error={errors.leaveType?.message} />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
                {t("leaveRequests.form.startDate")}
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full rounded-md px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--sunken)", border: "1px solid var(--hairline)", color: "var(--ink-primary)" }}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>
                  {t(errors.startDate.message as string)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
                {t("leaveRequests.form.endDate")}
              </label>
              <input
                type="date"
                min={startDate || undefined}
                {...register("endDate")}
                className="w-full rounded-md px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--sunken)", border: "1px solid var(--hairline)", color: "var(--ink-primary)" }}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs" style={{ color: "var(--error)" }}>
                  {t(errors.endDate.message as string)}
                </p>
              )}
            </div>
          </div>

          {startDate && endDate && (
            <div className="text-sm">
              <span style={{ color: "var(--ink-tertiary)" }}>{t("leaveRequests.form.duration")}: </span>
              <DurationDisplay startDate={startDate} endDate={endDate} />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink-secondary)" }}>
              {t("leaveRequests.form.reason")}
            </label>
            <textarea
              {...register("reason")}
              rows={4}
              placeholder={t("leaveRequests.form.reasonPlaceholder")}
              className="w-full rounded-md px-3 py-2 text-sm resize-none"
              style={{ backgroundColor: "var(--sunken)", border: "1px solid var(--hairline)", color: "var(--ink-primary)" }}
            />
            <div className="mt-1 text-xs text-end" style={{ color: "var(--ink-tertiary)" }}>
              {reason.length}/{REASON_SOFT_LIMIT}
            </div>
          </div>
        </div>

        <div
          className="sticky bottom-0 flex items-center justify-end gap-2 p-4"
          style={{ borderTop: "1px solid var(--hairline)", backgroundColor: "var(--panel)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ color: "var(--ink-secondary)" }}
          >
            {t("common.actions.cancel")}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: "var(--signal)", color: "var(--on-signal)" }}
          >
            {createMutation.isPending
              ? t("leaveRequests.create.submitting")
              : t("leaveRequests.create.submit")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
