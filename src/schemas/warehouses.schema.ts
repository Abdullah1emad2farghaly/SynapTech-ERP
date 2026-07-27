// Project path: src/schemas/warehouses.schema.ts

import { z } from "zod";

export const warehouseFormSchema = z.object({
  name: z
    .string()
    .min(2, "warehouses.validation.nameMin")
    .max(80, "warehouses.validation.nameMax"),
  code: z
    .string()
    .min(1, "warehouses.validation.codeRequired")
    .max(20, "warehouses.validation.codeMax"),
  branchId: z.string().min(1, "warehouses.validation.branchRequired"),
  isActive: z.boolean(),
});

export type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;
