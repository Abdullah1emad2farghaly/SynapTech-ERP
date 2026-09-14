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
import { useTranslation } from "react-i18next";

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
  const {t} = useTranslation()
  
  const navItems = useNavItems();
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

  if(!isAdmin){
    navItems.forEach((item)=>{
      if(item.id === 'hr'){
        const children = item.children || []
        item.children = [...children, ...globalNavigation]
      }
    })
  }
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
