// src/hooks/useBranchDepartments.ts
//
// Departments belonging to one branch. Reuses the existing
// useDepartmentsList() (GET /api/Departments, full set — matching the
// established decision that Departments loads as a whole, no server
// filtering) and filters client-side by branchId, rather than adding a
// new API call. No backend query param for "departments by branch" is
// confirmed to exist, so filtering the already-fetched full list is the
// honest option here, not an invented endpoint.

import { useMemo } from "react";
import { useDepartmentsList } from "./useDepartments.crud";

export function useBranchDepartments(branchId: string | undefined) {
  const { data: allDepartments = [], isLoading, isError, refetch } = useDepartmentsList();

  const departments = useMemo(
    () => allDepartments.filter((d) => d.branchId === branchId),
    [allDepartments, branchId],
  );

  return { data: departments, isLoading, isError, refetch };
}
