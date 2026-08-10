// Project path: src/types/employee.types.ts
//
// Types mirror the confirmed EmployeeResponse / CreateEmployeeRequest /
// UpdateEmployeeRequest / GrantEmployeeAccessRequest / UserResponse shapes
// exactly as given in the Employees module brief. Nothing invented.

export interface EmployeeResponse {
  id: string;
  employeeCode: string | null;
  fullName: string | null;
  nationalId: string | null;
  dateOfBirth: string | null;
  hireDate: string;
  jobTitle: string | null;
  departmentId: string | null;
  branchId: string | null;
  managerId: string | null;
  baseSalary: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string | null;
  userId: string | null;
}

export interface CreateEmployeeRequest {
  employeeCode?: string | null;
  fullName?: string | null;
  nationalId?: string | null;
  dateOfBirth?: string | null;
  hireDate: string;
  jobTitle?: string | null;
  departmentId?: string | null;
  branchId?: string | null;
  managerId?: string | null;
  baseSalary: number;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  userId?: string | null;
}

// NOTE: employeeCode is intentionally absent — UpdateEmployeeRequest does not
// support changing it (see module notes: employee code is read-only on edit).
export interface UpdateEmployeeRequest {
  fullName?: string | null;
  nationalId?: string | null;
  dateOfBirth?: string | null;
  jobTitle?: string | null;
  departmentId?: string | null;
  branchId?: string | null;
  managerId?: string | null;
  baseSalary: number;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: string | null;
  userId?: string | null;
}

export interface GrantEmployeeAccessRequest {
  email?: string | null;
  roleNames?: string[] | null;
}

export interface UserResponse {
  id: string;
  email: string | null;
  fullName: string | null;
  branchId: string | null;
  branchName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  isActive: boolean;
  roles: string[] | null;
}

// ASSUMPTION (flagged, unconfirmed): no dedicated GET /api/Employees query-param
// contract was given in the brief, same category of gap as GET /api/Users'
// unconfirmed search/filter/sort/pagination params. Handled client-side over
// the full fetched list until confirmed, same precedent as Departments/Roles/
// Journal Entries/Suppliers.
export interface EmployeesListParams {
  search?: string;
  status?: string;
  departmentId?: string;
  branchId?: string;
  hasAccess?: boolean;
}
