// Intended project path: src/constants/cashierConfig.ts
//
// FLAGGED, UNCONFIRMED: the Cashier API contract does NOT document enum
// values for CashierPaymentRequest.method or CashMovementRequest.movementType
// (both are typed `string | null` on the backend). The lists below are a
// frontend-only, provisional configuration — NOT a confirmed backend enum.
// Swap/extend freely; the request payload only ever sends the raw string.

export interface CashierPaymentMethodOption {
  value: string;
  labelKey: string; // i18n key, resolved via t()
}

export const CASHIER_PAYMENT_METHODS: CashierPaymentMethodOption[] = [
  { value: "Cash", labelKey: "cashier.paymentMethods.cash" },
  { value: "Card", labelKey: "cashier.paymentMethods.card" },
  { value: "Other", labelKey: "cashier.paymentMethods.other" },
];

export interface CashMovementTypeOption {
  value: string;
  labelKey: string;
  direction: "in" | "out"; // frontend-only convenience for icon/color, not sent to API
}

export const CASH_MOVEMENT_TYPES: CashMovementTypeOption[] = [
  { value: "CashIn", labelKey: "cashier.movementTypes.cashIn", direction: "in" },
  { value: "CashOut", labelKey: "cashier.movementTypes.cashOut", direction: "out" },
];

// Order status → badge tone. Backend `status` has no documented enum either;
// unrecognized values fall back to a neutral tone rather than being hidden.
export const CASHIER_ORDER_STATUS_TONE: Record<string, "success" | "error" | "neutral" | "warning"> = {
  Completed: "success",
  Voided: "error",
  Open: "warning",
};

export const CASHIER_SHIFT_STATUS_TONE: Record<string, "success" | "error" | "neutral" | "warning"> = {
  Open: "success",
  Closed: "neutral",
};
