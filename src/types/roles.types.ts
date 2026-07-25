// Project path: src/types/roles.types.ts

/** Matches confirmed GET /api/Roles and GET /api/Roles/{id} response shape */
export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // permission codes currently assigned to this role
}

/** Matches confirmed GET /api/Roles/permissions-catalog response shape */
export interface PermissionResponse {
  code: string;
  module: string;
  description: string;
}

/** Body for POST /api/Roles */
export interface CreateRolePayload {
  name: string;
  description: string;
  permissionCodes: string[];
}

/** Body for PUT /api/Roles/{id} — name/description only, per confirmed contract.
 *  Permission changes go through the separate PUT /api/Roles/{id}/permissions endpoint. */
export interface UpdateRolePayload {
  name: string;
  description: string;
}

/** Body for PUT /api/Roles/{id}/permissions */
export interface AssignPermissionsPayload {
  permissionCodes: string[];
}

/** Client-side grouping of the permissions catalog by module — derived, not a server shape */
export interface PermissionModuleGroup {
  module: string;
  permissions: PermissionResponse[];
}
