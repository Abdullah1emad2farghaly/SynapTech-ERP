// Intended path: src/utils/leaveRequestActions.ts
//
// Single source of truth for which actions are offered per status — drives the
// list row action menu, the mobile card menu, and the details page action bar.

export type LeaveRequestAction = "view" | "approve" | "reject" | "cancel";

/**
 * ASSUMPTION flagged in leave-requests-ux-spec.md Section 4 and Section 17:
 * offering "Cancel" on an Approved request is a FRONTEND-ONLY assumption. The
 * API imposes no documented state-machine restriction on which statuses
 * `/cancel` accepts. If the backend actually rejects cancelling an
 * already-approved request, that surfaces as a normal action-failed toast
 * (see useCancelLeaveRequest's error handling in the pages), not a crash.
 * Confirm this against the real backend before shipping.
 */
export function getAvailableLeaveRequestActions(
  status: string | null | undefined
): LeaveRequestAction[] {
  switch (status) {
    case "Pending":
      return ["view", "approve", "reject", "cancel"];
    case "Approved":
      return ["view", "cancel"];
    case "Rejected":
      return ["view"];
    case "Cancelled":
      return ["view"];
    default:
      // Unknown/null status — safest action is View only.
      return ["view"];
  }
}
