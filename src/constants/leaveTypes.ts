// Intended path: src/constants/leaveTypes.ts
//
// ASSUMPTION: There is no `/api/LeaveTypes` (or any leave-type catalog) endpoint in the
// confirmed backend API surface. `leaveType` on LeaveRequestResponse/CreateLeaveRequest
// is a plain string. This file is a FRONTEND-OWNED, provisional list — it exists purely
// so the Create form and filter UI have something sensible to offer. It should be
// replaced or reconciled the moment a real leave-types source (endpoint or confirmed
// enum) exists. Never treat this list as backend-confirmed.

export interface LeaveTypeOption {
  /** The exact string value sent to / received from the API in the `leaveType` field. */
  value: string;
  /** i18next key — never hard-code the label, for Arabic/English parity. */
  labelKey: string;
}

export const LEAVE_TYPE_OPTIONS: LeaveTypeOption[] = [
  { value: "Annual", labelKey: "leaveRequests.types.annual" },
  { value: "Sick", labelKey: "leaveRequests.types.sick" },
  { value: "Unpaid", labelKey: "leaveRequests.types.unpaid" },
  { value: "Maternity", labelKey: "leaveRequests.types.maternity" },
  { value: "Paternity", labelKey: "leaveRequests.types.paternity" },
  { value: "Other", labelKey: "leaveRequests.types.other" },
];

/**
 * Resolves a `leaveType` string (from real API data) to a display label.
 * Falls back to rendering the raw value itself if it isn't in the frontend's
 * configured list — real data must never be hidden or mis-rendered just
 * because it doesn't match this provisional list (same principle as the
 * `status` field's "never assume a closed enum" handling).
 */
export function getLeaveTypeOption(value: string | null | undefined): LeaveTypeOption | null {
  if (!value) return null;
  return LEAVE_TYPE_OPTIONS.find((option) => option.value === value) ?? null;
}
