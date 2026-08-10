// Project path: src/hooks/useEmployees.ts
//
// Follows the established query-key + invalidate-on-mutation convention used
// by Users/Departments/Branches/Roles/etc. Single `.all` key since, like
// Departments/Branches, there's no confirmed server-side pagination to key
// per-page — the full list is fetched and paged/filtered client-side.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  grantEmployeeAccess,
} from "../services/api/employees.api";
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  GrantEmployeeAccessRequest,
} from "../types/employee.types";

export const employeesQueryKeys = {
  all: ["employees"] as const,
  detail: (id: string) => ["employees", "detail", id] as const,
};

export function useEmployeesList() {
  return useQuery({
    queryKey: employeesQueryKeys.all,
    queryFn: getEmployees,
  });
}

// Alias: the Manager selector (and anything else that just needs "the
// employees") consumes this directly — no separate manager-lookup service.
// Manager IS an Employee, so the existing Employees data is the correct and
// only source, per the module's integration rules.
export const useEmployees = useEmployeesList;

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeesQueryKeys.detail(id ?? ""),
    queryFn: () => getEmployeeById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeeRequest) => createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKeys.all });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeeRequest }) =>
      updateEmployee(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: employeesQueryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKeys.all });
    },
  });
}

export function useGrantEmployeeAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GrantEmployeeAccessRequest }) =>
      grantEmployeeAccess(id, payload),
    onSuccess: (_data, variables) => {
      // grant-access changes userId on the employee record, so both the
      // list (System Access column) and the detail view must refetch.
      queryClient.invalidateQueries({ queryKey: employeesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: employeesQueryKeys.detail(variables.id) });
    },
  });
}
