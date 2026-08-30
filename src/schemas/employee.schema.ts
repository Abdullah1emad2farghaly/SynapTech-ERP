import { z } from "zod";
import type { TFunction } from "i18next";

// ============================================================
// Base Salary
// Required field — empty string, null, and undefined are invalid.
// ============================================================

const requiredBaseSalarySchema = (t: TFunction) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return typeof value === "string" ? Number(value) : value;
    },
    z
      .number({
        required_error: t(
          "employees.errors.baseSalaryRequired",
          "Base salary is required"
        ),
        invalid_type_error: t(
          "employees.errors.baseSalaryInvalid",
          "Base salary must be a valid number"
        ),
      })
      .min(
        0,
        t(
          "employees.errors.baseSalaryNegative",
          "Base salary cannot be negative"
        )
      )
  );

// ============================================================
// Create Employee
// ============================================================

export const CreateEmployeeSchema = (t: TFunction) =>
  z.object({
    employeeCode: z
      .string()
      .trim()
      .min(
        1,
        t(
          "employees.errors.employeeCodeRequired",
          "Employee code is required"
        )
      )
      .max(50),

    fullName: z
      .string()
      .trim()
      .min(
        1,
        t(
          "employees.errors.fullNameRequired",
          "Full name is required"
        )
      )
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
      .min(
        1,
        t(
          "employees.errors.hireDateRequired",
          "Hire date is required"
        )
      ),

    jobTitle: z
      .string()
      .trim()
      .min(
        1,
        t(
          "employees.errors.jobTitleRequired",
          "Job title is required"
        )
      )
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

    baseSalary: z
      .number()
      .min(
        1,
        t(
          "employees.errors.baseSalaryRequired",
          "Base salary is required"
        )
      )
      .max(
        50000,
        t(
          "employees.errors.baseSalaryRange",
          "Base salary must be between 1, 50000"
        )
      ),

    email: z
      .string()
      .trim()
      .email(
        t(
          "employees.errors.emailInvalid",
          "Enter a valid email"
        )
      )
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

// ============================================================
// Update Employee
// employeeCode intentionally omitted — read-only on edit,
// never submitted.
// ============================================================

export const UpdateEmployeeSchema = (t: TFunction) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(
        1,
        t(
          "employees.errors.fullNameRequired",
          "Full name is required"
        )
      )
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

    baseSalary: requiredBaseSalarySchema(t),

    email: z
      .string()
      .trim()
      .email(
        t(
          "employees.errors.emailInvalid",
          "Enter a valid email"
        )
      )
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

// ============================================================
// Types
// ============================================================

export type CreateEmployeeFormValues = z.infer<
  ReturnType<typeof CreateEmployeeSchema>
>;

export type UpdateEmployeeFormValues = z.infer<
  ReturnType<typeof UpdateEmployeeSchema>
>;

// ============================================================
// Grant Employee Access
// ============================================================

export const GrantEmployeeAccessSchema = (t: TFunction) =>
  z.object({
    // Required
    email: z
      .string()
      .trim()
      .min(
        1,
        t(
          "employees.errors.emailRequired",
          "Email is required"
        )
      )
      .email(
        t(
          "employees.errors.emailInvalid",
          "Enter a valid email"
        )
      ),

    // Optional
    // null is allowed when no roles are selected.
    // If roles are provided, at least one role must be selected.
    roleNames: z
      .array(z.string())
      .min(
        1,
        t(
          "employees.errors.selectRole",
          "Select at least one role"
        )
      )
      .nullable(),
  });

export type GrantEmployeeAccessFormValues = z.infer<
  ReturnType<typeof GrantEmployeeAccessSchema>
>;
