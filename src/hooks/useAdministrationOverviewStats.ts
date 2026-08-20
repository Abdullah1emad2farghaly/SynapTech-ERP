

import { useMemo } from 'react';
import { useListUsers, useUsers } from './useUsers';
import { useRoles, usePermissionsCatalog } from './useRoles';
import type { User } from '@/types/users.types';
import type { RoleResponse } from '@/types/roles.types';

export interface GroupCount {
  key: string;
  label: string;
  count: number;
}

export interface RolePermissionCount {
  roleId: string;
  roleName: string;
  permissionCount: number;
}

export interface AdministrationOverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  usersByRole: GroupCount[];
  usersByStatus: GroupCount[];
  usersByBranch: GroupCount[];
  usersByDepartment: GroupCount[];
  rolesByPermissionCount: RolePermissionCount[];
  permissionsByModule: GroupCount[];
  usersWithoutRoles: User[];
  usersWithoutRolesCount: number;
  rolesWithNoUsers: RoleResponse[];
}

export function useAdministrationOverviewStats() {
  const usersQuery = useListUsers();
  const rolesQuery = useRoles();  
  const permissionsCatalogQuery = usePermissionsCatalog();

  const stats = useMemo<AdministrationOverviewStats | null>(() => {
    if (!usersQuery.data || !rolesQuery.data) return null;
    const users = usersQuery.data;
    const roles = rolesQuery.data;
    const permissionsCatalog = permissionsCatalogQuery.data ?? [];

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalRoles = roles.length;
    const totalPermissions = permissionsCatalog.length;

    // --- users by role (a user can hold multiple roles — counted once per role) ---
    const roleCounts = new Map<string, number>();
    for (const u of users) {
      for (const roleName of u.roles ?? []) {
        roleCounts.set(roleName, (roleCounts.get(roleName) ?? 0) + 1);
      }
    }
    const usersByRole: GroupCount[] = Array.from(roleCounts.entries())
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.count - a.count);

    // --- users by status ---
    const usersByStatus: GroupCount[] = [
      { key: 'active', label: 'active', count: activeUsers },
      { key: 'inactive', label: 'inactive', count: totalUsers - activeUsers },
    ].filter(g => g.count > 0);

    // --- users by branch / department (both already resolved server-side
    // as branchName/departmentName on UserResponse — no cross-referencing
    // needed here, unlike most of the other Overview domains) ---
    const branchCounts = new Map<string, GroupCount>();
    for (const u of users) {
      const key = u.branchId ?? '__unassigned__';
      const existing = branchCounts.get(key);
      if (existing) existing.count += 1;
      else branchCounts.set(key, { key, label: u.branchName ?? '__unassigned__', count: 1 });
    }
    const usersByBranch = Array.from(branchCounts.values()).sort((a, b) => b.count - a.count);

    const deptCounts = new Map<string, GroupCount>();
    for (const u of users) {
      const key = u.departmentId ?? '__unassigned__';
      const existing = deptCounts.get(key);
      if (existing) existing.count += 1;
      else deptCounts.set(key, { key, label: u.departmentName ?? '__unassigned__', count: 1 });
    }
    const usersByDepartment = Array.from(deptCounts.values()).sort((a, b) => b.count - a.count);

    // --- roles ranked by permission count ---
    const rolesByPermissionCount: RolePermissionCount[] = roles
      .map(r => ({ roleId: r.id, roleName: r.name ?? '—', permissionCount: (r.permissions ?? []).length }))
      .sort((a, b) => b.permissionCount - a.permissionCount);

    // --- permissions catalog by module (system-capability view, not a
    // user/role count — a distinct data source from everything else here) ---
    const moduleCounts = new Map<string, number>();
    for (const p of permissionsCatalog) {
      const key = p.module ?? 'Unknown';
      moduleCounts.set(key, (moduleCounts.get(key) ?? 0) + 1);
    }
    const permissionsByModule: GroupCount[] = Array.from(moduleCounts.entries()).map(([key, count]) => ({
      key,
      label: key,
      count,
    }));

    // --- data-quality alerts ---
    const usersWithoutRoles = users.filter(u => !u.roles || u.roles.length === 0);
    const assignedRoleNames = new Set(users.flatMap(u => u.roles ?? []));
    const rolesWithNoUsers = roles.filter(r => !assignedRoleNames.has(r.name ?? ''));

    return {
      totalUsers,
      activeUsers,
      totalRoles,
      totalPermissions,
      usersByRole,
      usersByStatus,
      usersByBranch,
      usersByDepartment,
      rolesByPermissionCount,
      permissionsByModule,
      usersWithoutRoles: usersWithoutRoles.slice(0, 6),
      usersWithoutRolesCount: usersWithoutRoles.length,
      rolesWithNoUsers,
    };
  }, [usersQuery.data, rolesQuery.data, permissionsCatalogQuery.data]);

  return {
    stats,
    isLoading: usersQuery.isLoading || rolesQuery.isLoading,
    isError: usersQuery.isError || rolesQuery.isError,
    isPermissionsCatalogLoading: permissionsCatalogQuery.isLoading,
    isPermissionsCatalogError: permissionsCatalogQuery.isError,
    refetch: () => {
      usersQuery.refetch();
      rolesQuery.refetch();
      permissionsCatalogQuery.refetch();
    },
  };
}
