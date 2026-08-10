// Intended path: src/components/admin/leaveRequests/LeaveRequestKpiCards.tsx
//
// All counts computed client-side from the already-loaded GET /api/LeaveRequests
// collection. No trend arrows, no percentage-change — there is no historical/
// time-series data backing them (no createdAt), so none are shown or guessed.

import { CalendarCheck, CalendarClock, CalendarX2, ListChecks } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";

interface LeaveRequestKpiCardsProps {
  requests: LeaveRequestResponse[];
  onCardClick?: (status: string | null) => void;
}

export function LeaveRequestKpiCards({ requests, onCardClick }: LeaveRequestKpiCardsProps) {
  const { t } = useTranslation();

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      approved: requests.filter((r) => r.status === "Approved").length,
      rejected: requests.filter((r) => r.status === "Rejected").length,
    };
  }, [requests]);

  const cards = [
    {
      key: "total",
      status: null,
      labelKey: "leaveRequests.kpi.total",
      value: counts.total,
      icon: ListChecks,
      colorVar: "var(--signal)",
    },
    {
      key: "pending",
      status: "Pending",
      labelKey: "leaveRequests.kpi.pending",
      value: counts.pending,
      icon: CalendarClock,
      colorVar: "var(--warning)",
    },
    {
      key: "approved",
      status: "Approved",
      labelKey: "leaveRequests.kpi.approved",
      value: counts.approved,
      icon: CalendarCheck,
      colorVar: "var(--success)",
    },
    {
      key: "rejected",
      status: "Rejected",
      labelKey: "leaveRequests.kpi.rejected",
      value: counts.rejected,
      icon: CalendarX2,
      colorVar: "var(--error)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onCardClick?.(card.status)}
            className="text-start rounded-lg p-4 transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--panel)",
              border: "1px solid var(--hairline)",
              boxShadow: "var(--elevation-1)",
            }}
          >
            <div
              className="inline-flex items-center justify-center rounded-md p-2 mb-3"
              style={{ backgroundColor: `color-mix(in srgb, ${card.colorVar} 12%, transparent)`, color: card.colorVar }}
            >
              <Icon size={18} />
            </div>
            <div className="text-2xl font-semibold" style={{ color: "var(--ink-primary)" }}>
              {card.value}
            </div>
            <div className="text-sm" style={{ color: "var(--ink-secondary)" }}>
              {t(card.labelKey)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
