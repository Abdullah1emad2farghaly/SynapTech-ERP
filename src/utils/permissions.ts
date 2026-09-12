// Intended path: src/utils/permissions.ts
//
// Pure functions only. Every function takes permissions/isAdmin as
// parameters — nothing here calls a data-fetching hook, useState,
// useEffect, or reads localStorage. Safe to unit-test without a React
// renderer, and safe to call from anywhere (utils, hooks, server code).

import { getCurrentUser } from "@/App";
import type { NavChild, NavItem } from "@/types/nav.types";

/**
 * Permissions every authenticated non-admin user always has, regardless
 * of what their role's permission set returns from the API.
 */
export const GLOBAL_PERMISSIONS: readonly string[] = [
  "hr.my-attendance.view",
  "hr.myRequests",
];


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
  return Array.from(new Set<string>([...base]));
  // if(isAdmin)
  // else 
  //   return Array.from(new Set<string>([...GLOBAL_PERMISSIONS, ...base]));

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
  console.log(userPermissions)
  return hasAnyPermission(child.permissions, userPermissions);
}

function filterChildren(
  children: readonly NavChild[],
  userPermissions: readonly string[],
): NavChild[] {
  return children.filter((child) => canAccessNavChild(child, userPermissions));
}


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


export function getAllowedRoutes(
  items: readonly NavItem[],
  isAdmin: boolean,
  rawUserPermissions: readonly string[] | null | undefined,
): string[] {
  return getVisibleLeafRoutes(
    filterNavByPermissions(items, isAdmin, rawUserPermissions),
  );
}


export function getFirstAllowedRoute(
  items: readonly NavItem[],
  isAdmin: boolean,
  rawUserPermissions: readonly string[] | null | undefined,
): string | null {
  const [first] = getAllowedRoutes(items, isAdmin, rawUserPermissions);
  return first ?? null;
}


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
