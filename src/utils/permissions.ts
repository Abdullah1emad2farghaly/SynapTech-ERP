// src/utils/permissions.ts
//
// IMPORTANT: this file must stay 100% hook-free.
// Every function here is a pure function that receives permissions
// as a parameter — it never calls useMyPermissions() or any other
// React hook itself. Hooks belong in Sidebar.tsx / useRoles.ts only.

import { getMyPermissions } from "@/services/api/roles.crud.api";
import type { NavItem, NavChild } from "@/types/nav.types";
import { useEffect, useState } from "react";

/**
 * Permissions every non-admin user is granted regardless of
 * their assigned role/permission set.
 */
const GLOBAL_PERMISSIONS: readonly string[] = [
  "hr.my-attendance.view",
  "hr.myRequests",
];

/**
 * True when `userPermissions` satisfies at least one entry in
 * `requiredPermissions`. An item with no required permissions
 * (undefined or empty array) is treated as always accessible.
 *
 * Null/undefined-safe: never calls .includes() on undefined.
 */
export function hasAnyPermission(
  requiredPermissions: string[] | undefined,
  // userPermissions: string[] | undefined | null,
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  // console.log(userPermissions)
  const [myPermissions, setMyPermissions] = useState<string[]>(['hr.my-attendance.view', 'hr.myRequests']); 
  
    useEffect(()=> {
      const getPermissions = async ()=> {
        try {
          const res = await getMyPermissions();
          setMyPermissions([...myPermissions, ...res]);
          // console.log(res)
        }catch (error){
          console.log(error);
        }
      }
      getPermissions()
    }, [])
  , myPermissions || []
  // console.log(myPermissions)

  const effectivePermissions = [
    ...GLOBAL_PERMISSIONS,
    ...(myPermissions ?? []),
  ];

  return requiredPermissions.some((permission) =>
    effectivePermissions.includes(permission),
  );
}

/**
 * Whether a single nav child is accessible to this user.
 */
export function canAccessNavChild(
  child: NavChild,
  // userPermissions: string[] | undefined | null,
): boolean {
  return hasAnyPermission(child.permissions);
}

/**
 * Filters the sidebar according to the user's permissions.
 *
 * - Admins (`isAdmin: true`) get the full nav config, untouched.
 * - For everyone else:
 *   - Items with no `children` (e.g. Dashboard) are always shown.
 *   - A parent is shown only if at least one child is accessible.
 *   - The parent's `to` is rewritten to the FIRST accessible child's
 *     route (post-filtering), never children[0] of the raw config.
 */
export function filterNavByPermissions(
  items: NavItem[],

  isAdmin: boolean,
): NavItem[] {
  if (isAdmin) {
    return items;
  }
  

  return items.reduce<NavItem[]>((result, item) => {
    // Leaf items (no children, e.g. Dashboard) are hidden for
    // non-admin users — only admins see items with no children.
    if (!item.children || item.children.length === 0) {
      return result;
    }

    const visibleChildren = item.children.filter((child) =>
      canAccessNavChild(child),
    );

    if (visibleChildren.length > 0) {
      result.push({
        ...item,
        to: visibleChildren[0].to, // first accessible child, not children[0]
        children: visibleChildren,
      });
    }

    return result;
  }, []);
}