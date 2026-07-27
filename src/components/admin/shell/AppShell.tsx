import type { ReactNode } from "react";
import { Sidebar } from "@/components/admin/shell/Sidebar";
import { Navbar } from "@/components/admin/shell/Navbar";
import type { NotificationItem } from "@/components/admin/shell/NotificationBell";

interface AppShellProps {
  children: ReactNode;
  notifications?: NotificationItem[];
  onSearchFocus?: () => void;
}

export function AppShell({
  children,
  notifications = [],
  onSearchFocus,
}: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          notifications={notifications}
          onSearchFocus={onSearchFocus}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}