import { LayoutDashboard, Users2 } from "lucide-react";
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
    icon: Users2,
    children: [
      
      { id: "branches", label: "Branches", to: "/organization/branches" },
      { id: "departments", label: "Departments", to: "/organization/departments" },
      { id: "users", label: "Users", to: "/organization/users" },
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
