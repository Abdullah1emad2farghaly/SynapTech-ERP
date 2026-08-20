import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useNavItems } from "@/constants/navigation";
import { useShellStore } from "@/store/shellStore";
import type { NavItem } from "@/types/nav.types";
import { useEffect, useState } from "react";
import { getMyPermissions } from "@/services/api/roles.crud.api";
import { filterNavByPermissions } from "@/utils/permissions";

function isItemActive(item: NavItem, pathname: string) {
  if (
    pathname === item.to ||
    pathname.startsWith(`${item.to}/`)
  ) {
    return true;
  }

  return (
    item.children?.some(
      (child) =>
        pathname === child.to ||
        pathname.startsWith(`${child.to}/`)
    ) ?? false
  );
}

export function Sidebar() {
  const { pathname } = useLocation();

  const navigate = useNavigate();

  const collapsed = useShellStore(
    (s) => s.sidebarCollapsed
  );

  const expandedNavId = useShellStore(
    (s) => s.expandedNavId
  );

  const setExpandedNavId = useShellStore(
    (s) => s.setExpandedNavId
  );

  const mobileSidebarOpen = useShellStore(
    (s) => s.mobileSidebarOpen
  );

  const closeMobileSidebar = useShellStore(
    (s) => s.closeMobileSidebar
  );

  const [myPermissions, setMyPermissions] = useState<
    string[]
  >([]);

  const [permissionsLoading, setPermissionsLoading] =
    useState(true);

  // =========================================================
  // NAVIGATION ITEMS
  // =========================================================

  const navItems = useNavItems();

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const currentUser =
    window.localStorage.getItem("currentUser");

  let userRole = "";

  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      userRole = user?.role ?? "";
    } catch (error) {
      console.error(
        "Failed to parse currentUser:",
        error
      );
    }
  }

  const isAdmin =
    userRole.toLowerCase() === "admin";

  // =========================================================
  // GET MY PERMISSIONS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadPermissions = async () => {
      try {
        setPermissionsLoading(true);

        const permissions = await getMyPermissions();

        if (!mounted) return;

        setMyPermissions(
          Array.isArray(permissions)
            ? permissions
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load user permissions:",
          error
        );

        if (mounted) {
          setMyPermissions([]);
        }
      } finally {
        if (mounted) {
          setPermissionsLoading(false);
        }
      }
    };

    loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // FILTER NAVIGATION
  // =========================================================

  const visibleItems = filterNavByPermissions(
    navItems,
    isAdmin  );

  // =========================================================
  // FIND FIRST ALLOWED ROUTE
  // =========================================================

  const getFirstAllowedRoute = (
    items: NavItem[]
  ): string | null => {
    for (const item of items) {
      // -----------------------------------------------------
      // If item has children, prefer the first visible child
      // -----------------------------------------------------

      if (
        item.children &&
        item.children.length > 0
      ) {
        const firstChild = item.children[0];

        if (firstChild?.to) {
          return firstChild.to;
        }
      }

      // -----------------------------------------------------
      // Otherwise use the parent route
      // -----------------------------------------------------

      if (item.to) {
        return item.to;
      }
    }

    return null;
  };

  // =========================================================
  // AUTOMATICALLY OPEN FIRST ALLOWED PAGE
  // =========================================================

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
    // -------------------------------------------------------

    const shouldRedirect =
      pathname === "/" ||
      pathname === "/sales";

    if (!shouldRedirect) {
      return;
    }

    const firstAllowedRoute =
      getFirstAllowedRoute(visibleItems);

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
  ]);

  // =========================================================
  // COLLAPSED STATE
  // =========================================================

  const isCollapsed =
    collapsed &&
    window.innerWidth >= 1024;

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
          isCollapsed
            ? "lg:w-16"
            : "lg:w-64",

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
            const active = isItemActive(
              item,
              pathname
            );

            const expanded =
              expandedNavId === item.id;

            const Icon = item.icon;

            return (
              <div key={item.id}>
                {/* ================================================= */}
                {/* PARENT ITEM */}
                {/* ================================================= */}

                <div className="flex items-center">
                  <NavLink
                    to={item.to}
                    onClick={() => {
                      if (
                        window.innerWidth < 1024
                      ) {
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
                    {Icon && (
                      <Icon className="h-4 w-4 shrink-0" />
                    )}

                    {!isCollapsed && (
                      <span className="truncate">
                        {item.label}
                      </span>
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
                          setExpandedNavId(
                            expanded
                              ? null
                              : item.id
                          )
                        }
                        className="me-1 rounded p-1 text-ink-tertiary hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse"
                      >
                        <ChevronDown
                          className={[
                            "h-3.5 w-3.5",
                            "transition-transform duration-control",

                            expanded
                              ? "rotate-180"
                              : "",
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
                      {item.children.map(
                        (child) => (
                          <NavLink
                            key={child.id}
                            to={child.to}
                            onClick={() => {
                              if (
                                window.innerWidth <
                                1024
                              ) {
                                closeMobileSidebar();
                              }
                            }}
                            className={({
                              isActive,
                            }) =>
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
                        )
                      )}
                    </div>
                  )}
              </div>
            );
          })}

          {/* ================================================= */}
          {/* NO PERMISSION */}
          {/* ================================================= */}

          {!permissionsLoading &&
            visibleItems.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-ink-tertiary">
                No accessible pages
              </div>
            )}
        </nav>
      </aside>
    </>
  );
}