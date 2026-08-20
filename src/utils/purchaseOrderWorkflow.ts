// :::writing{variant="document" id="61743" title="purchaseOrderWorkflow.ts"}
// Project path: src/utils/purchaseOrderWorkflow.ts
//
// The single place status-gating logic lives. Every action menu (list row,
// details page action bar) and the Status Tracker all read from this file.

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

/**
 * The 5 statuses in the normal (non-cancelled) flow.
 */
export type NormalFlowStatus = Exclude<
  PurchaseOrderStatus,
  "Cancelled"
>;

const NORMAL_FLOW: NormalFlowStatus[] = [
  "Draft",
  "Submitted",
  "Approved",
  "PartiallyReceived",
  "Received",
];

export interface PurchaseOrderAccess {
  canManageAccess: boolean;
  canCteateAccess: boolean;
  canApproveAccess: boolean;
  canCancelAccess: boolean;
  canReceiveAccess: boolean;
}

/**
 * Returns the actions available for a purchase order based on:
 * - Current order status
 * - Current user's permissions
 *
 * Permission mapping:
 * - canManageAccess  -> edit, submit, duplicate, approve, receive, cancel
 * - canCteateAccess  -> submit, duplicate
 * - canApproveAccess -> approve
 * - canReceiveAccess -> receive
 * - canCancelAccess  -> cancel
 *
 * View and print are always available.
 */
export function getAvailablePurchaseOrderActions(
  status: PurchaseOrderStatus | string,
  access: PurchaseOrderAccess,
): PurchaseOrderAction[] {
  const base: PurchaseOrderAction[] = [
    "view",
    "print",
  ];

  switch (status) {
    case "Draft": {
      const actions: PurchaseOrderAction[] = [...base];

      if (
        access.canManageAccess ||
        access.canCteateAccess
      ) {
        actions.push(
          "edit",
          "submit",
          "duplicate",
        );
      }

      if (
        access.canManageAccess ||
        access.canCancelAccess
      ) {
        actions.push("cancel");
      }

      return actions;
    }

    case "Submitted": {
      const actions: PurchaseOrderAction[] = [...base];

      if (
        access.canManageAccess ||
        access.canCteateAccess
      ) {
        actions.push("duplicate");
      }

      if (
        access.canManageAccess ||
        access.canApproveAccess
      ) {
        actions.push("approve");
      }

      if (
        access.canManageAccess ||
        access.canCancelAccess
      ) {
        actions.push("cancel");
      }

      return actions;
    }

    case "Approved": {
      const actions: PurchaseOrderAction[] = [...base];

      if (
        access.canManageAccess ||
        access.canCteateAccess
      ) {
        actions.push("duplicate");
      }

      if (
        access.canManageAccess ||
        access.canReceiveAccess
      ) {
        actions.push("receive");
      }

      if (
        access.canManageAccess ||
        access.canCancelAccess
      ) {
        actions.push("cancel");
      }

      return actions;
    }

    case "PartiallyReceived": {
      const actions: PurchaseOrderAction[] = [...base];

      if (
        access.canManageAccess ||
        access.canCteateAccess
      ) {
        actions.push("duplicate");
      }

      if (
        access.canManageAccess ||
        access.canReceiveAccess
      ) {
        actions.push("receive");
      }

      if (
        access.canManageAccess ||
        access.canCancelAccess
      ) {
        actions.push("cancel");
      }

      return actions;
    }

    case "Received": {
      const actions: PurchaseOrderAction[] = [...base];

      if (
        access.canManageAccess ||
        access.canCteateAccess
      ) {
        actions.push("duplicate");
      }

      return actions;
    }

    case "Cancelled": {
      const actions: PurchaseOrderAction[] = [...base];

      if (
        access.canManageAccess ||
        access.canCteateAccess
      ) {
        actions.push("duplicate");
      }

      return actions;
    }

    default:
      return base;
  }
}

/**
 * Checks whether a specific action can currently be performed.
 */
export function canPerform(
  action: PurchaseOrderAction,
  status: PurchaseOrderStatus | string,
  access: PurchaseOrderAccess,
): boolean {
  return getAvailablePurchaseOrderActions(
    status,
    access,
  ).includes(action);
}

/**
 * Index of a status within the normal (non-cancelled) flow.
 */
export function getStatusStepIndex(
  status: PurchaseOrderStatus | string,
): number {
  return NORMAL_FLOW.indexOf(
    status as NormalFlowStatus,
  );
}

/**
 * Returns the normal purchase-order workflow steps.
 */
export function getNormalFlowSteps(): NormalFlowStatus[] {
  return NORMAL_FLOW;
}

/**
 * Returns the completion percentage for the current status.
 */
export function getCompletionPercent(
  status: PurchaseOrderStatus | string,
): number {
  const index = getStatusStepIndex(status);

  if (index === -1) {
    return 0;
  }

  return Math.round(
    (index / (NORMAL_FLOW.length - 1)) * 100,
  );
}

/**
 * Status -> design token mapping.
 */
export function getStatusTone(
  status: PurchaseOrderStatus | string,
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
