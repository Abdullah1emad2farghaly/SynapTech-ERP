import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { usersApi } from "@/services/api/users.api";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  AssignRolesPayload,
  User,
} from "@/types/users.types";

export const usersQueryKeys = {
  all: ["users"] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};

export interface UseUsersParams {
  searchText: string;
  filters: {
    branchId: string | null;
    departmentId: string | null;
    roleId: string | null;
    status: "active" | "inactive" | null;
  };
  page: number;
  pageSize: number;
  // sortColumnId: keyof User | null;
  sortDirection: "asc" | "desc" | null;
}

export function useUsers(params: UseUsersParams) {
  const query = useQuery({
    queryKey: usersQueryKeys.all,
    queryFn: usersApi.getUsers,
  });

  const data = useMemo(() => {
    if (!query.data) {
      return {
        items: [],
        totalCount: 0,
      };
    }


    let items: User[] = [...query.data];



    // Search
    if (params.searchText.trim()) {
      const search = params.searchText.trim().toLowerCase();

      items = items.filter(
        (user: User) =>
          user.fullName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    // Branch
    if (params.filters.branchId) {
      items = items.filter(
        (user: User) => user.branchId === params.filters.branchId
      );
    }

    // Department
    if (params.filters.departmentId) {
      items = items.filter(
        (user: User) => user.departmentId === params.filters.departmentId
      );
    }

    // Role
    if (params.filters.roleId) {
      items = items.filter((user: User) =>
        user.roles.includes(params.filters.roleId!)
      );
    }

    // Status
    if (params.filters.status) {
      items = items.filter((user: User) =>
        params.filters.status === "active"
          ? user.isActive
          : !user.isActive
      );
    }

    // Sorting
    // if (params.sortColumnId && params.sortDirection) {
    //   const column = params.sortColumnId;
    //   const direction = params.sortDirection;

    //   items.sort((a, b) => {
    //     const first = a[column];
    //     const second = b[column];

    //     if (first == null) return -1;
    //     if (second == null) return 1;

    //     if (first < second) {
    //       return direction === "asc" ? -1 : 1;
    //     }

    //     if (first > second) {
    //       return direction === "asc" ? 1 : -1;
    //     }

    //     return 0;
    //   });
    // }

    const totalCount = items.length;

    const start = (params.page - 1) * params.pageSize;

    items = items.slice(start, start + params.pageSize);

    return {
      items,
      totalCount,
    };
  }, [query.data, params]);

  return {
    ...query,
    data,
  };
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersQueryKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      usersApi.createUser(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.all,
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      usersApi.updateUser(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>usersApi.deleteUser(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.all,
      });
    },
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignRolesPayload) =>
      usersApi.assignRoles(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.detail(variables.id),
      });
    },
  });
}