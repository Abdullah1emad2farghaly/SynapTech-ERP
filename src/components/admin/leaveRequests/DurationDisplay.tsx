// Intended path: src/components/admin/leaveRequests/DurationDisplay.tsx

import { useTranslation } from "react-i18next";
import { getLeaveDurationInDays } from "../../../utils/leaveDuration";

interface DurationDisplayProps {
  startDate: string;
  endDate: string;
  className?: string;
}

export function DurationDisplay({ startDate, endDate, className = "" }: DurationDisplayProps) {
  const { t } = useTranslation();
  const days = getLeaveDurationInDays(startDate, endDate);

  return (
    <span className={className} style={{ color: "var(--ink-secondary)" }}>
      {t("leaveRequests.duration.days", { count: days })}
    </span>
  );
}
