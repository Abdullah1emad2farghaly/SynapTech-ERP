// Project path: src/hooks/useWarehouseMutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../services/api/warehouses.crud.api";
import { warehousesQueryKeys } from "./useWarehouses";
import type {
  CreateWarehousePayload,
  UpdateWarehousePayload,
} from "../types/warehouses.types";
import axios from "axios";

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWarehousePayload) => createWarehouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehousesQueryKeys.all });
    },
    onError: (err)=>{
      if(axios.isAxiosError(err))
        console.log(err.response?.data)
    }
  });
}

export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWarehousePayload) => updateWarehouse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehousesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: warehousesQueryKeys.detail(id) });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehousesQueryKeys.all });
    },
    
  });
}

/** Activate/Deactivate — no dedicated endpoint, reuses PUT with isActive flipped.
 *  Needs the warehouse's other current fields, since PUT replaces the whole record.
 *  Takes { id, payload } as mutation variables (rather than a fixed hook-init id)
 *  so a single hook instance can toggle any row from a list page. */
export function useSetWarehouseActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWarehousePayload }) =>
      updateWarehouse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehousesQueryKeys.all });
    },
  });
}
