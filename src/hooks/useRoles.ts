// // src/hooks/useRoles.ts
// //
// // See the gap noted in services/api/roles.api.ts — GET /api/Roles is not
// // a confirmed endpoint. This hook is written so it's a one-line swap
// // (queryFn) once the real source of the role catalog is confirmed.

// import { useQuery } from "@tanstack/react-query";
// import { getRoles } from "../services/api/roles.api";
// import type { MultiSelectOption } from "../components/common/MultiSelectSearchable";

// export function useRoles() {
//   return useQuery({
//     queryKey: ["roles"] as const,
//     queryFn: async (): Promise<MultiSelectOption[]> => {
//       const roles = await getRoles();
//       return roles.map((r) => ({ value: r.id, label: r.name }));
//     },
//     staleTime: 5 * 60 * 1000,
//   });
// }


// Project path: src/hooks/useRoles.ts
//
// Read-only query hooks. Named `useRoles`/`useRole` — no naming collision risk
// with the existing lookup-only `useRolesList`-style hook since roles.api.ts's
// lookup hook is only consumed by CreateUserDrawer and isn't a full-CRUD hook.
// (Same historical caveat as Departments/Branches: if a collision turns out to
// exist once merged, rename this one to `useRolesManagement` rather than the
// lookup hook, to match the established `List`-suffix precedent.)

import { useQuery } from "@tanstack/react-query";
import {
  getRoles,
  getRoleById,
  getPermissionsCatalog,
} from "../services/api/roles.crud.api";

export const rolesQueryKeys = {
  all: ["roles"] as const,
  detail: (id: string) => ["roles", id] as const,
  permissionsCatalog: ["roles", "permissions-catalog"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: rolesQueryKeys.all,
    queryFn: getRoles,
  });
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: rolesQueryKeys.detail(id ?? ""),
    queryFn: () => getRoleById(id as string),
    enabled: Boolean(id),
  });
}

/** Catalog changes rarely relative to roles — cached longer. */
export function usePermissionsCatalog() {
  return useQuery({
    queryKey: rolesQueryKeys.permissionsCatalog,
    queryFn: getPermissionsCatalog,
    staleTime: 5 * 60 * 1000,
  });
}
