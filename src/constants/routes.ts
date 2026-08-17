export const ROUTES = {
  LOGIN: "/",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/auth/forgetPassword",
  EMAIL_CONFIRMATION: "/auth/emailConfirmation",
  DASHBOARD: "/dashboard",
  HR_DASHBOARD: "/hr",
  HR_EMPLOYEES: "/hr/employees",
  HR_EMPLOYEE_DETAIL: "/hr/employees/:id",
} as const;
