// Project path: src/hooks/useEmployeeManagerOptions.ts
//
// Same 5-minute staleTime convention as the other org-structure lookup hooks
// (useBranches, useDepartments, useRoles) since manager candidates change
// rarely relative to page views.

import { useQuery } from "@tanstack/react-query";
import { getEmployeeManagerOptions } from "../services/api/employees.lookup.api";

export function useEmployeeManagerOptions(excludeEmployeeId?: string) {
  return useQuery({
    queryKey: ["employees", "manager-options", excludeEmployeeId ?? null],
    queryFn: () => getEmployeeManagerOptions(excludeEmployeeId),
    staleTime: 5 * 60 * 1000,
  });
}
