import { apiClient } from "@/services/api/axiosClient";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  AssignRolesPayload,
} from "@/types/users.types";

// All business logic (caching, retries, error handling, optimistic updates)
// belongs in TanStack Query hooks, not in this API layer.
export const usersApi = {
  /**
   * GET /api/Users
   */
  getUsers: () =>
    apiClient
      .get<User[]>("/Users")
      .then((res) => res.data),

  /**
   * GET /api/Users/{id}
   */
  getUserById: (id: string) =>
    apiClient
      .get<User>(`/Users/${id}`)
      .then((res) => res.data),

  /**
   * POST /api/Users
   */
  createUser: (payload: CreateUserPayload) =>
    apiClient
      .post<User>("/Users", payload)
      .then((res) => res.data),

  /**
   * PUT /api/Users/{id}
   */
  updateUser: ({ id, ...payload }: UpdateUserPayload) =>
    apiClient
      .put<User>(`/Users/${id}`, payload)
      .then((res) => res.data),

  /**
   * DELETE /api/Users/{id}
   */
  deleteUser: (id: string) =>
    apiClient
      .delete<void>(`/Users/${id}`)
      .then((res) => res.data),

  /**
   * PUT /api/Users/{id}/roles
   */
  assignRoles: ({ id, roleIds }: AssignRolesPayload) =>
    apiClient
      .put<User>(`/Users/${id}/roles`, { roleIds })
      .then((res) => res.data),
};