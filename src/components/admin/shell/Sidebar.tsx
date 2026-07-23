import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";
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
  const toggleSidebar = useShellStore((s) => s.toggleSidebar);
  const expandedNavId = useShellStore((s) => s.expandedNavId);
  const setExpandedNavId = useShellStore((s) => s.setExpandedNavId);

  return (
    <aside
      className={[
        "flex h-screen flex-col border-e border-hairline bg-panel transition-[width] duration-state ease-state",
        collapsed ? "w-16" : "w-64",
      ].join(" ")}
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <Logo size="sm" />
        {!collapsed ? <span className="font-display text-sm font-semibold text-ink-primary">Synaptech</span> : null}
      </div>

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
                  className={[
                    "flex flex-1 items-center gap-3 rounded-md px-3 py-2.5 text-[0.8125rem] font-medium transition-colors duration-control",
                    active
                      ? "border-s-2 border-signal bg-signal/10 text-signal"
                      : "border-s-2 border-transparent text-ink-secondary hover:bg-sunken hover:text-ink-primary",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </NavLink>
                {!collapsed && item.children ? (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-label={`Toggle ${item.label} submenu`}
                    onClick={() => setExpandedNavId(expanded ? null : item.id)}
                    className="me-1 rounded p-1 text-ink-tertiary hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-control ${expanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>

              {!collapsed && item.children && (expanded || active) ? (
                <div className="ms-7 mt-1 space-y-0.5 border-s border-hairline ps-3">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.id}
                      to={child.to}
                      className={({ isActive }) =>
                        [
                          "block rounded-md px-2.5 py-2 text-[0.8125rem] transition-colors duration-control",
                          isActive
                            ? "text-signal font-medium"
                            : "text-ink-secondary hover:text-ink-primary",
                        ].join(" ")
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-hairline p-2">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-ink-tertiary hover:bg-sunken hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          ) : (
            <ChevronsLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          )}
        </button>
      </div>
    </aside>
  );
}
