// Project path: src/constants/permissionDependencies.ts

import type { PermissionResponse } from "../types/roles.types";

export interface PermissionDependency {
    code: string;
    requires: string[];
    reason: string;
}

export const PERMISSION_DEPENDENCIES: PermissionDependency[] = [
    {
        code: "purchasing.suppliers.manage",
        requires: ["purchasing.suppliers.view"],
        reason: "Need to see the supplier list to manage entries in it",
    },
    {
        code: "purchasing.orders.create",
        requires: [
            "purchasing.orders.view",
            "purchasing.suppliers.view",
            "inventory.warehouses.view",
            "inventory.products.view",
        ],
        reason:
            "The create-order form needs a supplier picker, a warehouse picker, and a product picker for order lines; view is needed to see the order list at all",
    },
    {
        code: "purchasing.orders.approve",
        requires: ["purchasing.orders.view"],
        reason: "Must be able to see and open an order before approving it",
    },
    {
        code: "purchasing.orders.receive",
        requires: ["purchasing.orders.view"],
        reason: "Must be able to see and open an order before receiving goods against it",
    },
    {
        code: "purchasing.orders.cancel",
        requires: ["purchasing.orders.view"],
        reason: "Must be able to see and open an order before cancelling it",
    },
    {
        code: "sales.customers.manage",
        requires: ["sales.customers.view"],
        reason: "Need to see the customer list to manage entries in it",
    },
    {
        code: "sales.orders.create",
        requires: [
            "sales.orders.view",
            "sales.customers.view",
            "inventory.warehouses.view",
            "inventory.products.view",
        ],
        reason:
            "The create-order form needs a customer picker, a warehouse picker, and a product picker for order lines; view is needed to see the order list at all",
    },
    {
        code: "sales.orders.approve",
        requires: ["sales.orders.view"],
        reason: "Must be able to see and open an order before approving it",
    },
    {
        code: "sales.orders.ship",
        requires: ["sales.orders.view", "inventory.stock.view"],
        reason:
            "Must be able to see the order, and checking current stock before shipping is standard practice",
    },
    {
        code: "sales.orders.cancel",
        requires: ["sales.orders.view"],
        reason: "Must be able to see and open an order before cancelling it",
    },
    {
        code: "inventory.products.manage",
        requires: ["inventory.products.view"],
        reason: "Need to see the product list to manage entries in it",
    },
    {
        code: "inventory.warehouses.manage",
        requires: ["inventory.warehouses.view"],
        reason: "Need to see the warehouse list to manage entries in it",
    },
    {
        code: "inventory.categories.manage",
        requires: ["inventory.products.view"],
        reason: "Categories are listed under the same view gate as products",
    },
    {
        code: "inventory.stock.adjust",
        requires: [
            "inventory.stock.view",
            "inventory.products.view",
            "inventory.warehouses.view",
        ],
        reason:
            "The stock-movement form needs a product picker and a warehouse picker, plus visibility into current stock",
    },
    {
        code: "inventory.stock.transfer",
        requires: [
            "inventory.stock.view",
            "inventory.products.view",
            "inventory.warehouses.view",
        ],
        reason:
            "The transfer form needs a product picker and two warehouse pickers (source/destination), plus visibility into current stock",
    },
    {
        code: "accounting.accounts.manage",
        requires: ["accounting.accounts.view"],
        reason:
            "Need to see the chart of accounts to manage entries in it (including picking a parent account)",
    },
    {
        code: "accounting.journal.create",
        requires: ["accounting.journal.view", "accounting.accounts.view"],
        reason:
            "The journal entry form needs an account picker for every line; view is needed to see existing entries at all",
    },
    {
        code: "accounting.journal.post",
        requires: ["accounting.journal.view"],
        reason: "Must be able to see and open an entry before posting it",
    },
    {
        code: "accounting.journal.reverse",
        requires: ["accounting.journal.view"],
        reason: "Must be able to see and open an entry before reversing it",
    },
    {
        code: "accounting.settings.manage",
        requires: ["accounting.accounts.view"],
        reason:
            "The settings form has account pickers for every GL mapping slot (Inventory, AP, AR, Revenue, COGS, Salary Expense, Salary Payable, Cash)",
    },
    {
        code: "core.users.manage",
        requires: ["core.roles.manage"],
        reason:
            "The create/edit user form (and the role-assignment action) needs a role picker, and roles are only listable under core.roles.manage",
    },
    {
        code: "hr.employees.manage",
        requires: ["hr.employees.view", "core.roles.manage"],
        reason:
            "Needs the employee list itself (for the manager picker), and the grant-access action's role picker needs core.roles.manage",
    },
    {
        code: "hr.leaves.request",
        requires: ["hr.employees.view"],
        reason:
            "The leave request form has an employee picker (a coordinator filing on behalf of others, not just pure self-service)",
    },
    {
        code: "hr.leaves.approve",
        requires: ["hr.leaves.view"],
        reason: "Must be able to see and open a leave request before approving or rejecting it",
    },
    {
        code: "hr.payroll.components.manage",
        requires: ["hr.employees.view"],
        reason: "Assigning a salary component to an employee needs an employee picker",
    },
    {
        code: "hr.payroll.runs.manage",
        requires: ["hr.payroll.runs.view"],
        reason:
            "Must be able to see and open a payroll run to generate payslips, process, or cancel it",
    },
];

/** code -> direct requires[], built once for O(1) lookup */
const dependencyMap: Record<string, string[]> = PERMISSION_DEPENDENCIES.reduce(
    (map, { code, requires }) => {
        map[code] = requires;
        return map;
    },
    {} as Record<string, string[]>
);

/**
 * Returns every permission code transitively required by `code`
 * (not including `code` itself). Guards against cyclical dependency
 * data so a bad config can't recurse forever.
 */
export function getRequiredPermissions(
    code: string,
    visited: Set<string> = new Set()
): string[] {
    const direct = dependencyMap[code];
    if (!direct || visited.has(code)) return [];
    visited.add(code);

    const result = new Set<string>();
    for (const req of direct) {
        if (visited.has(req)) continue;
        result.add(req);
        for (const nested of getRequiredPermissions(req, visited)) {
            result.add(nested);
        }
    }
    return Array.from(result);
}

/** Optional helper if you want to show *why* a code was auto-added. */
export function getDependencyReason(code: string): string | undefined {
    return PERMISSION_DEPENDENCIES.find((d) => d.code === code)?.reason;
}