// src/pages/admin/attendance/AttendancePage.tsx

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AttendanceRecordResponse, AttendanceFilterState } from "../../../types/attendance.types";
import { useAttendanceList, useCheckIn, useCheckOut } from "../../../hooks/useAttendance";
import { AttendanceSummaryCards } from "../../../components/admin/attendance/AttendanceSummaryCards";
import { AttendanceFiltersBar } from "../../../components/admin/attendance/AttendanceFiltersBar";
import { AttendanceFiltersDrawer } from "../../../components/admin/attendance/AttendanceFiltersDrawer";
import { AttendanceRecordsView } from "../../../components/admin/attendance/AttendanceRecordsView";
import { AttendanceDetailsDrawer } from "../../../components/admin/attendance/AttendanceDetailsDrawer";
import { ErrorState } from "../../../components/common/ErrorState";
import { isWithinDatePreset } from "../../../utils/attendanceFormat";
import { LogIn, LogOut } from "lucide-react";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";

export function AttendancePage() {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState<AttendanceFilterState>({
    search: "",
    employeeId: null,
    datePreset: "all",
    status: null,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<AttendanceRecordResponse | null>(null);

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const [actionLoading, setActionLoading] = useState(false);
  let lang = i18n.language;
  
  const handleCheckIn = async ()=> {
    try{
      setActionLoading(true)
      await checkIn.mutateAsync();
    }catch(error){
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors);
      }
    }finally{
      setActionLoading(false);
    }
  }
  const handleCheckOut = async ()=> {
    try{
      setActionLoading(true)
      await checkOut.mutateAsync();
    }catch(error){
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors);
      }
    }finally{
      setActionLoading(false);
    }
  }
  // Only employeeId is a real server-side param — everything else filters client-side.
  const { data, isLoading, isFetching, isError, refetch } = useAttendanceList(filters.employeeId ?? undefined);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!r.employeeName?.toLowerCase().includes(q)) return false;
      }
      if (filters.status && r.status !== filters.status) return false;
      if (!isWithinDatePreset(r.date, filters.datePreset)) return false;
      return true;
    });
  }, [data, filters]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((r) => r.status && set.add(r.status));
    return Array.from(set);
  }, [data]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <header className="flex sm:flex-row flex-col items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ink-primary)]">{t("attendance.title")}</h1>
          <p className="text-sm text-[var(--ink-secondary)]">{t("attendance.description")}</p>

        </div>
        <div className="page-header-actions" style={{ gap: 10 }}>
          <button className="btn btn-success" onClick={handleCheckIn} disabled={actionLoading}>
            <LogIn size={16} />
            {actionLoading ? '...' : (lang === 'ar' ? 'تسجيل حضور' : 'Check In')}
          </button>
          <button className="btn btn-danger" onClick={handleCheckOut} disabled={actionLoading}>
            <LogOut size={16} />
            {actionLoading ? '...' : (lang === 'ar' ? 'تسجيل انصراف' : 'Check Out')}
          </button>
        </div>
      </header>

      {isError ? (
        <ErrorState
          title={t("attendance.error.title")}
          description={t("attendance.error.description")}
          onRetry={() => refetch()}
          retryLabel={t("common.tryAgain")}
        />
      ) : (
        <>
          <AttendanceSummaryCards records={filtered} />

          <AttendanceFiltersBar
            filters={filters}
            onChange={setFilters}
            statusOptions={statusOptions}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />

          <AttendanceRecordsView
            records={filtered}
            isLoading={isLoading}
            onViewDetails={setSelected}
            locale={i18n.language}
          />
        </>
      )}

      <AttendanceFiltersDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        statusOptions={statusOptions}
      />

      <AttendanceDetailsDrawer record={selected} onClose={() => setSelected(null)} locale={i18n.language} />
    </div>
  );
}
