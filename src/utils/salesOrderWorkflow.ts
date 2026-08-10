// Project path: src/utils/salesOrderWorkflow.ts
//
// Deliberately mirrors purchaseOrderWorkflow.ts's structure — see spec §22
// on cross-module consistency being an intentional choice, not an oversight.

import type { SalesOrderStatus } from "../types/salesOrders.types";

export type SalesOrderAction =
  | "view"
  | "edit"
  | "submit"
  | "approve"
  | "ship"
  | "cancel"
  | "print"
  | "duplicate";

/** The 5 statuses in the normal (non-cancelled) flow — narrower than
 *  SalesOrderStatus, which also includes "Cancelled". Keeps lookups keyed by
 *  these 5 steps (like the tracker's icon map) from needing a dead
 *  "Cancelled" entry just to satisfy the type checker. */
export type NormalSalesFlowStatus = Exclude<SalesOrderStatus, "Cancelled">;

const NORMAL_FLOW: NormalSalesFlowStatus[] = [
  "Draft",
  "Submitted",
  "Approved",
  "PartiallyShipped",
  "Shipped",
];

export function getAvailableSalesOrderActions(
  status: SalesOrderStatus | string
): SalesOrderAction[] {
  const base: SalesOrderAction[] = ["view", "print", "duplicate"];

  switch (status) {
    case "Draft":
      return [...base, "edit", "submit", "cancel"];
    case "Submitted":
      return [...base, "approve", "cancel"];
    case "Approved":
      return [...base, "ship", "cancel"];
    case "PartiallyShipped":
      return [...base, "ship", "cancel"];
    case "Shipped":
    case "Cancelled":
    default:
      return base;
  }
}

export function canPerform(
  action: SalesOrderAction,
  status: SalesOrderStatus | string
): boolean {
  return getAvailableSalesOrderActions(status).includes(action);
}

export function getStatusStepIndex(status: SalesOrderStatus | string): number {
  return NORMAL_FLOW.indexOf(status as NormalSalesFlowStatus);
}

export function getNormalFlowSteps(): NormalSalesFlowStatus[] {
  return NORMAL_FLOW;
}

export function getCompletionPercent(status: SalesOrderStatus | string): number {
  const index = getStatusStepIndex(status);
  if (index === -1) return 0;
  return Math.round((index / (NORMAL_FLOW.length - 1)) * 100);
}

/** Status -> design token mapping, reusing existing tokens only. Same
 *  mapping shape as Purchase Orders, "PartiallyShipped" gets the same
 *  warning tone as "PartiallyReceived" (both mean in-progress, not done). */
export function getStatusTone(
  status: SalesOrderStatus | string
): "neutral" | "info" | "brand" | "warning" | "success" | "error" {
  switch (status) {
    case "Draft":
      return "neutral";
    case "Submitted":
      return "info";
    case "Approved":
      return "brand";
    case "PartiallyShipped":
      return "warning";
    case "Shipped":
      return "success";
    case "Cancelled":
      return "error";
    default:
      return "neutral";
  }
}
