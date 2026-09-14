

import { getCurrentUser } from "@/App";
import type { NavChild, NavItem } from "@/types/nav.types";


export const GLOBAL_PERMISSIONS: readonly string[] = [
  "hr.my-attendance.view",
  "hr.myRequests",
];


export function isAdminRole(role: string | null | undefined): boolean {
  return (role ?? "").trim().toLowerCase() === "admin";
}


export function mergeWithGlobalPermissions(
  isAdmin: boolean,
  userPermissions: readonly string[] | null | undefined,
): string[] {
  const base = userPermissions ?? [];
  if(isAdmin)
    return Array.from(new Set<string>([...base]));
  else 
    return Array.from(new Set<string>([...GLOBAL_PERMISSIONS, ...base]));

}


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


export function filterNavByPermissions(
  items: readonly NavItem[],
  isAdmin: boolean,
  rawUserPermissions: readonly string[] | null | undefined,
): NavItem[] {
  if (isAdmin) {
    return [...items];
  }
  const userPermissions = mergeWithGlobalPermissions(isAdmin, rawUserPermissions);

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
