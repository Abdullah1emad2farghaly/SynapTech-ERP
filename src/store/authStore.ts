import { create } from "zustand";
import type { AuthSession, AuthUser } from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

// Holds only in-memory auth state. Token persistence (httpOnly cookie vs
// localStorage) is an infra decision made in services/api/axiosClient.ts,
// not here — the store stays agnostic to how the token got there.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setSession: (session) =>
    set({
      user: session.user,
      accessToken: session.accessToken,
      isAuthenticated: true,
    }),
  clearSession: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
