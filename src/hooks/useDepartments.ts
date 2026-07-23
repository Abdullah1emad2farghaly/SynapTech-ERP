// src/hooks/useDepartments.ts
//
// Same pattern as useBranches — maps to MultiSelectOption for direct
// consumption by the Users components.

import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../services/api/departments.api";
import type { MultiSelectOption } from "../components/common/MultiSelectSearchable";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"] as const,
    queryFn: async (): Promise<MultiSelectOption[]> => {
      const departments = await getDepartments();
      return departments.map((d) => ({ value: d.id, label: d.name }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
