// src/hooks/useCustomers.crud.ts
//
// No naming-collision risk — this is the only Customers hook file.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type CreateCustomerPayload,
  type UpdateCustomerPayload,
} from "../services/api/customers.crud.api";

export const customersQueryKeys = {
  all: ["customers-crud"] as const,
};

export function useCustomersList() {
  return useQuery({
    queryKey: customersQueryKeys.all,
    queryFn: getAllCustomers,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCustomerPayload) => updateCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.all });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.all });
    },
  });
}
