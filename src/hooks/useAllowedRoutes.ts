// Intended path: src/hooks/useAllowedRoutes.ts
//
// Single place that combines the current user's role, their permissions
// fetch, and the live nav items into "what routes can this user reach".
// Both the login redirect and RouteGuard consume this, so the two never
// drift out of sync with each other or with the sidebar.
//
// Uses useNavItems() from constants/navigation.ts — the same source
// Sidebar.tsx and LoginPage.tsx already read from — NOT a static
// nav.config.ts import, since that file isn't actually part of this
// project's real data flow.

import { useMemo } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavItems } from "@/constants/navigation";
import { getAllowedRoutes, getFirstAllowedRoute } from "@/utils/permissions";

export interface UseAllowedRoutesResult {
  isAdmin: boolean;
  allowedRoutes: string[];
  firstAllowedRoute: string | null;
  /** True only while the permissions fetch is loading for a non-admin. */
  isLoading: boolean;
}

export function useAllowedRoutes(): UseAllowedRoutesResult {
  const currentUser = useCurrentUser();
  const isAdmin = (currentUser?.role ?? "").toLowerCase() === "admin";
  const { permissions, isLoading } = usePermissions();
  const navItems = useNavItems();

  const allowedRoutes = useMemo(
    () => getAllowedRoutes(navItems, isAdmin, permissions),
    [navItems, isAdmin, permissions],
  );

  const firstAllowedRoute = useMemo(
    () => getFirstAllowedRoute(navItems, isAdmin, permissions),
    [navItems, isAdmin, permissions],
  );

  return {
    isAdmin,
    allowedRoutes,
    firstAllowedRoute,
    isLoading: !isAdmin && isLoading,
  };
}
