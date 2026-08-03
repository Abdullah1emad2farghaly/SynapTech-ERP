// Project path: src/utils/purchaseOrderWorkflow.ts
//
// The single place status-gating logic lives. Every action menu (list row,
// details page action bar) and the Status Tracker all read from this file —
// see spec §2 and §14.

import type { PurchaseOrderStatus } from "../types/purchaseOrders.types";

export type PurchaseOrderAction =
  | "view"
  | "edit"
  | "submit"
  | "approve"
  | "receive"
  | "cancel"
  | "print"
  | "duplicate";

/** The 5 statuses in the normal (non-cancelled) flow — a narrower type than
 *  PurchaseOrderStatus, which also includes "Cancelled". Keeping this
 *  separate means anything indexing a lookup keyed by these 5 steps (like
 *  the tracker's icon map) doesn't need a "Cancelled" entry just to satisfy
 *  the type checker. */
export type NormalFlowStatus = Exclude<PurchaseOrderStatus, "Cancelled">;

const NORMAL_FLOW: NormalFlowStatus[] = [
  "Draft",
  "Submitted",
  "Approved",
  "PartiallyReceived",
  "Received",
];

export function getAvailablePurchaseOrderActions(
  status: PurchaseOrderStatus | string
): PurchaseOrderAction[] {
  const base: PurchaseOrderAction[] = ["view", "print", "duplicate"];

  switch (status) {
    case "Draft":
      return [...base, "edit", "submit", "cancel"];
    case "Submitted":
      return [...base, "approve", "cancel"];
    case "Approved":
      return [...base, "receive", "cancel"];
    case "PartiallyReceived":
      return [...base, "receive", "cancel"];
    case "Received":
    case "Cancelled":
    default:
      return base;
  }
}

export function canPerform(
  action: PurchaseOrderAction,
  status: PurchaseOrderStatus | string
): boolean {
  return getAvailablePurchaseOrderActions(status).includes(action);
}

/** Index of a status within the normal (non-cancelled) flow, for the tracker's
 *  completed/current/upcoming rendering and completion % calculation.
 *  Returns -1 for "Cancelled" — deliberately not mapped onto the spine, since
 *  the API never records which step a cancelled order was cancelled from. */
export function getStatusStepIndex(status: PurchaseOrderStatus | string): number {
  return NORMAL_FLOW.indexOf(status as NormalFlowStatus);
}

export function getNormalFlowSteps(): NormalFlowStatus[] {
  return NORMAL_FLOW;
}

export function getCompletionPercent(status: PurchaseOrderStatus | string): number {
  const index = getStatusStepIndex(status);
  if (index === -1) return 0;
  return Math.round((index / (NORMAL_FLOW.length - 1)) * 100);
}

/** Status -> design token mapping, reusing existing tokens only (spec §18). */
export function getStatusTone(
  status: PurchaseOrderStatus | string
): "neutral" | "info" | "brand" | "warning" | "success" | "error" {
  switch (status) {
    case "Draft":
      return "neutral";
    case "Submitted":
      return "info";
    case "Approved":
      return "brand";
    case "PartiallyReceived":
      return "warning";
    case "Received":
      return "success";
    case "Cancelled":
      return "error";
    default:
      return "neutral";
  }
}
