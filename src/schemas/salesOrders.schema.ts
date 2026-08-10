// Project path: src/schemas/salesOrders.schema.ts
//
// No expectedDate ≥ orderDate refine here — unlike Purchase Orders, this
// order has no expectedDate field at all (see spec §1).

import { z } from "zod";

const lineSchema = z.object({
  productId: z.string().min(1, "salesOrders.validation.productRequired"),
  quantity: z.coerce.number().positive("salesOrders.validation.quantityPositive"),
  unitPrice: z.coerce.number().min(0, "salesOrders.validation.priceNonNegative"),
});

export const salesOrderFormSchema = z.object({
  customerId: z.string().min(1, "salesOrders.validation.customerRequired"),
  warehouseId: z.string().min(1, "salesOrders.validation.warehouseRequired"),
  orderDate: z.string().min(1, "salesOrders.validation.orderDateRequired"),
  notes: z.string().max(1000).optional().default(""),
  lines: z.array(lineSchema).min(1, "salesOrders.validation.minOneLine"),
});

export type SalesOrderFormValues = z.infer<typeof salesOrderFormSchema>;
