// Intended path: src/utils/permissions.ts
//
// Pure functions only. Every function takes permissions/isAdmin as
// parameters — nothing here calls a data-fetching hook, useState,
// useEffect, or reads localStorage. Safe to unit-test without a React
// renderer, and safe to call from anywhere (utils, hooks, server code).

import type { NavChild, NavItem } from "@/types/nav.types";

/**
 * Permissions every authenticated non-admin user always has, regardless
 * of what their role's permission set returns from the API.
 */
export const GLOBAL_PERMISSIONS: readonly string[] = [
  "hr.my-attendance.view",
  "hr.myRequests",
];

/**
 * Case-insensitive, trims whitespace — backends aren't always consistent
 * about "Admin" vs "admin" vs "ADMIN". Callers that already computed
 * their own isAdmin boolean (e.g. Sidebar.tsx) can skip this and pass
 * the boolean directly to the functions below.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  return (role ?? "").trim().toLowerCase() === "admin";
}

/**
 * Merges API-provided permissions with the always-on global permissions,
 * de-duplicated. Safe against undefined/null input.
 */
export function mergeWithGlobalPermissions(
  userPermissions: readonly string[] | null | undefined,
): string[] {
  const base = userPermissions ?? [];
  return Array.from(new Set<string>([...GLOBAL_PERMISSIONS, ...base]));
}

/**
 * True when `userPermissions` contains at least one entry from
 * `requiredPermissions`. An item with no required permissions (undefined
 * or empty array) is treated as public and always passes.
 *
 * Never calls .includes() on a possibly-undefined array — both inputs
 * are guarded.
 */
export function hasAnyPermission(
  requiredPermissions: readonly string[] | undefined,
  userPermissions: readonly string[] | null | undefined,
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  const available = userPermissions ?? [];
  return requiredPermissions.some((permission) =>
    available.includes(permission),
  );
}

export function canAccessNavChild(
  child: NavChild,
  userPermissions: readonly string[] | null | undefined,
): boolean {
  return hasAnyPermission(child.permissions, userPermissions);
}

function filterChildren(
  children: readonly NavChild[],
  userPermissions: readonly string[],
): NavChild[] {
  return children.filter((child) => canAccessNavChild(child, userPermissions));
}

/**
 * Filters the full nav tree down to what the current user may see.
 *
 * - isAdmin: returns the tree exactly as authored in nav.config.ts, no
 *   recomputation, no mutation. The caller decides what counts as admin
 *   (e.g. `userRole.toLowerCase() === "admin"`) and passes the boolean in.
 * - Non-admin: for each parent, children are filtered by permission.
 *   A parent with zero accessible children is dropped entirely. A parent
 *   that keeps at least one child has its `to` rewritten to that first
 *   *accessible* child's `to` — explicitly NOT children[0], which may
 *   have been filtered out.
 * - Top-level items with no children (e.g. Dashboard) are gated by their
 *   own optional `permissions`, if present; otherwise always shown.
 *
 * `rawUserPermissions` may be undefined/null (still loading, or the
 * fetch returned nothing) — this function treats that as "no extra
 * permissions beyond the global set", never throws.
 */
export function filterNavByPermissions(
  items: readonly NavItem[],
  isAdmin: boolean,
  rawUserPermissions: readonly string[] | null | undefined,
): NavItem[] {
  if (isAdmin) {
    return [...items];
  }

  const userPermissions = mergeWithGlobalPermissions(rawUserPermissions);

  return items.reduce<NavItem[]>((visible, item) => {
    if (!item.children || item.children.length === 0) {
      if (hasAnyPermission(item.permissions, userPermissions)) {
        visible.push(item);
      }
      return visible;
    }

    const visibleChildren = filterChildren(item.children, userPermissions);
    if (visibleChildren.length === 0) {
      return visible;
    }

    const [firstAccessibleChild] = visibleChildren;

    visible.push({
      ...item,
      to: firstAccessibleChild.to,
      children: visibleChildren,
    });

    return visible;
  }, []);
}

/**
 * Flattens an already-filtered nav tree into the list of concrete routes
 * it exposes, in display order: each child's `to` for parents-with-children,
 * or the item's own `to` for childless items. Does NOT filter — pass it
 * the output of filterNavByPermissions(), not the raw config.
 */
export function getVisibleLeafRoutes(items: readonly NavItem[]): string[] {
  const routes: string[] = [];
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        routes.push(child.to);
      }
    } else if (item.to) {
      routes.push(item.to);
    }
  }
  return routes;
}

/**
 * The full set of routes this user is allowed to land on, in nav order.
 * For Admins this is every route in the config; for everyone else it's
 * exactly what filterNavByPermissions() would render in the sidebar.
 */
export function getAllowedRoutes(
  items: readonly NavItem[],
  isAdmin: boolean,
  rawUserPermissions: readonly string[] | null | undefined,
): string[] {
  return getVisibleLeafRoutes(
    filterNavByPermissions(items, isAdmin, rawUserPermissions),
  );
}

/**
 * The route to send the user to right after login (or as a redirect
 * target when they have nowhere else to go). Null only when the user has
 * literally zero accessible routes — the caller should show an
 * "access pending" state in that case, not crash on a missing route.
 */
export function getFirstAllowedRoute(
  items: readonly NavItem[],
  isAdmin: boolean,
  rawUserPermissions: readonly string[] | null | undefined,
): string | null {
  const [first] = getAllowedRoutes(items, isAdmin, rawUserPermissions);
  return first ?? null;
}

/**
 * True when `pathname` is within the user's allowed routes. A route is
 * considered allowed if it exactly matches an allowed nav route, OR is
 * nested under one (e.g. `/suppliers/:id` is allowed by `/suppliers`,
 * since detail/create/edit pages for a module are never listed in the
 * sidebar individually — only the module's landing route is).
 *
 * Admins always match, without consulting allowedRoutes at all.
 */
export function isRouteAllowed(
  pathname: string,
  allowedRoutes: readonly string[],
  isAdmin: boolean,
): boolean {
  if (isAdmin) {
    return true;
  }
  return allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
