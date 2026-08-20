// Project path: src/components/admin/employees/EmployeesDataTable.tsx

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

import {
  DataTable,
  DataTablePagination,
  type DataTableColumn,
} from "../../common/DataTable";

import { Avatar } from "../../common/Avatar";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";
import { EmployeeAccessBadge } from "./EmployeeAccessBadge";
import { EmployeeActionMenu } from "./EmployeeActionMenu";

import type { EmployeeResponse } from "../../../types/employee.types";

interface NameLookup {
  [id: string]: string;
}

interface EmployeesDataTableProps {
  rows: EmployeeResponse[];
  isLoading?: boolean;
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  departmentNames: NameLookup;
  branchNames: NameLookup;

  // Action menu callback
  onGrantAccess: (employee: EmployeeResponse) => void;

  formatSalary: (value: number) => string;
  formatDate: (value: string | null) => string;
  canManageAccess: boolean;
}

export function EmployeesDataTable({
  rows,
  isLoading,
  page,
  pageSize,
  totalRows,
  onPageChange,
  departmentNames,
  branchNames,
  onGrantAccess,
  formatDate,
  canManageAccess
}: EmployeesDataTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns: DataTableColumn<EmployeeResponse>[] = [
    {
      id: "employee",
      header: t(
        "employees.table.employee",
        "Employee"
      ),

      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={
              row.fullName ||
              row.employeeCode ||
              "—"
            }
            size="sm"
          />

          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--ink-primary)]">
              {row.fullName ||
                t(
                  "employees.unnamed",
                  "Unnamed employee"
                )}
            </p>

            <p className="truncate text-xs text-[var(--ink-tertiary)]">
              {row.employeeCode || "—"}
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "jobTitle",
      header: t(
        "employees.table.jobTitle",
        "Job Title"
      ),

      cell: (row) => (
        <span className="text-sm text-[var(--ink-secondary)]">
          {row.jobTitle || "—"}
        </span>
      ),
    },

    {
      id: "department",
      header: t(
        "employees.table.department",
        "Department"
      ),

      cell: (row) => (
        <span className="text-sm text-[var(--ink-secondary)]">
          {(row.departmentId &&
            departmentNames[row.departmentId]) ||
            "—"}
        </span>
      ),
    },

    {
      id: "branch",
      header: t(
        "employees.table.branch",
        "Branch"
      ),

      cell: (row) => (
        <span className="text-sm text-[var(--ink-secondary)]">
          {(row.branchId &&
            branchNames[row.branchId]) ||
            "—"}
        </span>
      ),
    },

    {
      id: "hireDate",
      header: t(
        "employees.table.hireDate",
        "Hire Date"
      ),

      cell: (row) => (
        <span className="text-sm text-[var(--ink-secondary)]">
          {formatDate(row.hireDate)}
        </span>
      ),
    },

    {
      id: "status",
      header: t(
        "employees.table.status",
        "Status"
      ),

      cell: (row) => (
        <EmployeeStatusBadge
          status={row.status}
          size="sm"
        />
      ),
    },

    {
      id: "access",
      header: t(
        "employees.table.access",
        "System Access"
      ),

      cell: (row) => (
        <EmployeeAccessBadge
          hasAccess={Boolean(row.userId)}
          size="sm"
        />
      ),
    },
    {
      id: "actions",
      header: "",

      cell: (row) => (
        <div
          className="relative flex justify-end"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {
            canManageAccess && (
              <EmployeeActionMenu
                employee={row}
                onGrantAccess={onGrantAccess}
              />
            )
          }
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* =========================================================
          DESKTOP / TABLET
          Existing shared DataTable is NOT modified.
          ========================================================= */}

      <div className="hidden md:block">
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          onRowClick={(row) =>
            navigate(`${row.id}`)
          }
          skeletonRowCount={6}
          emptyState={
            <div className="py-10 text-center">
              <p className="font-medium text-[var(--ink-primary)]">
                {t(
                  "employees.empty.noResultsTitle",
                  "No employees found"
                )}
              </p>

              <p className="mt-1 text-sm text-[var(--ink-tertiary)]">
                {t(
                  "employees.empty.noResultsBody",
                  "Try adjusting your search or filters."
                )}
              </p>
            </div>
          }
        />

        {/* {!isLoading && rows.length > 0 && (
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            onPageChange={onPageChange}
          />
        )} */}
      </div>

      {/* =========================================================
          MOBILE
          ========================================================= */}

      <div className="flex flex-col gap-3 md:hidden">
        {/* Loading */}
        {isLoading &&
          Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="
                  h-28
                  animate-pulse
                  rounded-lg
                  border
                  border-[var(--hairline)]
                  bg-[var(--sunken)]
                "
              />
            )
          )}

        {/* Empty */}
        {!isLoading &&
          rows.length === 0 && (
            <div
              className="
                rounded-lg
                border
                border-[var(--hairline)]
                bg-[var(--panel)]
                py-10
                text-center
              "
            >
              <p className="font-medium text-[var(--ink-primary)]">
                {t(
                  "employees.empty.noResultsTitle",
                  "No employees found"
                )}
              </p>

              <p className="mt-1 text-sm text-[var(--ink-tertiary)]">
                {t(
                  "employees.empty.noResultsBody",
                  "Try adjusting your search or filters."
                )}
              </p>
            </div>
          )}

        {/* Employee cards */}
        {!isLoading &&
          rows.map((row) => (
            <div
              key={row.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(`${row.id}`)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  navigate(`${row.id}`);
                }
              }}
              className="
                cursor-pointer
                rounded-lg
                border
                border-[var(--hairline)]
                bg-[var(--panel)]
                p-4
                text-start
                shadow-[var(--elevation-1)]
                transition-colors
                duration-150
                hover:bg-[var(--sunken)]
              "
            >
              {/* Employee header */}
              <div className="flex items-start justify-between gap-3">
                {/* Identity */}
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    name={
                      row.fullName ||
                      row.employeeCode ||
                      "—"
                    }
                    size="md"
                  />

                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--ink-primary)]">
                      {row.fullName ||
                        t(
                          "employees.unnamed",
                          "Unnamed employee"
                        )}
                    </p>

                    <p className="truncate text-xs text-[var(--ink-tertiary)]">
                      {row.employeeCode || "—"}

                      {row.jobTitle && (
                        <>
                          {" · "}
                          {row.jobTitle}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    IMPORTANT:
                    The menu belongs to THIS employee card.
                    ================================================= */}

                <div
                  className="relative shrink-0"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  onKeyDown={(event) =>
                    event.stopPropagation()
                  }
                >
                  <EmployeeActionMenu
                    employee={row}
                    onGrantAccess={onGrantAccess}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <EmployeeStatusBadge
                  status={row.status}
                  size="sm"
                />

                <EmployeeAccessBadge
                  hasAccess={Boolean(row.userId)}
                  size="sm"
                />
              </div>

              {/* Contact */}
              {(row.email || row.phone) && (
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--ink-tertiary)]">
                  {row.email && (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <Mail
                        size={12}
                        aria-hidden="true"
                      />

                      <span className="truncate">
                        {row.email}
                      </span>
                    </span>
                  )}

                  {row.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone
                        size={12}
                        aria-hidden="true"
                      />

                      {row.phone}
                    </span>
                  )}
                </div>
              )}

              {/* Additional information */}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--hairline)] pt-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--ink-tertiary)]">
                    {t(
                      "employees.table.department",
                      "Department"
                    )}
                  </p>

                  <p className="mt-0.5 truncate text-xs font-medium text-[var(--ink-secondary)]">
                    {(row.departmentId &&
                      departmentNames[
                        row.departmentId
                      ]) ||
                      "—"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] text-[var(--ink-tertiary)]">
                    {t(
                      "employees.table.branch",
                      "Branch"
                    )}
                  </p>

                  <p className="mt-0.5 truncate text-xs font-medium text-[var(--ink-secondary)]">
                    {(row.branchId &&
                      branchNames[
                        row.branchId
                      ]) ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-[var(--ink-tertiary)]">
                    {t(
                      "employees.table.hireDate",
                      "Hire Date"
                    )}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-[var(--ink-secondary)]">
                    {formatDate(row.hireDate)}
                  </p>
                </div>
              </div>
            </div>
          ))}

        {/* Mobile pagination */}
        {/* {!isLoading &&
          rows.length > 0 && (
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              totalRows={totalRows}
              onPageChange={onPageChange}
            />
          )} */}
      </div>
    </div>
  );
}
