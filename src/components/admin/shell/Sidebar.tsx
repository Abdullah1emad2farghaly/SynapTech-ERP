import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useNavItems } from "@/constants/navigation";
import { useShellStore } from "@/store/shellStore";
import type { NavItem } from "@/types/nav.types";
import { usePermissions } from "@/hooks/usePermissions";
import {
  filterNavByPermissions,
  getFirstAllowedRoute,
} from "@/utils/permissions";

function isItemActive(item: NavItem, pathname: string) {
  if (
    (item.to && pathname === item.to) ||
    (item.to && pathname.startsWith(`${item.to}/`))
  ) {
    return true;
  }

  return (
    item.children?.some(
      (child) =>
        pathname === child.to || pathname.startsWith(`${child.to}/`)
    ) ?? false
  );
}

export function Sidebar() {
  const { pathname } = useLocation();

  const navigate = useNavigate();

  const collapsed = useShellStore((s) => s.sidebarCollapsed);

  const expandedNavId = useShellStore((s) => s.expandedNavId);

  const setExpandedNavId = useShellStore((s) => s.setExpandedNavId);

  const mobileSidebarOpen = useShellStore((s) => s.mobileSidebarOpen);

  const closeMobileSidebar = useShellStore((s) => s.closeMobileSidebar);

  // =========================================================
  // NAVIGATION ITEMS
  // =========================================================

  const navItems = useNavItems();

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const currentUser = window.localStorage.getItem("currentUser");

  let userRole = "";

  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      userRole = user?.role ?? "";
    } catch (error) {
      console.error("Failed to parse currentUser:", error);
    }
  }

  const isAdmin = userRole.toLowerCase() === "admin";

  // =========================================================
  // GET MY PERMISSIONS
  // =========================================================
  // Extracted to hooks/usePermissions.ts — RouteGuard (elsewhere in the
  // app) needs the exact same data, and duplicating this fetch in two
  // places risked them resolving at different times and disagreeing
  // about what the user can see.

  const { permissions: myPermissions, isLoading: permissionsLoading } =
    usePermissions();

  // =========================================================
  // FILTER NAVIGATION
  // =========================================================
  // BUG FIX: the previous version called filterNavByPermissions(navItems,
  // isAdmin) — myPermissions was never actually passed in, so non-admin
  // filtering had nothing to filter against.

  const visibleItems = filterNavByPermissions(
    navItems,
    isAdmin,
    myPermissions
  );

  // =========================================================
  // AUTOMATICALLY OPEN FIRST ALLOWED PAGE
  // =========================================================
  // Reuses the shared getFirstAllowedRoute() from utils/permissions.ts
  // instead of a local reimplementation — that local version read
  // item.children[0] directly, which happened to be safe only because
  // visibleItems' children are already permission-filtered, but it's
  // one more place that could silently drift from the real logic.

  useEffect(() => {
    // Don't redirect while permissions are still loading
    if (permissionsLoading) {
      return;
    }

    // Don't redirect if there are no visible pages
    if (!visibleItems.length) {
      return;
    }

    // -------------------------------------------------------
    // Only redirect when user is at a root/empty location.
    //
    // This prevents the sidebar from redirecting the user
    // every time they navigate to another page.
    //
    // NOTE: the previous version also special-cased "/sales" here.
    // That looked like a leftover from testing a specific route rather
    // than an intentional landing path — removed. If you do have
    // multiple "empty landing" routes that should trigger this (e.g. a
    // bare category route with no page of its own), list them
    // explicitly here rather than hardcoding one module's path.
    // -------------------------------------------------------

    const shouldRedirect = pathname === "/";

    if (!shouldRedirect) {
      return;
    }

    const firstAllowedRoute = getFirstAllowedRoute(
      navItems,
      isAdmin,
      myPermissions
    );

    if (!firstAllowedRoute) {
      return;
    }

    // Don't navigate if we're already there
    if (pathname === firstAllowedRoute) {
      return;
    }

    navigate(firstAllowedRoute, {
      replace: true,
    });
  }, [
    pathname,
    navigate,
    permissionsLoading,
    visibleItems,
    navItems,
    isAdmin,
    myPermissions,
  ]);

  // =========================================================
  // COLLAPSED STATE
  // =========================================================

  const isCollapsed = collapsed && window.innerWidth >= 1024;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* Mobile Backdrop */}

      {mobileSidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0  bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 flex flex-col",
          "border-e border-hairline bg-panel shadow-xl",
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
        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <div className="flex h-16 items-center gap-2 border-b border-hairline px-4">
          <Logo size="sm" />

          {!isCollapsed && (
            <span className="font-display text-sm font-semibold text-ink-primary">
              Synaptech
            </span>
          )}
        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
          {visibleItems.map((item) => {
            const active = isItemActive(item, pathname);

            const expanded = expandedNavId === item.id;

            const Icon = item.icon;

            // BUG FIX: item.to is typed optional, and for Admins the raw
            // nav.config.ts entry may not define `to` on a parent at all
            // (only its children do). filterNavByPermissions() rewrites
            // `to` for non-admins, but Admins skip filtering entirely, so
            // this fallback is what keeps the link valid for BOTH cases.
            const parentTo = item.to ?? item.children?.[0]?.to ?? "#";

            return (
              <div key={item.id}>
                {/* ================================================= */}
                {/* PARENT ITEM */}
                {/* ================================================= */}

                <div className="flex items-center">
                  <NavLink
                    to={parentTo}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        closeMobileSidebar();
                      }
                    }}
                    className={[
                      "flex flex-1 items-center gap-3",
                      "rounded-md px-3 py-2.5",
                      "text-[0.8125rem] font-medium",
                      "transition-colors duration-control",

                      active
                        ? "border-s-2 border-signal bg-signal/10 text-signal"
                        : "border-s-2 border-transparent text-ink-secondary hover:bg-sunken hover:text-ink-primary",
                    ].join(" ")}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}

                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </NavLink>

                  {/* ================================================= */}
                  {/* EXPAND BUTTON */}
                  {/* ================================================= */}

                  {!isCollapsed &&
                    item.children &&
                    item.children.length > 0 && (
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
                            "h-3.5 w-3.5",
                            "transition-transform duration-control",

                            expanded ? "rotate-180" : "",
                          ].join(" ")}
                        />
                      </button>
                    )}
                </div>

                {/* ================================================= */}
                {/* CHILDREN */}
                {/* ================================================= */}

                {!isCollapsed &&
                  item.children &&
                  item.children.length > 0 &&
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
                              "block rounded-md",
                              "px-2.5 py-2",
                              "text-[0.8125rem]",
                              "transition-colors duration-control",

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

          {/* ================================================= */}
          {/* NO PERMISSION */}
          {/* ================================================= */}

          {!permissionsLoading && visibleItems.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-ink-tertiary">
              No accessible pages
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
