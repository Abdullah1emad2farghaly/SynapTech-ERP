export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordRequirement {
  id: "minLength" | "hasUpperLower" | "hasNumber" | "hasSymbol";
  labelKey: string;
  test: (value: string) => boolean;
}

export type ResetPasswordTokenState = "valid" | "expired" | "checking";

export type EmailConfirmationState = "confirming" | "confirmed" | "expired";

export interface RegisterPayload {
  fullName: string;
  companyName: string;
  email: string;
  password: string;
}
