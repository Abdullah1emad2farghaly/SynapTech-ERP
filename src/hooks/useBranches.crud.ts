// src/hooks/useBranches.crud.ts
//
// Full CRUD hooks for BranchesPage — distinct from hooks/useBranches.ts
// (the lookup-only version for Users/Departments' dropdowns).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  type CreateBranchPayload,
  type UpdateBranchPayload,
} from "../services/api/branches.crud.api";

export const branchesQueryKeys = {
  all: ["branches-crud"] as const,
};

export function useBranchesList() {
  return useQuery({
    queryKey: branchesQueryKeys.all,
    queryFn: getAllBranches,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => createBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchesQueryKeys.all });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBranchPayload) => updateBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchesQueryKeys.all });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchesQueryKeys.all });
    },
  });
}
