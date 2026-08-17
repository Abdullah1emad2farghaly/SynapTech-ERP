// Intended path: src/hooks/useHrOverviewStats.ts
// The richest data surface of the five Overview pages so far, since
// Employees carries real financial (baseSalary) and organizational
// (departmentId/branchId) fields, and both Employees.hireDate and Leave
// Requests.startDate support genuine time-series charts — same category of
// "real trend, not invented" as Accounting's entriesOverTime.
//
// ASSUMPTION: EmployeeResponse.status is assumed to use "Active" as one of
// its values (no confirmed enum) — active/inactive counts and payroll are
// filtered on that string literal. LeaveRequestResponse.status is assumed
// to include "Pending" (inferred from the /approve, /reject, /cancel
// actions existing) — not directly confirmed. Verify both against real
// data before merging.
// ASSUMPTION: imports useEmployees/useDepartments/useBranches/
// useLeaveRequests from their respective existing hook files — exact
// names/paths for these already-built modules (10, 2, 3, 11) are
// unverified, check before merging.
// Attendance-derived fields rest on attendance.api.ts's larger, separately
// flagged assumption about the unfiltered list endpoint — this hook keeps
// attendance's loading/error state fully separate so a bad assumption
// there degrades gracefully instead of breaking the rest of the page.

import { useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { useDepartments } from './useDepartments';
import { useBranches } from './useBranches';
import { useLeaveRequests } from './useLeaveRequests';
import { useAttendanceList } from './useAttendance';
import type { LeaveRequestResponse } from '../services/api/leaveRequests.api';

export interface GroupCount {
  key: string;
  label: string;
  count: number;
}

export interface MonthlyCount {
  monthKey: string;
  monthLabel: string;
  count: number;
}

export interface HrOverviewStats {
  totalEmployees: number;
  activeEmployees: number;
  totalMonthlyPayroll: number;
  employeesByDepartment: GroupCount[];
  employeesByBranch: GroupCount[];
  headcountGrowth: MonthlyCount[]; // cumulative, by hireDate
  totalLeaveRequests: number;
  pendingLeaveRequests: number;
  leaveRequestsByType: GroupCount[];
  leaveRequestsByStatus: GroupCount[];
  leaveRequestsOverTime: MonthlyCount[]; // non-cumulative, by startDate
  recentLeaveRequests: LeaveRequestResponse[];
  pendingLeaveRequestsList: LeaveRequestResponse[];
}

export interface AttendanceStats {
  attendanceByStatus: GroupCount[];
  checkInsOverTime: MonthlyCount[];
  todayPresentCount: number;
  todayTotalRecords: number;
}

function monthBucket(dateStr: string): { key: string; label: string } {
  const d = new Date(dateStr);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const label = new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  });
  return { key, label };
}

export function useHrOverviewStats() {
  const employeesQuery = useEmployees();
  const departmentsQuery = useDepartments();
  const branchesQuery = useBranches();
  const leaveRequestsQuery = useLeaveRequests();
  const attendanceQuery = useAttendanceList();

  const stats = useMemo<HrOverviewStats | null>(() => {
    if (!employeesQuery.data || !departmentsQuery.data || !branchesQuery.data || !leaveRequestsQuery.data) {
      return null;
    }
    const employees = employeesQuery.data;
    const departments = departmentsQuery.data;
    const branches = branchesQuery.data;
    const leaveRequests = leaveRequestsQuery.data;

    const totalEmployees = employees.length;
    const activeEmployeesList = employees.filter(e => e.status === 'Active');
    const activeEmployees = activeEmployeesList.length;
    const totalMonthlyPayroll = activeEmployeesList.reduce((sum, e) => sum + (e.baseSalary ?? 0), 0);

    // --- employees by department (with an explicit Unassigned bucket) ---
    const deptNameById = new Map(departments.map(d => [d.value, d.label ?? '—']));
    const deptCounts = new Map<string, GroupCount>();
    for (const e of employees) {
      const key = e.departmentId ?? '__unassigned__';
      const existing = deptCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        deptCounts.set(key, {
          key,
          label: e.departmentId ? deptNameById.get(e.departmentId) ?? '—' : '__unassigned__',
          count: 1,
        });
      }
    }
    const employeesByDepartment = Array.from(deptCounts.values()).sort((a, b) => b.count - a.count);

    // --- employees by branch ---
    const branchNameById = new Map(branches.map(b => [b.value, b.label ?? '—']));
    const branchCounts = new Map<string, GroupCount>();
    for (const e of employees) {
      const key = e.branchId ?? '__unassigned__';
      const existing = branchCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        branchCounts.set(key, {
          key,
          label: e.branchId ? branchNameById.get(e.branchId) ?? '—' : '__unassigned__',
          count: 1,
        });
      }
    }
    const employeesByBranch = Array.from(branchCounts.values()).sort((a, b) => b.count - a.count);

    // --- headcount growth (cumulative, by hireDate month) ---
    const hireMonthCounts = new Map<string, { label: string; count: number }>();
    for (const e of employees) {
      if (!e.hireDate) continue;
      const { key, label } = monthBucket(e.hireDate);
      const existing = hireMonthCounts.get(key);
      hireMonthCounts.set(key, { label, count: (existing?.count ?? 0) + 1 });
    }
    let running = 0;
    const headcountGrowth: MonthlyCount[] = Array.from(hireMonthCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, { label, count }]) => {
        running += count;
        return { monthKey, monthLabel: label, count: running };
      });

    // --- leave requests ---
    const totalLeaveRequests = leaveRequests.length;
    const pendingList = leaveRequests.filter(l => l.status === 'Pending');
    const pendingLeaveRequests = pendingList.length;

    const typeCounts = new Map<string, number>();
    for (const l of leaveRequests) {
      const key = l.leaveType ?? 'Unknown';
      typeCounts.set(key, (typeCounts.get(key) ?? 0) + 1);
    }
    const leaveRequestsByType: GroupCount[] = Array.from(typeCounts.entries()).map(([key, count]) => ({
      key,
      label: key,
      count,
    }));

    const statusCounts = new Map<string, number>();
    for (const l of leaveRequests) {
      const key = l.status ?? 'Unknown';
      statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
    }
    const leaveRequestsByStatus: GroupCount[] = Array.from(statusCounts.entries()).map(([key, count]) => ({
      key,
      label: key,
      count,
    }));

    const leaveMonthCounts = new Map<string, { label: string; count: number }>();
    for (const l of leaveRequests) {
      if (!l.startDate) continue;
      const { key, label } = monthBucket(l.startDate);
      const existing = leaveMonthCounts.get(key);
      leaveMonthCounts.set(key, { label, count: (existing?.count ?? 0) + 1 });
    }
    const leaveRequestsOverTime: MonthlyCount[] = Array.from(leaveMonthCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, { label, count }]) => ({ monthKey, monthLabel: label, count }));

    const recentLeaveRequests = [...leaveRequests]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 8);

    const pendingLeaveRequestsList = [...pendingList]
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 6);

    return {
      totalEmployees,
      activeEmployees,
      totalMonthlyPayroll,
      employeesByDepartment,
      employeesByBranch,
      headcountGrowth,
      totalLeaveRequests,
      pendingLeaveRequests,
      leaveRequestsByType,
      leaveRequestsByStatus,
      leaveRequestsOverTime,
      recentLeaveRequests,
      pendingLeaveRequestsList,
    };
  }, [employeesQuery.data, departmentsQuery.data, branchesQuery.data, leaveRequestsQuery.data]);

  const attendanceStats = useMemo<AttendanceStats | null>(() => {
    if (!attendanceQuery.data) return null;
    const records = attendanceQuery.data;

    const statusCounts = new Map<string, number>();
    for (const r of records) {
      const key = r.status ?? 'Unknown';
      statusCounts.set(key, (statusCounts.get(key) ?? 0) + 1);
    }
    const attendanceByStatus: GroupCount[] = Array.from(statusCounts.entries()).map(([key, count]) => ({
      key,
      label: key,
      count,
    }));

    const monthCounts = new Map<string, { label: string; count: number }>();
    for (const r of records) {
      if (!r.checkInTime) continue;
      const { key, label } = monthBucket(r.date);
      const existing = monthCounts.get(key);
      monthCounts.set(key, { label, count: (existing?.count ?? 0) + 1 });
    }
    const checkInsOverTime: MonthlyCount[] = Array.from(monthCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, { label, count }]) => ({ monthKey, monthLabel: label, count }));

    const todayStr = new Date().toDateString();
    const todaysRecords = records.filter(r => new Date(r.date).toDateString() === todayStr);
    const todayPresentCount = todaysRecords.filter(r => !!r.checkInTime).length;

    return {
      attendanceByStatus,
      checkInsOverTime,
      todayPresentCount,
      todayTotalRecords: todaysRecords.length,
    };
  }, [attendanceQuery.data]);

  return {
    stats,
    isLoading:
      employeesQuery.isLoading ||
      departmentsQuery.isLoading ||
      branchesQuery.isLoading ||
      leaveRequestsQuery.isLoading,
    isError: employeesQuery.isError || departmentsQuery.isError || branchesQuery.isError || leaveRequestsQuery.isError,
    attendanceStats,
    isAttendanceLoading: attendanceQuery.isLoading,
    isAttendanceError: attendanceQuery.isError,
    refetch: () => {
      employeesQuery.refetch();
      departmentsQuery.refetch();
      branchesQuery.refetch();
      leaveRequestsQuery.refetch();
      attendanceQuery.refetch();
    },
  };
}
