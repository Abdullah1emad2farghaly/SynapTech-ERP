// Intended project path: src/hooks/useCashier.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCashMovement,
  closeShift,
  createCashierOrder,
  getCashierInvoice,
  getCashierOrder,
  getCashierOrderInvoice,
  getCashierOrders,
  getMyCurrentShift,
  getMyShiftHistory,
  getShift,
  getShiftClosingReport,
  openShift,
  voidCashierOrder,
  type CashMovementRequest,
  type CloseShiftRequest,
  type CreateCashierOrderRequest,
  type OpenShiftRequest,
  type VoidCashierOrderRequest,
} from "../services/api/cashier.api";

// Query keys, grouped for consistent invalidation.
export const cashierKeys = {
  orders: ["cashier", "orders"] as const,
  order: (id: string) => ["cashier", "orders", id] as const,
  orderInvoice: (id: string) => ["cashier", "orders", id, "invoice"] as const,
  invoice: (id: string) => ["cashier", "invoices", id] as const,
  currentShift: ["cashier", "shifts", "current"] as const,
  shiftHistory: ["cashier", "shifts", "history"] as const,
  shift: (id: string) => ["cashier", "shifts", id] as const,
  closingReport: (id: string) => ["cashier", "shifts", id, "closing-report"] as const,
};

// ── Orders ──────────────────────────────────────────────────────────────

export const useCashierOrders = () =>
  useQuery({ queryKey: cashierKeys.orders, queryFn: getCashierOrders });

export const useCashierOrder = (id: string | undefined) =>
  useQuery({
    queryKey: cashierKeys.order(id ?? ""),
    queryFn: () => getCashierOrder(id as string),
    enabled: Boolean(id),
  });

export const useCreateCashierOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCashierOrderRequest) => createCashierOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashierKeys.orders });
      queryClient.invalidateQueries({ queryKey: cashierKeys.currentShift });
    },
  });
};

export const useVoidCashierOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VoidCashierOrderRequest }) =>
      voidCashierOrder(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: cashierKeys.orders });
      queryClient.invalidateQueries({ queryKey: cashierKeys.order(variables.id) });
    },
  });
};

export const useCashierOrderInvoice = (orderId: string | undefined) =>
  useQuery({
    queryKey: cashierKeys.orderInvoice(orderId ?? ""),
    queryFn: () => getCashierOrderInvoice(orderId as string),
    enabled: Boolean(orderId),
  });

// ── Invoices ────────────────────────────────────────────────────────────

export const useCashierInvoice = (id: string | undefined) =>
  useQuery({
    queryKey: cashierKeys.invoice(id ?? ""),
    queryFn: () => getCashierInvoice(id as string),
    enabled: Boolean(id),
  });

// ── Shifts ──────────────────────────────────────────────────────────────

export const useMyCurrentShift = () =>
  useQuery({
    queryKey: cashierKeys.currentShift,
    queryFn: async () => {
      try {
        return await getMyCurrentShift();
      } catch {
        // ASSUMPTION: no open shift surfaces as an error (shape unconfirmed) —
        // treated as "no current shift" rather than a hard failure, so the
        // POS can render the Open Shift screen instead of an error state.
        return null;
      }
    },
  });

export const useMyShiftHistory = () =>
  useQuery({ queryKey: cashierKeys.shiftHistory, queryFn: getMyShiftHistory });

export const useShift = (id: string | undefined) =>
  useQuery({
    queryKey: cashierKeys.shift(id ?? ""),
    queryFn: () => getShift(id as string),
    enabled: Boolean(id),
  });

export const useShiftClosingReport = (id: string | undefined) =>
  useQuery({
    queryKey: cashierKeys.closingReport(id ?? ""),
    queryFn: () => getShiftClosingReport(id as string),
    enabled: Boolean(id),
  });

export const useOpenShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpenShiftRequest) => openShift(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashierKeys.currentShift });
      queryClient.invalidateQueries({ queryKey: cashierKeys.shiftHistory });
    },
  });
};

export const useAddCashMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, payload }: { shiftId: string; payload: CashMovementRequest }) =>
      addCashMovement(shiftId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: cashierKeys.currentShift });
      queryClient.invalidateQueries({ queryKey: cashierKeys.shift(variables.shiftId) });
    },
  });
};

export const useCloseShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, payload }: { shiftId: string; payload: CloseShiftRequest }) =>
      closeShift(shiftId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: cashierKeys.currentShift });
      queryClient.invalidateQueries({ queryKey: cashierKeys.shiftHistory });
      queryClient.invalidateQueries({ queryKey: cashierKeys.shift(variables.shiftId) });
    },
  });
};
