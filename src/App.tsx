import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import LoginPage from "@/pages/common/LoginPage";
import RegisterPage from "@/pages/common/RegisterPage";
import ForgotPasswordPage from "@/pages/common/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/common/ResetPasswordPage";
import EmailConfirmationPage from "@/pages/common/EmailConfirmationPage";

import { ROUTES } from "@/constants/routes";
import { AppShell } from "./components/admin/shell/AppShell";
// import DashboardHomePage from "./pages/admin/dashboard/DashboardHomePage";
import { UsersListPage } from "./pages/admin/users/UsersListPage";
import { UserDetailsPage } from "./pages/admin/users/UserDetailsPage";
import { DepartmentsPage } from "./pages/admin/departments/DepartmentsPage";
import { BranchesPage } from "./pages/admin/branches/BranchesPage";
import { BranchDetailsPage } from "./pages/admin/branches/BranchDetailsPage";
import { RolesListPage } from "./pages/admin/roles/RolesListPage";
import { RoleDetailsPage } from "./pages/admin/roles/RoleDetailsPage";
import { AccountsListPage } from "./pages/admin/accounts/AccountsListPage";
import { AccountFormPage } from "./pages/admin/accounts/AccountFormPage";
import { AccountDetailsPage } from "./pages/admin/accounts/AccountDetailsPage";
import { JournalEntriesListPage } from "./pages/admin/journal-entries/JournalEntriesListPage";
import { CreateJournalEntryPage } from "./pages/admin/journal-entries/CreateJournalEntryPage";
import { JournalEntryDetailsPage } from "./pages/admin/journal-entries/JournalEntryDetailsPage";
import { WarehousesListPage } from "./pages/admin/warehouses/WarehousesListPage";
import { CategoriesPage } from "./pages/admin/categories/CategoriesPage";
import { ProductsListPage } from "./pages/admin/products/ProductsListPage";
import { ProductDetailsPage } from "./pages/admin/products/ProductDetailsPage";
import { StockOverviewPage } from "./pages/admin/stock/StockOverviewPage";
import { WarehouseInventoryPage } from "./pages/admin/stock/WarehouseInventoryPage";
import { RecordMovementPage } from "./pages/admin/stock/RecordMovementPage";
import { TransferStockPage } from "./pages/admin/stock/TransferStockPage";
import { PurchaseOrdersListPage } from "./pages/admin/purchase-orders/PurchaseOrdersListPage";
import { PurchaseOrderDetailsPage } from "./pages/admin/purchase-orders/PurchaseOrderDetailsPage";
import { SuppliersListPage } from "./pages/admin/suppliers/SuppliersListPage";
import { SupplierDetailsPage } from "./pages/admin/suppliers/SupplierDetailsPage";
import { CreateEditPurchaseOrderPage } from "./pages/admin/purchase-orders/CreateEditPurchaseOrderPage";
import { ReceiveGoodsPage } from "./pages/admin/purchase-orders/ReceiveGoodsPage";
import { CustomersPage } from "./pages/admin/customers/CustomersPage";
import { SalesOrdersListPage } from "./pages/admin/sales-orders/SalesOrdersListPage";
import { CreateEditSalesOrderPage } from "./pages/admin/sales-orders/CreateEditSalesOrderPage";
import { SalesOrderDetailsPage } from "./pages/admin/sales-orders/SalesOrderDetailsPage";
import { ShipGoodsPage } from "./pages/admin/sales-orders/ShipGoodsPage";
import { EmployeeDetailsPage } from "./pages/admin/employees/EmployeeDetailsPage";
import { EditEmployeePage } from "./pages/admin/employees/EditEmployeePage";
import { CreateEmployeePage } from "./pages/admin/employees/CreateEmployeePage";
import { EmployeesListPage } from "./pages/admin/employees/EmployeesListPage";
import { MyAttendancePage } from "./pages/admin/attendance/MyAttendancePage";
import { AttendancePage } from "./pages/admin/attendance/AttendancePage";
import { CompanySettingsPage } from "./pages/admin/company/CompanySettingsPage";
import { MyLeaveRequestsPage } from "./pages/admin/leaveRequests/MyLeaveRequestsPage";
import { LeaveRequestsDashboardPage } from "./pages/admin/leaveRequests/LeaveRequestsDashboardPage";
import { LeaveRequestsListPage } from "./pages/admin/leaveRequests/LeaveRequestsListPage";
import { LeaveRequestDetailsPage } from "./pages/admin/leaveRequests/LeaveRequestDetailsPage";
import SalesOverviewPage from "./pages/admin/sales/SalesOverviewPage";
import PurchasingOverviewPage from "./pages/admin/purchasing/PurchasingOverviewPage";
import InventoryOverviewPage from "./pages/admin/inventory/InventoryOverviewPage";

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
            <Route path={ROUTES.DASHBOARD} />
            <Route path="settings" element={<CompanySettingsPage />} />
            <Route path="/organization">
              <Route path="branches" element={<BranchesPage />} />
              <Route path="branches/:id" element={<BranchDetailsPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
            </Route>

            <Route path="/administration">
              <Route path="users" element={<UsersListPage />} />
              <Route path="users/:id" element={<UserDetailsPage />} />
              <Route path="roles" element={<RolesListPage />} />
              <Route path="roles/:id" element={<RoleDetailsPage />} />
            </Route>


            <Route path="/accounting">
              <Route path="accounts" element={<AccountsListPage />} />
              <Route path="accounts/new" element={<AccountFormPage />} />
              <Route path="accounts/:id" element={<AccountDetailsPage />} />

              <Route path="journal-entries" element={<JournalEntriesListPage />} />
              <Route path="journal-entries/create" element={<CreateJournalEntryPage />} />
              <Route path="journal-entries/:id" element={<JournalEntryDetailsPage />} />
            </Route>

            <Route path="/inventory">
              <Route path="/inventory" element={<InventoryOverviewPage />} />
              
              <Route path="warehouses" element={<WarehousesListPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="products" element={<ProductsListPage />} />
              <Route path="products/:id" element={<ProductDetailsPage />} />

              <Route path="stock" element={<StockOverviewPage />} />

              <Route path="warehouses/:warehouseId" element={<WarehouseInventoryPage />} />

              <Route path="new-movement" element={<RecordMovementPage />} />
              <Route path="stock/transfer" element={<TransferStockPage />} />
            </Route>

            <Route path="/hr">
              <Route path="employees" element={<EmployeesListPage />} />
              <Route path="employees/create" element={<CreateEmployeePage />} />
              <Route path="employees/:id" element={<EmployeeDetailsPage />} />
              <Route path="employees/:id/edit" element={<EditEmployeePage />} />

              <Route path="attendance" element={<AttendancePage />} />
              <Route path="my-attendance" element={<MyAttendancePage />} />

              <Route path="leave-requests" element={<LeaveRequestsDashboardPage />} />
              <Route path="leave-requests/all" element={<LeaveRequestsListPage />} />
              <Route path="leave-requests/:id" element={<LeaveRequestDetailsPage />} />
              <Route path="my-requests" element={<MyLeaveRequestsPage />} />
            </Route>

            <Route path="/purchasing">
              <Route path="/purchasing" element={<PurchasingOverviewPage />} />
              <Route path="suppliers" element={<SuppliersListPage />} />
              <Route path="suppliers/:id" element={<SupplierDetailsPage />} />

              <Route path="purchase-orders" element={<PurchaseOrdersListPage />} />
              <Route path="purchase-orders/create" element={<CreateEditPurchaseOrderPage />} />
              <Route path="purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
              <Route path="purchase-orders/:id/edit" element={<CreateEditPurchaseOrderPage />} />
              <Route path="purchase-orders/:id/receive" element={<ReceiveGoodsPage />} />
            </Route>

            <Route path="/sales">
              <Route path="/sales" element={<SalesOverviewPage/>}/>
              <Route path="customers" element={<CustomersPage />} />
              <Route path="sales-orders" element={<SalesOrdersListPage />} />
              <Route path="sales-orders/create" element={<CreateEditSalesOrderPage />} />
              <Route path="sales-orders/:id" element={<SalesOrderDetailsPage />} />
              <Route path="sales-orders/:id/edit" element={<CreateEditSalesOrderPage />} />
              <Route path="sales-orders/:id/ship" element={<ShipGoodsPage />} />
            </Route>
          </Route>

          {/* Module 2+ routes (dashboard, admin, etc.) register here later */}

          {/* <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} /> */}
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
