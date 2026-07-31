// src/schemas/product.schema.ts
//
// Follows CreateUserDrawer's precedent (React Hook Form + Zod) rather than the
// plain-useState pattern used by DepartmentDrawer/BranchDrawer. This is a deliberate
// choice for the newest module rather than adding a third form-handling pattern —
// see handoff Section 10, technical debt item #1 ("worth picking one pattern and
// normalizing"). Departments/Branches drawers are NOT touched by this file.
import { z } from "zod";

export const productFormSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(1, "products.form.errors.skuRequired")
      .max(64, "products.form.errors.skuTooLong"),
    name: z
      .string()
      .trim()
      .min(1, "products.form.errors.nameRequired")
      .max(200, "products.form.errors.nameTooLong"),
    description: z
      .string()
      .trim()
      .max(2000, "products.form.errors.descriptionTooLong")
      .optional()
      .or(z.literal("")),
    categoryId: z
      .string()
      .trim()
      .min(1, "products.form.errors.categoryRequired"),
    unitOfMeasure: z
      .string()
      .trim()
      .min(1, "products.form.errors.unitOfMeasureRequired"),
    costPrice: z
      .number({ invalid_type_error: "products.form.errors.costPriceRequired" })
      .min(0, "products.form.errors.costPriceNonNegative"),
    salePrice: z
      .number({ invalid_type_error: "products.form.errors.salePriceRequired" })
      .min(0, "products.form.errors.salePriceNonNegative"),
    isActive: z.boolean(),
  })
  .refine((values) => values.salePrice >= values.costPrice, {
    // Client-side guard only, same category as Departments' circular-hierarchy
    // guard — the backend does not confirm this rule, so it's enforced here to
    // protect the user from an obviously-wrong entry, not because it's a
    // confirmed server-side constraint.
    message: "products.form.errors.salePriceBelowCost",
    path: ["salePrice"],
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productFormDefaultValues: ProductFormValues = {
  sku: "",
  name: "",
  description: "",
  categoryId: "",
  unitOfMeasure: "",
  costPrice: 0,
  salePrice: 0,
  isActive: true,
};
