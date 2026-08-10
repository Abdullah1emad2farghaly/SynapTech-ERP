import { Check, Clock, Minus, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";

interface LeaveRequestStatusTrackerProps {
  request: Pick<LeaveRequestResponse, "status" | "approvedAt">;

  /**
   * Compact renders a smaller inline version (e.g. for cards).
   * Full is used on the details page.
   */
  variant?: "full" | "compact";
}

type NodeState =
  | "completed"
  | "current"
  | "success"
  | "error"
  | "upcoming";

interface TrackerNode {
  key: string;
  labelKey: string;
  state: NodeState;
  dateLabel?: string | null;
}

function buildNodes(
  status: string | null | undefined,
  approvedAt: string | null,
  formatDate: (d: string) => string
): TrackerNode[] {
  /**
   * Cancelled flow:
   * Requested -> Pending -> Cancelled
   *
   * We intentionally don't try to guess the previous state.
   */
  if (status === "Cancelled") {
    return [
      {
        key: "requested",
        labelKey: "leaveRequests.tracker.requested",
        state: "completed",
      },
      {
        key: "pending",
        labelKey: "leaveRequests.tracker.pending",
        state: "completed",
      },
      {
        key: "cancelled",
        labelKey: "leaveRequests.tracker.cancelled",
        state: "error",
      },
    ];
  }

  const requested: TrackerNode = {
    key: "requested",
    labelKey: "leaveRequests.tracker.requested",
    state: "completed",
  };

  const pending: TrackerNode = {
    key: "pending",
    labelKey: "leaveRequests.tracker.pending",
    state: status === "Pending" ? "current" : "completed",
  };

  let decision: TrackerNode;

  if (status === "Approved") {
    decision = {
      key: "decision",
      labelKey: "leaveRequests.tracker.approved",
      state: "success",
      dateLabel: approvedAt ? formatDate(approvedAt) : null,
    };
  } else if (status === "Rejected") {
    decision = {
      key: "decision",
      labelKey: "leaveRequests.tracker.rejected",
      state: "error",
    };
  } else {
    // Pending or unknown/null:
    // visually treat as still pending.
    decision = {
      key: "decision",
      labelKey: "leaveRequests.tracker.decision",
      state: "upcoming",
    };
  }

  return [requested, pending, decision];
}

function nodeColor(state: NodeState): string {
  switch (state) {
    case "success":
      return "var(--success)";

    case "error":
      return "var(--error)";

    case "current":
      return "var(--warning)";

    case "completed":
      return "var(--signal)";

    default:
      return "var(--ink-tertiary)";
  }
}

function NodeIcon({ state }: { state: NodeState }) {
  const iconSize = 14;

  if (state === "success") {
    return <Check size={iconSize} strokeWidth={2.5} />;
  }

  if (state === "error") {
    return <X size={iconSize} strokeWidth={2.5} />;
  }

  if (state === "current") {
    return <Clock size={iconSize} strokeWidth={2.2} />;
  }

  if (state === "completed") {
    return <Check size={iconSize} strokeWidth={2.5} />;
  }

  return <Minus size={iconSize} strokeWidth={2} />;
}

export function LeaveRequestStatusTracker({
  request,
  variant = "full",
}: LeaveRequestStatusTrackerProps) {
  const { t, i18n } = useTranslation();

  const prefersReducedMotion = useReducedMotion();

  const isRtl =
    i18n.dir?.() === "rtl" ||
    i18n.language?.startsWith("ar");

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const nodes = buildNodes(
    request.status,
    request.approvedAt,
    formatDate
  );

  return (
    <div
      className={`
        w-full
        flex
        ${
          variant === "compact"
            ? "items-center gap-2"
            : "flex-col sm:flex-row sm:items-start"
        }
      `}
      dir={isRtl ? "rtl" : "ltr"}
      role="group"
      aria-label={t("leaveRequests.tracker.ariaLabel")}
    >
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;

        const isConnectorCompleted =
          node.state === "completed" ||
          node.state === "success" ||
          node.state === "error";

        return (
          <div
            key={node.key}
            className={`
              relative
              flex
              ${
                variant === "compact"
                  ? "items-center gap-2"
                  : `
                    items-start
                    gap-3
                    pb-6

                    sm:flex-1
                    sm:flex-col
                    sm:gap-2
                    sm:pb-0
                  `
              }
            `}
          >
            {/* ========================================================== */}
            {/* MOBILE NODE COLUMN                                         */}
            {/* ========================================================== */}

            <div
              className="
                relative
                h-[28px]
                w-[28px]
                shrink-0
              "
            >
              {/* Circle */}
              <motion.div
                initial={false}
                animate={
                  node.state === "current" &&
                  !prefersReducedMotion
                    ? {
                        boxShadow: [
                          "0 0 0 0px rgba(217,119,6,0.25)",
                          "0 0 0 6px rgba(217,119,6,0)",
                        ],
                      }
                    : {}
                }
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                }}
                className="
                  absolute
                  inset-0
                  z-20
                  flex
                  items-center
                  justify-center
                  rounded-full
                "
                style={{
                  width:
                    variant === "compact"
                      ? 22
                      : 28,

                  height:
                    variant === "compact"
                      ? 22
                      : 28,

                  color: nodeColor(
                    node.state
                  ),

                  backgroundColor: `color-mix(in srgb, ${nodeColor(
                    node.state
                  )} 14%, transparent)`,

                  border: `1.5px solid ${nodeColor(
                    node.state
                  )}`,
                }}
              >
                <NodeIcon state={node.state} />
              </motion.div>

              {/* ======================================================== */}
              {/* MOBILE VERTICAL CONNECTOR                               */}
              {/* ======================================================== */}

              {!isLast && (
                <div
                  aria-hidden="true"
                  className="
                    absolute
                    start-[13px]
                    top-[100%]
                    z-0
                    h-[calc(100%-3px)]
                    w-[2px]
                    sm:hidden
                  "
                  style={{
                    backgroundColor:
                      isConnectorCompleted
                        ? "var(--signal)"
                        : "var(--hairline)",
                  }}
                />
              )}
            </div>

            {/* ========================================================== */}
            {/* DESKTOP HORIZONTAL CONNECTOR                              */}
            {/* ========================================================== */}

            {!isLast && (
              <div
                aria-hidden="true"
                className="
                  absolute
                  start-[28px]
                  end-0
                  top-[13px]
                  z-0
                  hidden
                  h-[2px]
                  sm:block
                "
                style={{
                  backgroundColor:
                    isConnectorCompleted
                      ? "var(--signal)"
                      : "var(--hairline)",
                }}
              />
            )}

            {/* ========================================================== */}
            {/* LABEL                                                      */}
            {/* ========================================================== */}

            <div
              className="
                min-w-0
                text-sm
                font-medium
              "
              style={{
                color: "var(--ink-primary)",
              }}
            >
              {t(node.labelKey)}

              {node.dateLabel && (
                <div
                  className="text-xs"
                  style={{
                    color:
                      "var(--ink-tertiary)",
                  }}
                >
                  {node.dateLabel}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}