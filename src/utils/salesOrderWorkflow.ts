

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

export type NormalSalesFlowStatus = Exclude<
  SalesOrderStatus,
  "Cancelled"
>;

const NORMAL_FLOW: NormalSalesFlowStatus[] = [
  "Draft",
  "Submitted",
  "Approved",
  "PartiallyShipped",
  "Shipped",
];

export interface SalesOrderAccess {
  canCreateAccess: boolean;
  canCancelAccess: boolean;
  canShipAccess: boolean;
  canApproveAccess: boolean;
}

/**
 * Returns the actions available for a sales order based on:
 * - Current order status
 * - Current user's permissions
 *
 * Permission mapping:
 * - canCreateAccess  -> edit, submit, duplicate
 * - canApproveAccess -> approve
 * - canShipAccess    -> ship
 * - canCancelAccess  -> cancel
 *
 * View and print are always available.
 */
export function getAvailableSalesOrderActions(
  status: SalesOrderStatus | string,
  access: SalesOrderAccess,
): SalesOrderAction[] {
  const base: SalesOrderAction[] = [
    "view",
    "print",
  ];

  switch (status) {
    case "Draft": {
      const actions: SalesOrderAction[] = [...base];

      if (access.canCreateAccess) {
        actions.push(
          "edit",
          "submit",
          "duplicate",
        );
      }

      if (access.canCancelAccess) {
        actions.push("cancel");
      }

      return actions;
    }

    case "Submitted": {
      const actions: SalesOrderAction[] = [...base];

      if (access.canCreateAccess) {
        actions.push("duplicate");
      }

      if (access.canApproveAccess) {
        actions.push("approve");
      }

      if (access.canCancelAccess) {
        actions.push("cancel");
      }

      return actions;
    }

    case "Approved": {
      const actions: SalesOrderAction[] = [...base];

      if (access.canCreateAccess) {
        actions.push("duplicate");
      }

      if (access.canShipAccess) {
        actions.push("ship");
      }

      if (access.canCancelAccess) {
        actions.push("cancel");
      }

      return actions;
    }

    case "PartiallyShipped": {
      const actions: SalesOrderAction[] = [...base];

      if (access.canCreateAccess) {
        actions.push("duplicate");
      }

      if (access.canShipAccess) {
        actions.push("ship");
      }

      if (access.canCancelAccess) {
        actions.push("cancel");
      }

      return actions;
    }

    case "Shipped": {
      const actions: SalesOrderAction[] = [...base];

      if (access.canCreateAccess) {
        actions.push("duplicate");
      }

      return actions;
    }

    case "Cancelled": {
      const actions: SalesOrderAction[] = [...base];

      if (access.canCreateAccess) {
        actions.push("duplicate");
      }

      return actions;
    }

    default:
      return base;
  }
}

export function canPerform(
  action: SalesOrderAction,
  status: SalesOrderStatus | string,
  access: SalesOrderAccess,
): boolean {
  return getAvailableSalesOrderActions(
    status,
    access,
  ).includes(action);
}

export function getStatusStepIndex(
  status: SalesOrderStatus | string,
): number {
  return NORMAL_FLOW.indexOf(
    status as NormalSalesFlowStatus,
  );
}

export function getNormalFlowSteps(): NormalSalesFlowStatus[] {
  return NORMAL_FLOW;
}

export function getCompletionPercent(
  status: SalesOrderStatus | string,
): number {
  const index = getStatusStepIndex(status);

  if (index === -1) {
    return 0;
  }

  return Math.round(
    (index / (NORMAL_FLOW.length - 1)) * 100,
  );
}

export function getStatusTone(
  status: SalesOrderStatus | string,
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
