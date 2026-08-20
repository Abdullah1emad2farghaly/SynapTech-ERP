// src/config/nav.config.ts

import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Truck,
  Boxes,
  Wallet,
  GitBranch,
  Settings,
  ShieldCheck,
} from "lucide-react";

import type { NavItem } from "@/types/nav.types";
interface CurrentUser {
  accessToken: string;
  email: string
  fullName: string;
  refreshToken:string;
  role: string;
  userId: string;
}

export const useNavItems = (): NavItem[] => {
  const { t } = useTranslation();



  const result = localStorage.getItem("currentUser");

  const currentUser: CurrentUser | null = result
    ? JSON.parse(result)
    : null;

  const userRole = currentUser?.role

  return [
    // =========================================================
    // DASHBOARD
    // =========================================================
    // {
    //   id: "dashboard",
    //   label: t("sidebar.dashboard"),
    //   to: "/dashboard",
    //   icon: LayoutDashboard,
    // },

    // =========================================================
    // SALES
    // =========================================================
    {
      id: "sales",
      label: t("sidebar.sales"),
      to: "/sales",
      icon: ShoppingCart,
      children: [
        {
          id: "customers",
          label: t("sidebar.customers"),
          to: "/sales/customers",
          permissions: [
            "sales.customers.view",
            "sales.customers.manage",
          ],
        },
        {
          id: "sales-orders",
          label: t("sidebar.salesOrders"),
          to: "/sales/sales-orders",
          permissions: [
            "sales.orders.view",
            "sales.orders.create",
            "sales.orders.approve",
            "sales.orders.cancel",
            "sales.orders.ship",
          ],
        },
        // {
        //   id: "sales-invoices",
        //   label: t("sidebar.salesInvoices"),
        //   to: "/sales/invoices",
        //   permissions: [
        //     "sales.invoices.view",
        //     "sales.invoices.create",
        //     "sales.invoices.approve",
        //   ],
        // },
      ],
    },

    // =========================================================
    // PURCHASING
    // =========================================================
    {
      id: "purchasing",
      label: t("sidebar.purchasing"),
      to: "/purchasing",
      icon: Truck,
      children: [
        {
          id: "suppliers",
          label: t("sidebar.suppliers"),
          to: "/purchasing/suppliers",
          permissions: [
            "purchasing.suppliers.view",
            "purchasing.suppliers.manage",
          ],
        },
        {
          id: "purchase-orders-list",
          label: t("sidebar.purchaseOrders"),
          to: "/purchasing/purchase-orders",
          permissions: [
            "purchasing.orders.view",
            "purchasing.orders.create",
            "purchasing.orders.manage",
            "purchasing.orders.approve",
            "purchasing.orders.cancel",
            "purchasing.orders.receive",
          ],
        },
      ],
    },

    // =========================================================
    // INVENTORY
    // =========================================================
    {
      id: "inventory",
      label: t("sidebar.inventory"),
      to: "/inventory",
      icon: Boxes,
      children: [
        {
          id: "warehouses",
          label: t("sidebar.warehouses"),
          to: "/inventory/warehouses",
          permissions: [
            "inventory.warehouses.view",
            "inventory.warehouses.manage",
          ],
        },
        {
          id: "categories",
          label: t("sidebar.categories"),
          to: "/inventory/categories",
          permissions: [
            "inventory.categories.manage",
          ],
        },
        {
          id: "products",
          label: t("sidebar.products"),
          to: "/inventory/products",
          permissions: [
            "inventory.products.view",
            "inventory.products.manage",
          ],
        },
        {
          id: "stock",
          label: t("sidebar.stock"),
          to: "/inventory/stock",
          permissions: [
            "inventory.stock.view",
            "inventory.stock.adjust",
            "inventory.stock.transfer",
          ],
        },
      ],
    },

    // =========================================================
    // ACCOUNTING
    // =========================================================
    {
      id: "accounting",
      label: t("sidebar.accounting"),
      to: "/accounting",
      icon: Wallet,
      children: [
        {
          id: "accounts",
          label: t("sidebar.chartOfAccounts"),
          to: "/accounting/accounts",
          permissions: [
            "accounting.accounts.view",
            "accounting.accounts.manage",
          ],
        },
        {
          id: "journalEntries",
          label: t("sidebar.journalEntries"),
          to: "/accounting/journal-entries",
          permissions: [
            "accounting.journal.view",
            "accounting.journal.create",
            "accounting.journal.post",
            "accounting.journal.reverse",
          ],
        },
        // {
        //   id: "accounting-settings",
        //   label: t("sidebar.accountingSettings"),
        //   to: "/accounting/settings",
        //   permissions: [
        //     "accounting.settings.manage",
        //   ],
        // },
      ],
    },

    // =========================================================
    // HR
    // =========================================================
    {
      id: "hr",
      label: t("sidebar.hr"),
      to: "/hr",
      icon: Users,
      children: [
        {
          id: "hr-directory",
          label: t("sidebar.employees"),
          to: "/hr/employees",
          permissions: [
            "hr.employees.view",
            "hr.employees.manage",
          ],
        },
        {
          id: "hr-attendance",
          label: t("sidebar.attendance"),
          to: "/hr/attendance",
          permissions: [
            "hr.attendance.view",
          ],
        },
        {
          id: "hr-my-attendance",
          label: t("sidebar.myAttendance"),
          to: "/hr/my-attendance",
          permissions: [
            "hr.my-attendance.view",
          ],
        },
        {
          id: "leave-requests",
          label: t("sidebar.leaveRequests"),
          to: "/hr/leave-requests",
          permissions: [
            "hr.leaves.view",
            "hr.leaves.approve",
          ],
        },
        {
          id: "my-requests",
          label: t("sidebar.myRequests"),
          to: "/hr/my-requests",
          permissions: [
            "hr.myRequests",
          ],
        },
      ],
    },

    // =========================================================
    // ORGANIZATION
    // =========================================================
    {
      id: "organization",
      label: t("sidebar.organization"),
      to: "/organization",
      icon: GitBranch,
      children: [
        {
          id: "branches",
          label: t("sidebar.branches"),
          to: "/organization/branches",
          permissions: [
            "core.branches.manage",
          ],
        },
        {
          id: "departments",
          label: t("sidebar.departments"),
          to: "/organization/departments",
          permissions: [
            "core.departments.manage",
          ],
        },
        {
          id: "companies",
          label: t("sidebar.companies"),
          to: "/organization/companies",
          permissions: [
            "core.companies.manage",
          ],
        },
      ],
    },

    // =========================================================
    // ADMINISTRATION
    // =========================================================
    {
      id: "administration",
      label: t("sidebar.administration"),
      to: "/administration",
      icon: ShieldCheck,
      children: [
        {
          id: "users",
          label: t("sidebar.users"),
          to: "/administration/users",
          permissions: [
            "core.users.manage",
          ],
        },
        {
          id: "roles",
          label: t("sidebar.rolesAndPermissions"),
          to: "/administration/roles",
          permissions: [
            "core.roles.manage",
          ],
        },
      ],
    },

    // =========================================================
    // SETTINGS
    // =========================================================
    {
      id: "settings",
      label: t("sidebar.companySettings"),
      to: "/settings",
      icon: Settings,
      permissions: [
        "accounting.settings.manage",
      ],
    },
  ];
};