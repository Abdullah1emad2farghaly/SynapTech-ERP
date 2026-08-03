// Project path: src/schemas/purchaseOrders.schema.ts

import { z } from "zod";

const lineSchema = z.object({
  productId: z.string().min(1, "purchaseOrders.validation.productRequired"),
  quantity: z.coerce.number().positive("purchaseOrders.validation.quantityPositive"),
  unitPrice: z.coerce.number().min(0, "purchaseOrders.validation.priceNonNegative"),
});

export const purchaseOrderFormSchema = z
  .object({
    supplierId: z.string().min(1, "purchaseOrders.validation.supplierRequired"),
    warehouseId: z.string().min(1, "purchaseOrders.validation.warehouseRequired"),
    orderDate: z.string().min(1, "purchaseOrders.validation.orderDateRequired"),
    expectedDate: z.string().min(1, "purchaseOrders.validation.expectedDateRequired"),
    notes: z.string().max(1000).optional().default(""),
    lines: z.array(lineSchema).min(1, "purchaseOrders.validation.minOneLine"),
  })
  .refine((data) => data.expectedDate >= data.orderDate, {
    message: "purchaseOrders.validation.expectedBeforeOrder",
    path: ["expectedDate"],
  });

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;
