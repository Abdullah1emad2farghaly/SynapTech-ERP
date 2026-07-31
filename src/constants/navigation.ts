import { LayoutDashboard, Users2, Building2, Wallet, Package } from "lucide-react";
import type { NavItem } from "@/types/nav.types";

// The single source of truth for the sidebar tree. Add a module's entry
// here and it appears in the shell — no other file needs to change.
export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "organization",
    label: "Organization",
    to: "/Organization",
    icon: Building2,
    children: [
      
      { id: "branches", label: "Branches", to: "/organization/branches" },
      { id: "departments", label: "Departments", to: "/organization/departments" },
      { id: "users", label: "Users", to: "/organization/users" },
      { id: "roles", label: "Roles", to: "/organization/roles" },
    ],
  },
  {
    id: "accounting",
    label: "Accounting",
    to: "/accounting",
    icon: Wallet,
    children: [
      { id: "accounts", label: "Chart Of Accounts", to: "accounting/accounts" },
      { id: "journalEntries", label: "Journal Entries", to: "accounting/journal-entries" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    to: "/inventory",
    icon: Package,
    children: [
      { id: "warehouses", label: "Warehouses", to: "inventory/warehouses" },
      { id: "categories", label: "Categories", to: "inventory/categories" },
      { id: "products", label: "Products", to: "inventory/products" },
      { id: "stock", label: "Stock", to: "inventory/stock" },
      { id: "newMovment", label: "New Movement", to: "inventory/new-movement" },
      // { id: "journalEntries", label: "Journal Entries", to: "accounting/journal-entries" },
    ],
  },
  {
    id: "hr",
    label: "HR & Payroll",
    to: "/hr",
    icon: Users2,
    children: [
      { id: "hr-directory", label: "Employees", to: "/hr/employees" },
      { id: "hr-attendance", label: "Attendance", to: "/hr/attendance" },
      { id: "hr-payroll", label: "Payroll", to: "/hr/payroll" },
      { id: "hr-org-chart", label: "Org Chart", to: "/hr/org-chart" },
    ],
  },

];
