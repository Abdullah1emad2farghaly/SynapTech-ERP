// Intended path: src/components/admin/leaveRequests/LeaveRequestActionMenu.tsx

import { CalendarX2, Check, Eye, MoreVertical, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getAvailableLeaveRequestActions } from "../../../utils/leaveRequestActions";
import type { LeaveRequestResponse } from "../../../services/api/leaveRequests.api";
import { hasAnyPermission } from "@/utils/permissions";

interface LeaveRequestActionMenuProps {
  request: LeaveRequestResponse;
  onView: (request: LeaveRequestResponse) => void;
  onApprove: (request: LeaveRequestResponse) => void;
  onReject: (request: LeaveRequestResponse) => void;
  onCancel: (request: LeaveRequestResponse) => void;
}

export function LeaveRequestActionMenu({
  request,
  onView,
  onApprove,
  onReject,
  onCancel,
}: LeaveRequestActionMenuProps) {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const canSubmitAccess = hasAnyPermission([
    "hr.leaves.request",
  ]);

  const canApproveAccess = hasAnyPermission([
    "hr.leaves.approve",
  ]);

  const actions = getAvailableLeaveRequestActions(
    request.status,
  );

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [isOpen]);


  let items: Array<{
    key: string;
    labelKey: string;
    icon: typeof Eye;
    onSelect: () => void;
    tone?: "default" | "destructive";
  }> = [];


  if (actions.includes("view")) {
    items.push({
      key: "view",
      labelKey: "common.actions.viewDetails",
      icon: Eye,
      onSelect: () => onView(request),
    });
  }


  /**
   * Approve / Reject
   * Requires hr.leaves.approve
   */
  if (
    canApproveAccess &&
    actions.includes("approve")
  ) {
    items.push({
      key: "approve",
      labelKey: "leaveRequests.actions.approve",
      icon: Check,
      onSelect: () => onApprove(request),
    });
  }


  if (
    canApproveAccess &&
    actions.includes("reject")
  ) {
    items.push({
      key: "reject",
      labelKey: "leaveRequests.actions.reject",
      icon: X,
      onSelect: () => onReject(request),
      tone: "destructive",
    });
  }


  /**
   * Cancel own request
   * Requires hr.leaves.request
   */
  if (
    canSubmitAccess &&
    actions.includes("cancel")
  ) {
    items.push({
      key: "cancel",
      labelKey: "leaveRequests.actions.cancel",
      icon: CalendarX2,
      onSelect: () => onCancel(request),
      tone: "destructive",
    });
  }


  /**
   * After final states only show details.
   */
  if (
    request.status === "Approved" ||
    request.status === "Rejected" ||
    request.status === "Cancelled"
  ) {
    items = [
      {
        key: "view",
        labelKey: "common.actions.viewDetails",
        icon: Eye,
        onSelect: () => onView(request),
      },
    ];
  }


  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((open) => !open);
        }}
        aria-label={t("common.actions.moreActions")}
        className="p-1.5 rounded-md hover:opacity-80"
        style={{
          color: "var(--ink-secondary)",
        }}
      >
        <MoreVertical size={16} />
      </button>


      {isOpen && (
        <div
          ref={menuRef}
          className="absolute end-0 z-20 mt-1 w-max min-w-[10rem] overflow-hidden rounded-md py-1 shadow-lg"
          style={{
            backgroundColor: "var(--panel)",
            border: "1px solid var(--hairline)",
          }}
          role="menu"
        >
          {items.map((item) => {
            const Icon = item.icon;

            const isDestructive =
              item.tone === "destructive";

            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  item.onSelect();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm transition-colors duration-150 hover:bg-[var(--sunken)]"
                style={{
                  color: isDestructive
                    ? "var(--error)"
                    : "var(--ink-primary)",
                }}
              >
                <Icon
                  size={14}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                <span className="whitespace-nowrap">
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}