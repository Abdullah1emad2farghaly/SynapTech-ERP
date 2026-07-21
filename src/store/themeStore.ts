import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

function applyDocumentTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Falls back to system preference only on first-ever load (no persisted value).
      mode: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      setMode: (mode) => {
        applyDocumentTheme(mode);
        set({ mode });
      },
      toggle: () => {
        const next = get().mode === "dark" ? "light" : "dark";
        applyDocumentTheme(next);
        set({ mode: next });
      },
    }),
    {
      name: "synaptech-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyDocumentTheme(state.mode);
      },
    }
  )
);
