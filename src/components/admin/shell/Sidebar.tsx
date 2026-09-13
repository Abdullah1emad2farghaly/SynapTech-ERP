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
import { getCurrentUser } from "@/App";
import { getMyPermissions } from "@/services/api/roles.crud.api";
import { getUserPermissions } from "@/pages/common/LoginPage";
import { useTranslation } from "react-i18next";

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
  const {t} = useTranslation()
  const navigate = useNavigate();

  const collapsed = useShellStore((s) => s.sidebarCollapsed);

  const expandedNavId = useShellStore((s) => s.expandedNavId);

  const setExpandedNavId = useShellStore((s) => s.setExpandedNavId);

  const mobileSidebarOpen = useShellStore((s) => s.mobileSidebarOpen);

  const closeMobileSidebar = useShellStore((s) => s.closeMobileSidebar);

  // =========================================================
  // NAVIGATION ITEMS
  // =========================================================

  var navItems = useNavItems();
  const globalNavigation = [{
    id: "hr-my-attendance",
    label: t("sidebar.myAttendance"),
    to: "/hr/my-attendance",
    permissions: [
      "hr.my-attendance.view",
    ],
  },
  {
    id: "my-requests",
    label: t("sidebar.myRequests"),
    to: "/hr/my-requests",
    permissions: [
      "hr.myRequests",
    ],
  },]


  // =========================================================
  // GET CURRENT USER
  // =========================================================



  const isAdmin = getCurrentUser();
  if(!isAdmin){
    navItems.forEach((item)=>{
      if(item.id === 'hr'){
        const children = item.children || []
        item.children = [...children, ...globalNavigation]
      }
    })
  }


  // =========================================================
  // GET MY PERMISSIONS
  // =========================================================
  // Extracted to hooks/usePermissions.ts — RouteGuard (elsewhere in the
  // app) needs the exact same data, and duplicating this fetch in two
  // places risked them resolving at different times and disagreeing
  // about what the user can see.

  const myPermissions: string[] = getUserPermissions()

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
  

  console.log(visibleItems)
  // =========================================================

  useEffect(() => {

    if (!visibleItems.length) {
      return;
    }

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
    // permissionsLoading,
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
          "fixed inset-y-0 left-0 md:z-0 z-20 flex flex-col",
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

        <div className="flex h-16 items-center gap-2 border-b border-hairline px-4">
          <Logo size="sm" />

          {!isCollapsed && (
            <span className="font-display text-sm font-semibold text-ink-primary">
              Synaptech
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
          {visibleItems.map((item) => {
            const active = isItemActive(item, pathname);

            const expanded = expandedNavId === item.id;

            const Icon = item.icon;


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

          {visibleItems.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-ink-tertiary">
              No accessible pages
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
