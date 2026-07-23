import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import LoginPage from "@/pages/common/LoginPage";
import RegisterPage from "@/pages/common/RegisterPage";
import ForgotPasswordPage from "@/pages/common/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/common/ResetPasswordPage";
import EmailConfirmationPage from "@/pages/common/EmailConfirmationPage";
import HrDashboardPage from "@/pages/admin/hr/HrDashboardPage";
import EmployeeDirectoryPage from "@/pages/admin/hr/EmployeeDirectoryPage";
import EmployeeProfilePage from "@/pages/admin/hr/EmployeeProfilePage";
import { ROUTES } from "@/constants/routes";
import { AppShell } from "./components/admin/shell/AppShell";
// import DashboardHomePage from "./pages/admin/dashboard/DashboardHomePage";
import { UsersListPage } from "./pages/admin/users/UsersListPage";
import { UserDetailsPage } from "./pages/admin/users/UserDetailsPage";

const queryClient = new QueryClient();

// Layout route — renders AppShell once, <Outlet /> swaps the page inside it
function DashboardLayout() {
  return (
    <AppShell notifications={[]} onSearchFocus={() => {/* wire in step 2 */ }}>
      <Outlet />
    </AppShell>
  );
}

export default function App() {


  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.EMAIL_CONFIRMATION} element={<EmailConfirmationPage />} />
          {/* <Route path={ROUTES.HR_DASHBOARD} element={<HrDashboardPage />} />
          <Route path={ROUTES.HR_EMPLOYEES} element={<EmployeeDirectoryPage />} />
          <Route path={ROUTES.HR_EMPLOYEE_DETAIL} element={<EmployeeProfilePage />} /> */}

          {/* Shelled pages — everything nested here renders inside AppShell */}
          <Route element={<DashboardLayout />}>
            <Route path={ROUTES.DASHBOARD}  />
            <Route path={ROUTES.HR_DASHBOARD} element={<HrDashboardPage />} />
            <Route path={ROUTES.HR_EMPLOYEES} element={<EmployeeDirectoryPage />} />
            <Route path={ROUTES.HR_EMPLOYEE_DETAIL} element={<EmployeeProfilePage />} />
            <Route path="/organization">

              <Route path="branches" />
              <Route path="departments" />
              <Route path="users" element={<UsersListPage />} />
              <Route path="users/:id" element={<UserDetailsPage />} />
            </Route>
          </Route>

          {/* Module 2+ routes (dashboard, admin, etc.) register here later */}

          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
