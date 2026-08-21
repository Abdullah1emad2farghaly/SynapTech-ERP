// Intended path: src/hooks/useCurrentUser.ts
//
// Reads the logged-in user out of localStorage. This IS a hook (uses
// useMemo) rather than a plain util, since it touches browser storage and
// should live in component/hook land, not permissions.ts.

import { useMemo } from "react";

export interface StoredUser {
  accessToken: string;
  email: string;
  fullName: string;
  role: string;
  userId: string;
}

// Matches the key your app actually writes to on login.
const STORAGE_KEY = "currentUser";

function readStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as Record<string, unknown>).role !== "string"
    ) {
      return null;
    }

    return parsed as StoredUser;
  } catch {
    // Malformed JSON in storage should never crash the sidebar.
    return null;
  }
}

export function useCurrentUser(): StoredUser | null {
  // Re-read only once per mount; localStorage doesn't change reactively
  // within a session in this app's flow. If you need cross-tab reactivity,
  // wire a "storage" event listener here instead of useMemo.
  return useMemo(readStoredUser, []);
}
