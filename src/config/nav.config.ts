// Intended path: src/config/nav.config.ts
//
// Full, unfiltered navigation tree. This file contains ONLY structure —
// no permission checks, no role checks, no imports from permissions.ts.
// Admin users see exactly this tree, verbatim.

import { LayoutDashboard, Users, ShoppingCart, Package } from "lucide-react";
import type { NavItem } from "@/types/nav.types";

export const navConfig: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    // no `permissions` -> always visible to any authenticated user
  },
  {
    id: "sales",
    label: "Sales",
    icon: ShoppingCart,
    children: [
      {
        id: "customers",
        label: "Customers",
        to: "/sales/customers",
        permissions: ["sales.customers.view", "sales.customers.manage"],
      },
      {
        id: "sales-orders",
        label: "Sales Orders",
        to: "/sales/sales-orders",
        permissions: ["sales.orders.view", "sales.orders.create"],
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    children: [
      {
        id: "products",
        label: "Products",
        to: "/inventory/products",
        permissions: ["inventory.products.view"],
      },
    ],
  },
  {
    id: "hr",
    label: "HR",
    icon: Users,
    children: [
      {
        id: "my-attendance",
        label: "My Attendance",
        to: "/hr/my-attendance",
        permissions: ["hr.my-attendance.view"],
      },
      {
        id: "my-requests",
        label: "My Requests",
        to: "/hr/my-requests",
        permissions: ["hr.myRequests"],
      },
    ],
  },
];
