// Intended path: src/components/admin/leaveRequests/LeaveRequestsTable.tsx
//
// ASSUMPTION (project-wide convention): reuses the existing generic `DataTable`
// shell (client-side sort/pagination mode) the same way Departments/Suppliers/
// Purchase & Sales Orders do. Its exact prop surface is assumed to match those
// modules' usage (`columns`, `data`, `onRowClick`, `defaultSort`, pagination
// handled internally over the full in-memory array) — verify against the real
// component before wiring in.

import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "../../common/DataTable";
import { Avatar } from "../../common/Avatar";
import { DurationDisplay } from "./DurationDisplay";
import { LeaveRequestStatusBadge } from "./LeaveRequestStatusBadge";
import { LeaveRequestActionMenu } from "./LeaveRequestActionMenu";
import { getLeaveTypeOption } from "../../../constants/leaveTypes";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";

interface LeaveRequestsTableProps {
  requests: LeaveRequestResponse[];
  isLoading: boolean;
  onView: (request: LeaveRequestResponse) => void;
  onApprove: (request: LeaveRequestResponse) => void;
  onReject: (request: LeaveRequestResponse) => void;
  onCancel: (request: LeaveRequestResponse) => void;
}

export function LeaveRequestsTable({
  requests,
  isLoading,
  onView,
  onApprove,
  onReject,
  onCancel,
}: LeaveRequestsTableProps) {
  const { t, i18n } = useTranslation();
  

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(i18n.language, { year: "numeric", month: "short", day: "numeric" });

  const columns: DataTableColumn<LeaveRequestResponse>[] = [
    {
      id: "employee",
      header: t("leaveRequests.table.employee"),
      // sortAccessor: (row: LeaveRequestResponse) => row.employeeName,
      cell: (row: LeaveRequestResponse) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.employeeName} size="sm" />
          <span className="font-medium" style={{ color: "var(--ink-primary)" }}>
            {row.employeeName}
          </span>
        </div>
      ),
    },
    {
      id: "leaveType",
      header: t("leaveRequests.table.leaveType"),
      // sortAccessor: (row: LeaveRequestResponse) => row.leaveType,
      cell: (row: LeaveRequestResponse) => {
        const option = getLeaveTypeOption(row.leaveType);
        return <span>{option ? t(option.labelKey) : row.leaveType}</span>;
      },
    },
    {
      id: "startDate",
      header: t("leaveRequests.table.startDate"),
      // sortAccessor: (row: LeaveRequestResponse) => row.startDate,
      cell: (row: LeaveRequestResponse) => <span>{formatDate(row.startDate)}</span>,
    },
    {
      id: "endDate",
      header: t("leaveRequests.table.endDate"),
      // sortAccessor: (row: LeaveRequestResponse) => row.endDate,
      cell: (row: LeaveRequestResponse) => <span>{formatDate(row.endDate)}</span>,
    },
    {
      id: "duration",
      header: t("leaveRequests.table.duration"),
      cell: (row: LeaveRequestResponse) => <DurationDisplay startDate={row.startDate} endDate={row.endDate} />,
    },
    {
      id: "status",
      header: t("leaveRequests.table.status"),
      // sortAccessor: (row: LeaveRequestResponse) => row.status ?? "",
      cell: (row: LeaveRequestResponse) => <LeaveRequestStatusBadge status={row.status} size="sm" />,
    },
    {
      id: "approvedAt",
      header: t("leaveRequests.table.approvedAt"),
      // sortAccessor: (row: LeaveRequestResponse) => row.approvedAt ?? "",
      cell: (row: LeaveRequestResponse) => <span>{row.approvedAt ? formatDate(row.approvedAt) : "—"}</span>,
    },
    {
      id: "actions",
      header: "",
      // align: "end",
      cell: (row: LeaveRequestResponse) => (
        <LeaveRequestActionMenu
          request={row}
          onView={onView}
          onApprove={onApprove}
          onReject={onReject}
          onCancel={onCancel}
        />
      ),
    },
  ];

  return (
    <DataTable<LeaveRequestResponse>
      columns={columns}
      rows={requests}
      isLoading={isLoading}
      getRowId={(row) => row.id}
      onRowClick={onView}
      // defaultSort={{ key: "startDate", direction: "desc" }}
      // emptyState={{
      //   title: t("leaveRequests.empty.noneTitle"),
      //   description: t("leaveRequests.empty.noneDescription"),
      // }}
      // filteredEmptyState={{
      //   title: t("leaveRequests.empty.noMatchTitle"),
      //   description: t("leaveRequests.empty.noMatchDescription"),
      // }}
    />
  );
}
