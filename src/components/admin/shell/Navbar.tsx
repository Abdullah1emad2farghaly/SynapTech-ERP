import { Menu, Moon, Search, Sun } from "lucide-react";
import { Breadcrumb } from "@/components/admin/shell/Breadcrumb";
import {
  NotificationBell,
  type NotificationItem,
} from "@/components/admin/shell/NotificationBell";
import { UserMenu } from "@/components/admin/shell/UserMenu";
import { useShellStore } from "@/store/shellStore";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/store/themeStore";

interface NavbarProps {
  notifications: NotificationItem[];
  onSearchFocus?: () => void;
}

// Global Search here is presentational-trigger only (opens the shared
// search/command surface on focus) — the actual result resolution lives
// wherever the Command Palette's logic lives, so the two never diverge.
export function Navbar({
  notifications,
  onSearchFocus,
}: NavbarProps) {
  const openMobileSidebar = useShellStore(
    (s) => s.openMobileSidebar
  );
    const mode = useThemeStore((s) => s.mode);
    const toggleTheme = useThemeStore((s) => s.toggle);

  const { i18n } = useTranslation();

  let lang = i18n.language;

  return (
    <header className="flex h-16 items-center gap-4 border-b border-hairline bg-panel px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={openMobileSidebar}
        aria-label="Open navigation menu"
        className="rounded-md p-2 text-ink-secondary transition-colors hover:bg-sunken hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Breadcrumb (Desktop Only) */}
      <div className="hidden lg:block">
        <Breadcrumb />
      </div>

      <div className="flex-1" />


      {/* Mobile Search */}
      <button
        type="button"
        onClick={onSearchFocus}
        aria-label="Search"
        className="rounded-full p-2 text-ink-secondary hover:bg-sunken sm:hidden"
      >
        <Search className="h-4.5 w-4.5" aria-hidden="true" />
      </button>


      <button
        className="toggle-btn"
        onClick={toggleTheme}
        title={mode === 'dark' ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
        id="theme-toggle-btn"
        style={{ width: 36, height: 36 }}
      >
        {mode === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
      </button>

      <div className="lang-switch cursor-pointer" onClick={() => {
        if (lang === 'ar')
          i18n.changeLanguage('en')
        else
          i18n.changeLanguage('ar')
      }}>
        <button className={`lang-btn ${lang === 'ar' ? 'active' : ''}`} >ع</button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} >EN</button>
      </div>

      

      {/* <NotificationBell notifications={notifications} /> */}
      <UserMenu />

    </header>
  );
}