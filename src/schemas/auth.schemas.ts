import { z } from "zod";

// Shared primitives
const email = z.string().min(1, "validation.emailRequired").email("validation.emailInvalid");

const password = z
  .string()
  .min(8, "validation.passwordMinLength")
  .regex(/[a-z]/, "validation.passwordLowercase")
  .regex(/[A-Z]/, "validation.passwordUppercase")
  .regex(/[0-9]/, "validation.passwordNumber")
  .regex(/[^A-Za-z0-9]/, "validation.passwordSymbol");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "validation.passwordRequired"),
  rememberMe: z.boolean().default(false),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(1, "validation.fullNameRequired").min(2, "validation.fullNameMinLength"),
  companyName: z.string().min(1, "validation.companyNameRequired"),
  email,
  password,
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, "validation.confirmPasswordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "validation.passwordsDoNotMatch",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
