import { Search } from "lucide-react";
import { Breadcrumb } from "@/components/admin/shell/Breadcrumb";
import { NotificationBell, type NotificationItem } from "@/components/admin/shell/NotificationBell";
import { UserMenu } from "@/components/admin/shell/UserMenu";

interface NavbarProps {
  notifications: NotificationItem[];
  onSearchFocus?: () => void;
}

// Global Search here is presentational-trigger only (opens the shared
// search/command surface on focus) — the actual result resolution lives
// wherever the Command Palette's logic lives, so the two never diverge.
export function Navbar({ notifications, onSearchFocus }: NavbarProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-hairline bg-panel px-4 lg:px-6">
      <div className="hidden lg:block">
        <Breadcrumb />
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onSearchFocus}
        className="hidden items-center gap-2 rounded-md border border-hairline bg-sunken px-3 py-2 text-[0.8125rem] text-ink-tertiary hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse sm:flex sm:w-64"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="flex-1 text-start">Search...</span>
        <kbd className="rounded border border-hairline bg-panel px-1.5 py-0.5 font-mono text-[0.6875rem]">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        onClick={onSearchFocus}
        aria-label="Search"
        className="rounded-full p-2 text-ink-secondary hover:bg-sunken sm:hidden"
      >
        <Search className="h-4.5 w-4.5" aria-hidden="true" />
      </button>

      <NotificationBell notifications={notifications} />
      <UserMenu />
    </header>
  );
}
