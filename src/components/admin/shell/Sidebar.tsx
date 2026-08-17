import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { NAV_ITEMS } from "@/constants/navigation";
import { useShellStore } from "@/store/shellStore";
import type { NavItem } from "@/types/nav.types";

function isItemActive(item: NavItem, pathname: string) {
  if (pathname === item.to || pathname.startsWith(`${item.to}/`)) return true;

  return item.children?.some((child) => pathname.startsWith(child.to)) ?? false;
}

export function Sidebar() {
  const { pathname } = useLocation();

  const collapsed = useShellStore((s) => s.sidebarCollapsed);

  const expandedNavId = useShellStore((s) => s.expandedNavId);
  const setExpandedNavId = useShellStore((s) => s.setExpandedNavId);

  const mobileSidebarOpen = useShellStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useShellStore((s) => s.closeMobileSidebar);

  // Desktop respects collapse state
  // Mobile is always expanded
  const isCollapsed = collapsed && window.innerWidth >= 1024;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 flex flex-col border-e border-hairline bg-panel shadow-xl",
          "transition-transform duration-300 ease-in-out",

          // Desktop
          "lg:static lg:translate-x-0 lg:shadow-none",

          // Width
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "w-72",

          // Mobile drawer
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-hairline px-4">
          <Logo size="sm" />

          {!isCollapsed && (
            <span className="font-display text-sm font-semibold text-ink-primary">
              Synaptech
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item, pathname);
            const expanded = expandedNavId === item.id;
            const Icon = item.icon;

            return (
              <div key={item.id}>
                <div className="flex items-center">
                  <NavLink
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        closeMobileSidebar();
                      }
                    }}
                    className={[
                      "flex flex-1 items-center gap-3 rounded-md px-3 py-2.5 text-[0.8125rem] font-medium transition-colors duration-control",
                      active
                        ? "border-s-2 border-signal bg-signal/10 text-signal"
                        : "border-s-2 border-transparent text-ink-secondary hover:bg-sunken hover:text-ink-primary",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 shrink-0" />

                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </NavLink>

                  {!isCollapsed && item.children && (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-label={`Toggle ${item.label} submenu`}
                      onClick={() =>
                        setExpandedNavId(expanded ? null : item.id)
                      }
                      className="me-1 rounded p-1 text-ink-tertiary hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
                    >
                      <ChevronDown
                        className={[
                          "h-3.5 w-3.5 transition-transform duration-control",
                          expanded ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    </button>
                  )}
                </div>

                {!isCollapsed &&
                  item.children &&
                  (expanded || active) && (
                    <div className="ms-7 mt-1 space-y-0.5 border-s border-hairline ps-3">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.id}
                          to={child.to}
                          onClick={() => {
                            if (window.innerWidth < 1024) {
                              closeMobileSidebar();
                            }
                          }}
                          className={({ isActive }) =>
                            [
                              "block rounded-md px-2.5 py-2 text-[0.8125rem] transition-colors duration-control",
                              isActive
                                ? "font-medium text-signal"
                                : "text-ink-secondary hover:text-ink-primary",
                            ].join(" ")
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}