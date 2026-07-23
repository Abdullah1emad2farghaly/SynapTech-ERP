import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShellState {
  sidebarCollapsed: boolean;
  expandedNavId: string | null;
  toggleSidebar: () => void;
  setExpandedNavId: (id: string | null) => void;
}

// Sidebar collapse state persists per-user, same pattern as the theme store
// in the auth module — collapse/expand shouldn't reset on every reload.
export const useShellStore = create<ShellState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      expandedNavId: null,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setExpandedNavId: (id) => set({ expandedNavId: id }),
    }),
    { name: "synaptech-shell" }
  )
);
