// Project path: src/components/admin/employees/EmployeesKpiRow.tsx
//
// All four KPIs are computed from real data, nothing hardcoded:
// - Total / Active / With Access are derived client-side from the fetched
//   Employees list (same pattern as Departments'/Roles' client-computed KPIs).
// - "Departments" reuses the already-built Departments module's lookup count
//   rather than inventing a metric — it's the count of departments that
//   actually exist in the org, a legitimate contextual number to sit next to
//   headcount. If that lookup hook isn't wired in yet, this card is safe to
//   drop without affecting the other three.
//
// "Active" is intentionally tolerant of the unconfirmed status enum — it
// matches case-insensitively on "active" rather than assuming an exact
// string, since no enum was ever confirmed for the `status` field.

import { Users, UserCheck, KeyRound, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EmployeeResponse } from "../../../types/employee.types";

interface EmployeesKpiRowProps {
  employees: EmployeeResponse[];
  departmentsCount?: number;
  isLoading?: boolean;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-5 shadow-[var(--elevation-1)]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--ink-secondary)]">{label}</span>
        <div className="rounded-md bg-[var(--signal)]/10 p-2 text-[var(--signal)]">
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>
      {isLoading ? (
        <div className="mt-3 h-7 w-16 animate-pulse rounded bg-[var(--sunken)]" />
      ) : (
        <p className="mt-3 text-2xl font-semibold text-[var(--ink-primary)]">{value}</p>
      )}
    </div>
  );
}

export function EmployeesKpiRow({
  employees,
  departmentsCount,
  isLoading,
}: EmployeesKpiRowProps) {
  const { t } = useTranslation();

  const total = employees.length;
  const active = employees.filter(
    (e) => e.status?.trim().toLowerCase() === "active"
  ).length;
  const withAccess = employees.filter((e) => Boolean(e.userId)).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={Users}
        label={t("employees.kpi.total", "Total Employees")}
        value={total}
        isLoading={isLoading}
      />
      <KpiCard
        icon={UserCheck}
        label={t("employees.kpi.active", "Active Employees")}
        value={active}
        isLoading={isLoading}
      />
      <KpiCard
        icon={KeyRound}
        label={t("employees.kpi.withAccess", "Employees With Access")}
        value={withAccess}
        isLoading={isLoading}
      />
      {departmentsCount !== undefined && (
        <KpiCard
          icon={Building2}
          label={t("employees.kpi.departments", "Departments")}
          value={departmentsCount}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
