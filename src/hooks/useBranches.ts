// src/hooks/useBranches.ts
//
// Thin query hook, mapped to the MultiSelectOption shape the Users
// components already expect ({ value, label }), so UsersListPage,
// CreateUserDrawer, and AdvancedSearchPanel can consume it directly.
// See the assumption note in services/api/branches.api.ts before adding
// this if a branches lookup already exists elsewhere in the project.

import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../services/api/branches.api";
import type { MultiSelectOption } from "../components/common/MultiSelectSearchable";

export function useBranches() {
  return useQuery({
    queryKey: ["branches"] as const,
    queryFn: async (): Promise<MultiSelectOption[]> => {
      const branches = await getBranches();
      return branches.map((b) => ({ value: b.id, label: b.name }));
    },
    staleTime: 5 * 60 * 1000, // org structure changes rarely; avoid refetching every mount
  });
}
