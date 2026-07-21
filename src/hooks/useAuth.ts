import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/services/api/authApi";
import { useAuthStore } from "@/store/authStore";
import type { LoginCredentials } from "@/types/auth.types";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (session) => setSession(session),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: authApi.verifyEmailToken,
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: authApi.resendVerificationEmail,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}
