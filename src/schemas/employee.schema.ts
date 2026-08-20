import { z } from "zod";

// ============================================================
// Base Salary
// Required field — empty string, null, and undefined are invalid.
// ============================================================

const requiredBaseSalarySchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return typeof value === "string" ? Number(value) : value;
  },
  z
    .number({
      required_error: "Base salary is required",
      invalid_type_error: "Base salary must be a valid number",
    })
    .min(0, "Base salary cannot be negative")
);

// ============================================================
// Create Employee
// ============================================================

export const CreateEmployeeSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(1, "Employee code is required")
    .max(50),

  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(200),

  nationalId: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal("")),

  hireDate: z
    .string()
    .min(1, "Hire date is required"),

  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(150),

  departmentId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  branchId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  managerId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  baseSalary: z.number()
    .min(1, "Base salary is required")
    .max(50000, "Base salary must be between 1, 50000"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),
});

export type CreateEmployeeFormValues = z.infer<
  typeof CreateEmployeeSchema
>;

// ============================================================
// Update Employee
// employeeCode intentionally omitted — read-only on edit,
// never submitted.
// ============================================================

export const UpdateEmployeeSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(200),

  nationalId: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal("")),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal("")),

  jobTitle: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal("")),

  departmentId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  branchId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  managerId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("")),

  baseSalary: requiredBaseSalarySchema,

  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  status: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type UpdateEmployeeFormValues = z.infer<
  typeof UpdateEmployeeSchema
>;

// ============================================================
// Grant Employee Access
// ============================================================

export const GrantEmployeeAccessSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),

  roleNames: z
    .array(z.string())
    .min(1, "Select at least one role"),
});

export type GrantEmployeeAccessFormValues = z.infer<
  typeof GrantEmployeeAccessSchema
>;