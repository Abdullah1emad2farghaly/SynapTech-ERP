// src/hooks/useRoles.ts
//
// See the gap noted in services/api/roles.api.ts — GET /api/Roles is not
// a confirmed endpoint. This hook is written so it's a one-line swap
// (queryFn) once the real source of the role catalog is confirmed.

import { useQuery } from "@tanstack/react-query";
import { getRoles } from "../services/api/roles.api";
import type { MultiSelectOption } from "../components/common/MultiSelectSearchable";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"] as const,
    queryFn: async (): Promise<MultiSelectOption[]> => {
      const roles = await getRoles();
      return roles.map((r) => ({ value: r.id, label: r.name }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
