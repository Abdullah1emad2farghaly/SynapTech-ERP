// Project path: src/components/admin/purchase-orders/PurchaseOrderStatusTracker.tsx
//
// Per spec §14: no per-transition dates exist in the API (only orderDate and
// expectedDate), so only the Draft node shows a real date. Cancelled orders
// render the full spine muted with a distinct branch node rather than
// guessing which step they were cancelled from — the API doesn't record that.

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FileEdit, Send, CheckCircle2, PackageOpen, PackageCheck, XCircle } from "lucide-react";
import {
  getNormalFlowSteps,
  getStatusStepIndex,
  getCompletionPercent,
} from "../../../utils/purchaseOrderWorkflow";
import type { PurchaseOrderResponse } from "../../../types/purchaseOrders.types";

const STEP_ICONS = {
  Draft: FileEdit,
  Submitted: Send,
  Approved: CheckCircle2,
  PartiallyReceived: PackageOpen,
  Received: PackageCheck,
} as const;

interface PurchaseOrderStatusTrackerProps {
  order: PurchaseOrderResponse;
}

export function PurchaseOrderStatusTracker({ order }: PurchaseOrderStatusTrackerProps) {
  const { t } = useTranslation();
  const steps = getNormalFlowSteps();
  const isCancelled = order.status === "Cancelled";
  const currentIndex = isCancelled ? -1 : getStatusStepIndex(order.status);
  const completionPercent = getCompletionPercent(order.status);

  const nodeState = (index: number): "completed" | "current" | "upcoming" => {
    if (isCancelled) return "upcoming"; // whole spine renders muted when cancelled
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="rounded-lg border border-[--hairline] bg-[--panel] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[--ink-primary]">
          {t("purchaseOrders.tracker.title")}
        </h3>
        {!isCancelled && (
          <span className="text-xs text-[--ink-tertiary]">
            {t("purchaseOrders.tracker.completion", { percent: completionPercent })}
          </span>
        )}
      </div>

      {/* Desktop/laptop: horizontal. Mobile: vertical — same nodes, different flex direction. */}
      <div className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
        {steps.map((step, index) => {
          const state = nodeState(index);
          const Icon = STEP_ICONS[step];
          const isLast = index === steps.length - 1;
          const date = step === "Draft" ? order.orderDate : null;

          return (
            <div
              key={step}
              className="group relative flex flex-1 flex-row items-start gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
            >
              <div className="flex flex-col items-center sm:w-full sm:flex-row">
                <motion.div
                  initial={false}
                  animate={state === "current" ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={
                    state === "current"
                      ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                  className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                    state === "completed"
                      ? "border-[--success] bg-[--success] text-white"
                      : state === "current"
                      ? "border-[--signal] bg-[--signal] text-white"
                      : "border-[--hairline] bg-[--sunken] text-[--ink-tertiary]"
                  }`}
                  title={
                    date
                      ? `${t(`purchaseOrders.status.${step}`)} — ${new Date(date).toLocaleDateString()}`
                      : t("purchaseOrders.tracker.noTimestamp")
                  }
                >
                  {state === "completed" ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </motion.div>

                {/* connecting line to next node */}
                {!isLast && (
                  <div className="ms-4 h-8 w-0.5 self-stretch sm:ms-0 sm:mt-4 sm:h-0.5 sm:w-full sm:self-auto">
                    <div
                      className={`h-full w-full rounded-full ${
                        state === "completed" && !isCancelled
                          ? "bg-[--success]"
                          : "border-t-2 border-dashed border-[--hairline] bg-transparent sm:border-t-0 sm:border-s-2"
                      }`}
                    />
                  </div>
                )}
              </div>

              <div className="pb-4 sm:pb-0">
                <p
                  className={`text-xs font-medium ${
                    state === "upcoming" ? "text-[--ink-tertiary]" : "text-[--ink-primary]"
                  }`}
                >
                  {t(`purchaseOrders.status.${step}`)}
                </p>
                <p className="text-[11px] text-[--ink-tertiary]">
                  {date ? new Date(date).toLocaleDateString() : t("purchaseOrders.tracker.noTimestamp")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-[--error]/30 bg-[--error]/5 px-3 py-2">
          <XCircle size={16} className="shrink-0 text-[--error]" />
          <p className="text-xs text-[--error]">{t("purchaseOrders.tracker.cancelledNote")}</p>
        </div>
      )}

      {order.expectedDate && !isCancelled && order.status !== "Received" && (
        <p className="mt-3 text-xs text-[--ink-tertiary]">
          {t("purchaseOrders.tracker.expectedDate")}: {new Date(order.expectedDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
