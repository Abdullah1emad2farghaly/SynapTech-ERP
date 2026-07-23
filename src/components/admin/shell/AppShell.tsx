import type { ReactNode } from "react";
import { Sidebar } from "@/components/admin/shell/Sidebar";
import { Navbar } from "@/components/admin/shell/Navbar";
import type { NotificationItem } from "@/components/admin/shell/NotificationBell";

interface AppShellProps {
  children: ReactNode;
  notifications?: NotificationItem[];
  onSearchFocus?: () => void;
}

// The one layout every module page renders inside — Sidebar + Navbar +
// scrollable content region. Pages compose their own content; this owns
// only the frame around it.
export function AppShell({ children, notifications = [], onSearchFocus }: AppShellProps) {
  return (
    <div className="flex h-screen w-full bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar notifications={notifications} onSearchFocus={onSearchFocus} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
