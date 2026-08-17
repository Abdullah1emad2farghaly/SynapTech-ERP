// Project path: src/pages/admin/employees/EmployeeDetailsPage.tsx
//
// Tabs limited to what the API actually supports: Overview, Employment,
// Contact, Compensation, System Access — no tab for anything unsupported
// (payroll, attendance, documents, etc. per the brief's explicit exclusion
// list). Route: /employees/:id. Reads ?tab=access to deep-link into the
// System Access tab from the action menu's "View System Access" item.

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, MoreVertical } from "lucide-react";
import { useEmployee, useDeleteEmployee } from "../../../hooks/useEmployees";
import { Avatar } from "../../../components/common/Avatar";
import { EmployeeStatusBadge } from "../../../components/admin/employees/EmployeeStatusBadge";
import { EmployeeAccessBadge } from "../../../components/admin/employees/EmployeeAccessBadge";
import { EmployeeInfoCard } from "../../../components/admin/employees/EmployeeInfoCard";
import { EmployeeAccessCard } from "../../../components/admin/employees/EmployeeAccessCard";
import { GrantAccessDrawer } from "../../../components/admin/employees/GrantAccessDrawer";
import { ConfirmationDialog } from "../../../components/common/ConfirmationDialog";
import { useRoles } from "@/hooks/useRoles";
import { MultiSelectOption } from "@/components/common/MultiSelectSearchable";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

type TabId = "overview" | "employment" | "contact" | "compensation" | "access";

function formatSalary(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function EmployeeDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { data: employee, isLoading, isError } = useEmployee(id);
  const deleteEmployee = useDeleteEmployee();

  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get("tab") as TabId) || "overview"
  );
  const [grantAccessOpen, setGrantAccessOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const {data: roleOptions = []} = useRoles()

  const options: MultiSelectOption[] = roleOptions.map((opt) => {
    return {
      value: opt.id,
      label: opt.name
    }
    
  })

  if (isLoading) {
    return (
      <div className="md:px-6 px-2 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--sunken)]" />
        <div className="mt-6 h-40 animate-pulse rounded-lg bg-[var(--sunken)]" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col items-center p-14 text-center">
        <p className="text-base font-semibold text-[var(--ink-primary)]">
          {t("common.errors.title", "Something went wrong")}
        </p>
        <p className="mt-1 text-sm text-[var(--ink-tertiary)]">
          {t("employees.errors.loadFailed", "We couldn't load this employee right now.")}
        </p>
      </div>
    );
  }

  const displayName = employee.fullName || t("employees.unnamed", "Unnamed employee");
  const hasAccess = Boolean(employee.userId);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("employees.tabs.overview", "Overview") },
    { id: "employment", label: t("employees.tabs.employment", "Employment") },
    { id: "contact", label: t("employees.tabs.contact", "Contact") },
    { id: "compensation", label: t("employees.tabs.compensation", "Compensation") },
    { id: "access", label: t("employees.tabs.access", "System Access") },
  ];

  const handleDelete = async () => {
    try {
      await deleteEmployee.mutateAsync(employee.id);
      toast.success(t("employees.toast.deleted", "Employee deleted"));
      navigate("/hr/employees");
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 md:px-6 px-2 py-6">
      <button
        type="button"
        onClick={() => navigate("/hr/employees")}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t("common.back", "Back")}
      </button>

      {/* Header */}
      <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-6 shadow-[var(--elevation-1)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={displayName} size="lg" />
            <div>
              <h1 className="text-xl font-semibold text-[var(--ink-primary)]">{displayName}</h1>
              <p className="text-sm text-[var(--ink-tertiary)]">
                {employee.employeeCode || "—"}
                {employee.jobTitle ? ` · ${employee.jobTitle}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <EmployeeStatusBadge status={employee.status} size="sm" />
                <EmployeeAccessBadge hasAccess={hasAccess} size="sm" />
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`edit`)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--hairline)] px-3 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
            >
              <Pencil size={14} aria-hidden="true" />
              {t("employees.actions.edit", "Edit Employee")}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t("common.moreActions", "More actions")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--hairline)] text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
            >
              <MoreVertical size={16} aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute end-0 top-11 z-20 w-48 overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--panel)] shadow-[var(--elevation-1)]"
              >
                {!hasAccess && (
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setGrantAccessOpen(true);
                    }}
                    className="flex w-full px-3 py-2.5 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
                  >
                    {t("employees.actions.grantAccess", "Grant Access")}
                  </button>
                )}
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDeleteOpen(true);
                  }}
                  className="flex w-full px-3 py-2.5 text-start text-sm text-[var(--error)] hover:bg-[var(--error)]/5"
                >
                  {t("employees.actions.delete", "Delete Employee")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--hairline)]">
        <nav className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-[var(--signal)] text-[var(--signal)]"
                  : "border-transparent text-[var(--ink-tertiary)] hover:text-[var(--ink-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <EmployeeInfoCard
            title={t("employees.overview.personal", "Personal Information")}
            fields={[
              { label: t("employees.form.fullName", "Full Name"), value: employee.fullName },
              { label: t("employees.form.nationalId", "National ID"), value: employee.nationalId },
              {
                label: t("employees.form.dateOfBirth", "Date of Birth"),
                value: formatDate(employee.dateOfBirth),
              },
            ]}
          />
          <EmployeeInfoCard
            title={t("employees.overview.employmentSummary", "Employment Summary")}
            fields={[
              {
                label: t("employees.form.employeeCode", "Employee Code"),
                value: employee.employeeCode,
                type: "mono",
              },
              { label: t("employees.form.jobTitle", "Job Title"), value: employee.jobTitle },
              {
                label: t("employees.form.hireDate", "Hire Date"),
                value: formatDate(employee.hireDate),
              },
            ]}
          />
        </div>
      )}

      {activeTab === "employment" && (
        <EmployeeInfoCard
          title={t("employees.tabs.employment", "Employment")}
          fields={[
            {
              label: t("employees.form.employeeCode", "Employee Code"),
              value: employee.employeeCode,
              type: "mono",
            },
            { label: t("employees.form.jobTitle", "Job Title"), value: employee.jobTitle },
            {
              label: t("employees.form.hireDate", "Hire Date"),
              value: formatDate(employee.hireDate),
            },
            { label: t("employees.form.status", "Status"), value: employee.status },
          ]}
        />
      )}

      {activeTab === "contact" && (
        <EmployeeInfoCard
          title={t("employees.tabs.contact", "Contact")}
          fields={[
            { label: t("employees.form.email", "Email"), value: employee.email, type: "email" },
            { label: t("employees.form.phone", "Phone"), value: employee.phone, type: "phone" },
            { label: t("employees.form.address", "Address"), value: employee.address },
          ]}
        />
      )}

      {activeTab === "compensation" && (
        <EmployeeInfoCard
          title={t("employees.tabs.compensation", "Compensation")}
          fields={[
            {
              label: t("employees.form.baseSalary", "Base Salary"),
              value: formatSalary(employee.baseSalary),
            },
          ]}
        />
      )}

      {activeTab === "access" && (
        <EmployeeAccessCard
          hasAccess={hasAccess}
          userResponse={null}
          onGrantAccess={() => setGrantAccessOpen(true)}
        />
      )}

      <GrantAccessDrawer
        open={grantAccessOpen}
        onClose={() => setGrantAccessOpen(false)}
        employee={employee}
        roleOptions={options}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        tone="destructive"
        title={t("employees.deleteDialog.title", "Delete Employee?")}
        body={t(
          "employees.deleteDialog.body",
          "You are about to permanently remove {{name}} ({{code}}). This action cannot be undone.",
          { name: displayName, code: employee.employeeCode || "—" }
        )}
        confirmLabel={t("employees.deleteDialog.confirm", "Delete Employee")}
        cancelLabel={t("common.cancel", "Cancel")}
        isSubmitting={deleteEmployee.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
