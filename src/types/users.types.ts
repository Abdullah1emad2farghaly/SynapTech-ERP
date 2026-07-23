export interface User {
  id: string;
  fullName: string;
  email: string;
  branchId: string;
  branchName: string;
  departmentId: string;
  departmentName: string;
  roles: string[];
  isActive: boolean;
}

export interface GetUsersResult {
  items: User[];
  totalCount: number;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  branchId: string;
  departmentId: string;
  roleIds: string[];
}

export interface UpdateUserPayload {
  id: string;
  fullName?: string;
  branchId?: string;
  departmentId?: string;
  isActive?: boolean;
}

export interface AssignRolesPayload {
  id: string;
  roleIds: string[];
}