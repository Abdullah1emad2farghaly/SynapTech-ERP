// src/hooks/useBranch.ts
//
// Single-branch fetch for BranchDetailsPage. Reuses getBranchById from
// the existing services/api/branches.crud.api.ts — no new API logic,
// just a query hook that wasn't needed before (BranchesPage only ever
// used the full list plus client-side lookup, since Details was a
// drawer fed from already-loaded data).

import { useQuery } from "@tanstack/react-query";
import { getBranchById } from "../services/api/branches.crud.api";

export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: ["branches-crud", "detail", id] as const,
    queryFn: () => getBranchById(id!),
    enabled: !!id,
  });
}
