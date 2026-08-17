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
    id: "sales",
    label: "Sales",
    to: "/sales", 
    icon: Package,
    children: [
      { id: "customers", label: "Customers", to: "sales/customers" }, 
      { id: "sales-orders", label: "Sales Orders", to: "sales/sales-orders" },
      // { id: "employees", label: "Employees", to: "sales/employees" },
    ],
  },
  
  {
    id: "purchasing",
    label: "Purchasing",
    to: "/purchasing",
    icon: Package,
    children: [
      //suppliers
      { id: "suppliers", label: "Suppliers", to: "/purchasing/suppliers" },
      { id: "purchase-orders-list", label: "Purchase Orders", to: "/purchasing/purchase-orders" },

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
    id: "hr",
    label: "HR & Payroll",
    to: "/hr",
    icon: Users2,
    children: [
      { id: "hr-directory", label: "Employees", to: "/hr/employees" },
      { id: "hr-attendance", label: "Attendance", to: "/hr/attendance" },
      { id: "leave-requests", label: "Leave Requests", to: "/hr/leave-requests" },
      { id: "my-requests", label: "My Requests", to: "/hr/my-requests" }
    ],
  },
  {
    id: "organization",
    label: "Organization",
    to: "/Organization",
    icon: Building2,
    children: [
      
      { id: "branches", label: "Branches", to: "/organization/branches" },
      { id: "departments", label: "Departments", to: "/organization/departments" },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    to: "/administration",
    icon: Users2,
    children: [
      { id: "users", label: "Users", to: "/administration/users" },
      { id: "roles", label: "Roles & Permissions", to: "/administration/roles" },
    ],
  },
  
  
  
  
  
  // {
  //   id: "hr",
  //   label: "HR & Payroll",
  //   to: "/hr",
  //   icon: Users2,
  //   children: [
  //     { id: "hr-directory", label: "Employees", to: "/hr/employees" },
  //     { id: "hr-attendance", label: "Attendance", to: "/hr/attendance" },
  //     { id: "hr-payroll", label: "Payroll", to: "/hr/payroll" },
  //     { id: "hr-org-chart", label: "Org Chart", to: "/hr/org-chart" },
  //   ],
  // },

];
