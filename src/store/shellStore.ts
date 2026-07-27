import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShellState {
  // Desktop sidebar
  sidebarCollapsed: boolean;

  // Mobile sidebar
  mobileSidebarOpen: boolean;

  // Navigation
  expandedNavId: string | null;

  // Actions
  toggleSidebar: () => void;

  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;

  setExpandedNavId: (id: string | null) => void;
}

export const useShellStore = create<ShellState>()(
  persist(
    (set) => ({
      // State
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      expandedNavId: null,

      // Desktop
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      // Mobile
      openMobileSidebar: () =>
        set({
          mobileSidebarOpen: true,
        }),

      closeMobileSidebar: () =>
        set({
          mobileSidebarOpen: false,
        }),

      toggleMobileSidebar: () =>
        set((state) => ({
          mobileSidebarOpen: !state.mobileSidebarOpen,
        })),

      // Navigation
      setExpandedNavId: (id) =>
        set({
          expandedNavId: id,
        }),
    }),
    {
      name: "synaptech-shell",
    }
  )
);