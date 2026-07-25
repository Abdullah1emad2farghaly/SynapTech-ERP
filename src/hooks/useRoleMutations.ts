// Project path: src/hooks/useRoleMutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
} from "../services/api/roles.crud.api";
import { rolesQueryKeys } from "./useRoles";
import type {
  CreateRolePayload,
  UpdateRolePayload,
  AssignPermissionsPayload,
} from "../types/roles.types";

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(id) });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
}

export function useAssignPermissions(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignPermissionsPayload) =>
      assignPermissions(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(id) });
    },
  });
}
