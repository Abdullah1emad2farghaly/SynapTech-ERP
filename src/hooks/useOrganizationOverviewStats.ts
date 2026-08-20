

import { useMemo } from 'react';
import { useCompany } from './useCompany';
import type { Department } from '@/services/api/departments.crud.api';
import { Branch } from '@/services/api/branches.crud.api';
import { useBranchesList } from './useBranches.crud';
import { useDepartmentsList } from './useDepartments.crud';

export interface GroupCount {
  key: string;
  label: string;
  count: number;
}

export interface TreemapNode {
  name: string;
  size: number;
}

export interface OrganizationOverviewStats {
  totalBranches: number;
  activeBranches: number;
  mainBranch: Branch | null;
  totalDepartments: number;
  activeDepartments: number;
  topLevelDepartments: number;
  nestedDepartments: number;
  branchesByStatus: GroupCount[];
  departmentsByBranch: GroupCount[];
  departmentHierarchy: GroupCount[];
  departmentsTreemap: TreemapNode[];
}

export function useOrganizationOverviewStats() {
  const companyQuery = useCompany();
  const branchesQuery = useBranchesList();
  const departmentsQuery = useDepartmentsList();

  const stats = useMemo<OrganizationOverviewStats | null>(() => {
    if (!branchesQuery.data || !departmentsQuery.data) return null;
    const branches: Branch[] = branchesQuery.data;
    const departments: Department[] = departmentsQuery.data;

    const totalBranches = branches.length;
    const activeBranches = branches.filter(b => b.isActive).length;
    const mainBranch = branches.find(b => b.isMain) ?? null;

    const totalDepartments = departments.length;
    const activeDepartments = departments.filter(d => d.isActive).length;
    const topLevelDepartments = departments.filter(d => !d.parentDepartmentId).length;
    const nestedDepartments = totalDepartments - topLevelDepartments;

    // --- branches by status (donut) ---
    const branchesByStatus: GroupCount[] = [
      { key: 'active', label: 'active', count: activeBranches },
      { key: 'inactive', label: 'inactive', count: totalBranches - activeBranches },
    ].filter(g => g.count > 0);

    // --- departments by branch (bar), explicit Unassigned bucket ---
    const branchNameById = new Map(branches.map(b => [b.id, b.name ?? '—']));
    const deptByBranchMap = new Map<string, GroupCount>();
    for (const d of departments) {
      const key = d.branchId ?? '__unassigned__';
      const existing = deptByBranchMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        deptByBranchMap.set(key, {
          key,
          label: d.branchId ? branchNameById.get(d.branchId) ?? '—' : '__unassigned__',
          count: 1,
        });
      }
    }
    const departmentsByBranch = Array.from(deptByBranchMap.values()).sort((a, b) => b.count - a.count);

    // --- department hierarchy: top-level vs nested (donut) ---
    const departmentHierarchy: GroupCount[] = [
      { key: 'topLevel', label: 'topLevel', count: topLevelDepartments },
      { key: 'nested', label: 'nested', count: nestedDepartments },
    ].filter(g => g.count > 0);

    // --- treemap: department count per branch, same data as the bar chart
    // in a different visual shape (proportional area rather than length) ---
    const departmentsTreemap: TreemapNode[] = departmentsByBranch.map(g => ({
      name: g.label === '__unassigned__' ? 'Unassigned' : g.label,
      size: g.count,
    }));

    return {
      totalBranches,
      activeBranches,
      mainBranch,
      totalDepartments,
      activeDepartments,
      topLevelDepartments,
      nestedDepartments,
      branchesByStatus,
      departmentsByBranch,
      departmentHierarchy,
      departmentsTreemap,
    };
  }, [branchesQuery.data, departmentsQuery.data]);

  return {
    stats,
    isLoading: branchesQuery.isLoading || departmentsQuery.isLoading,
    isError: branchesQuery.isError || departmentsQuery.isError,
    company: companyQuery.data,
    isCompanyLoading: companyQuery.isLoading,
    isCompanyError: companyQuery.isError,
    refetch: () => {
      companyQuery.refetch();
      branchesQuery.refetch();
      departmentsQuery.refetch();
    },
  };
}
