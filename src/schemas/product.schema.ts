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

    categoryId: z.preprocess(
      (value) => (value === "" ? null : value),
      z.string().trim().nullable(),
    ),

    unitOfMeasure: z
      .string()
      .trim()
      .min(1, "products.form.errors.unitOfMeasureRequired"),

    costPrice: z
      .number({
        invalid_type_error:
          "products.form.errors.costPriceRequired",
      })
      .min(
        0,
        "products.form.errors.costPriceNonNegative",
      ),

    salePrice: z
      .number({
        invalid_type_error:
          "products.form.errors.salePriceRequired",
      })
      .min(
        0,
        "products.form.errors.salePriceNonNegative",
      ),

    isActive: z.boolean(),
  })
  .refine(
    (values) => values.salePrice >= values.costPrice,
    {
      message:
        "products.form.errors.salePriceBelowCost",
      path: ["salePrice"],
    },
  );

export type ProductFormValues = z.infer<
  typeof productFormSchema
>;

export const productFormDefaultValues: ProductFormValues = {
  sku: "",
  name: "",
  description: "",
  categoryId: null,
  unitOfMeasure: "",
  costPrice: 0,
  salePrice: 0,
  isActive: true,
};