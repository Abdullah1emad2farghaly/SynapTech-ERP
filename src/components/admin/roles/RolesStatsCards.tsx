// Project path: src/components/admin/roles/RolesStatsCards.tsx
//
// Stats are derived entirely from confirmed data (role count, catalog size,
// sum of assigned permissions). No System/Custom split and no trend deltas —
// no field on RoleResponse backs either, so they're cut rather than faked.

import { useTranslation } from "react-i18next";
import { ShieldCheck, KeyRound, ListChecks } from "lucide-react";
import type { RoleResponse, PermissionResponse } from "../../../types/roles.types";

interface RolesStatsCardsProps {
  roles: RoleResponse[];
  permissionsCatalog: PermissionResponse[];
  isLoading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[--hairline] bg-[--panel] p-5 shadow-[var(--elevation-1)] transition-transform duration-150 ease-out hover:-translate-y-0.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[--signal]/10 text-[--signal]">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-[--ink-primary]">{value}</p>
        <p className="text-sm text-[--ink-secondary]">{label}</p>
      </div>
    </div>
  );
}

export function RolesStatsCards({
  roles,
  permissionsCatalog,
  isLoading,
}: RolesStatsCardsProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[76px] animate-pulse rounded-lg bg-[--sunken]"
          />
        ))}
      </div>
    );
  }

  const totalAssignedPermissions = roles.reduce(
    (sum, role) => sum + role.permissions.length,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={<ShieldCheck size={20} />}
        label={t("roles.stats.totalRoles")}
        value={roles.length}
      />
      <StatCard
        icon={<KeyRound size={20} />}
        label={t("roles.stats.availablePermissions")}
        value={permissionsCatalog.length}
      />
      <StatCard
        icon={<ListChecks size={20} />}
        label={t("roles.stats.totalAssignedPermissions")}
        value={totalAssignedPermissions}
      />
    </div>
  );
}
