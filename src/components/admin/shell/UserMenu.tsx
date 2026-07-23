import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { Avatar } from "@/components/admin/hr/Avatar";
import { LanguageSwitcher } from "@/components/admin/auth/LanguageSwitcher";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSignOut = () => {
    clearSession();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
      >
        <Avatar name={user?.fullName ?? "Guest User"} size="sm" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute end-0 z-20 mt-2 w-56 rounded-lg border border-hairline bg-panel py-1.5 shadow-elevation1"
        >
          <div className="px-3.5 py-2">
            <p className="truncate text-[0.8125rem] font-medium text-ink-primary">
              {user?.fullName ?? "Guest User"}
            </p>
            <p className="truncate text-[0.75rem] text-ink-tertiary">{user?.email ?? ""}</p>
          </div>
          <div className="my-1 border-t border-hairline" />

          <button
            role="menuitem"
            type="button"
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-start text-[0.8125rem] text-ink-secondary hover:bg-sunken hover:text-ink-primary"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            Profile
          </button>

          <button
            role="menuitem"
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-start text-[0.8125rem] text-ink-secondary hover:bg-sunken hover:text-ink-primary"
          >
            {mode === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            {mode === "dark" ? t("common.light") : t("common.dark")}
          </button>

          <div className="px-3.5 py-2">
            <LanguageSwitcher />
          </div>

          <div className="my-1 border-t border-hairline" />

          <button
            role="menuitem"
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-start text-[0.8125rem] text-error hover:bg-error/10"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
