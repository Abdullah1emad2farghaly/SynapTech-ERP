// src/hooks/useDepartmentUsers.ts
//
// Users belonging to one department, fetched only when the caller says
// so (enabled) — for DepartmentAccordionItem, that's "only when this
// accordion item is expanded." Reuses the existing getUsers() service
// function from services/api/users.api.ts (the same one useUsers.ts
// wraps) rather than duplicating fetch logic — this is a separate hook
// from useUsers specifically because useUsers doesn't expose an
// `enabled` passthrough today, and threading one through would change
// its signature for every existing caller (UsersListPage). A thin
// dedicated hook here avoids that ripple.

import { useQuery } from "@tanstack/react-query";
import  {usersApi}  from "../services/api/users.api";

export function useDepartmentUsers() {
  return useQuery({
    queryKey: ["users", "by-department"] as const,
    queryFn: () =>
      usersApi.getUsers(),
  });
}
