import { useMemo, useState } from "react";
import { Search, Plus, Users, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TextInput } from "@/components/common/TextInput";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/admin/hr/StatusBadge";
import { Avatar } from "@/components/admin/hr/Avatar";
import { PersonCard } from "@/components/admin/hr/PersonCard";
import { EmptyState } from "@/components/admin/hr/EmptyState";
import { DataTable, type DataTableColumn } from "@/components/admin/hr/DataTable";
import { mockEmployees } from "@/utils/mockHrData";
import type { Employee } from "@/types/hr.types";

const STATUS_VARIANT: Record<Employee["status"], "success" | "warning" | "neutral"> = {
  active: "success",
  "on-leave": "warning",
  inactive: "neutral",
};
const STATUS_LABEL: Record<Employee["status"], string> = {
  active: "Active",
  "on-leave": "On leave",
  inactive: "Inactive",
};

// Searches across name, ID, email, phone, department, job title, manager,
// office, and country in one box — see the Module 2 enhancement spec §3.
function matchesQuery(employee: Employee, query: string) {
  if (!query) return true;
  const haystack = [
    employee.fullName,
    employee.id,
    employee.email,
    employee.phone,
    employee.department,
    employee.jobTitle,
    employee.managerName,
    employee.office,
    employee.country,
    ...employee.skills,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export default function EmployeeDirectoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");

  const filtered = useMemo(
    () => mockEmployees.filter((employee) => matchesQuery(employee, query)),
    [query]
  );

  const columns: DataTableColumn<Employee>[] = [
    {
      id: "name",
      header: "Employee",
      sortValue: (row) => row.fullName,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} size="sm" />
          <div>
            <p className="font-medium text-ink-primary">{row.fullName}</p>
            <p className="text-ink-tertiary">{row.jobTitle}</p>
          </div>
        </div>
      ),
    },
    { id: "department", header: "Department", sortValue: (row) => row.department, accessor: (row) => row.department },
    { id: "office", header: "Office", sortValue: (row) => row.office, accessor: (row) => row.office },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <StatusBadge label={STATUS_LABEL[row.status]} variant={STATUS_VARIANT[row.status]} />,
    },
    { id: "hireDate", header: "Hire date", sortValue: (row) => row.hireDate, accessor: (row) => row.hireDate },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary">
            Employees <span className="text-ink-tertiary">({filtered.length})</span>
          </h1>
          <p className="text-[0.9375rem] text-ink-secondary">Find and manage everyone in the workspace.</p>
        </div>
        <Button onClick={() => navigate("/hr/employees/new")}>
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-md flex-1">
          <TextInput
            label=""
            aria-label="Search employees"
            placeholder="Search by name, ID, email, department, skills..."
            icon={<Search className="h-4 w-4" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex overflow-hidden rounded-md border border-hairline">
          <button
            type="button"
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-2 text-[0.8125rem] ${view === "table" ? "bg-sunken text-ink-primary" : "text-ink-tertiary"}`}
          >
            <List className="h-4 w-4" /> Table
          </button>
          <button
            type="button"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-2 text-[0.8125rem] ${view === "grid" ? "bg-sunken text-ink-primary" : "text-ink-tertiary"}`}
          >
            <LayoutGrid className="h-4 w-4" /> Grid
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees match these filters"
          description="Try a different search term or clear your filters."
          actionLabel="Clear search"
          onAction={() => setQuery("")}
        />
      ) : view === "table" ? (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowId={(row) => row.id}
          onRowClick={(row) => navigate(`/hr/employees/${row.id}`)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((employee) => (
            <PersonCard key={employee.id} employee={employee} onClick={() => navigate(`/hr/employees/${employee.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
