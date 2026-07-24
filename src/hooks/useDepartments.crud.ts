// src/hooks/useDepartments.crud.ts
//
// Full CRUD hooks for DepartmentsPage — distinct from hooks/useDepartments.ts
// (the lookup-only version built for Users' dropdowns). Rename either file
// if both land in the same project to avoid the name collision noted in
// services/api/departments.crud.api.ts.
//
// No pagination params here, matching the design decision that this
// module loads the full department set once and builds the tree
// client-side.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type CreateDepartmentPayload,
  type UpdateDepartmentPayload,
} from "../services/api/departments.crud.api";

export const departmentsQueryKeys = {
  all: ["departments-crud"] as const,
};

export function useDepartmentsList() {
  return useQuery({
    queryKey: departmentsQueryKeys.all,
    queryFn: getAllDepartments,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.all });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDepartmentPayload) => updateDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.all });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.all });
    },
  });
}
