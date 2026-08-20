// src/components/admin/accounts/AccountPreviewPanel.tsx
//
// Right-column preview shown when a tree row is selected (not navigated
// to) on AccountsListPage. Fetches balance for ONLY the currently
// selected account via useAccountBalance — the one place balance is
// fetched at all on the List page, and only ever for one account at a
// time, per the design doc's rule that balance is never fetched per
// tree row.

import { useTranslation } from "react-i18next";
import { Eye, Pencil, UserX, UserCheck, Trash2 } from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge";
import { AccountTypeBadge } from "../../common/AccountTypeBadge";
import { AccountBalanceCard } from "./AccountBalanceCard";
import { useAccountBalance } from "../../../hooks/useAccounts.crud";

export interface AccountPreviewData {
  id: string;
  code: string;
  name: string;
  accountType: string;
  isActive: boolean;
  parentAccountName: string | null;
}

export interface AccountPreviewPanelProps {
  account: AccountPreviewData | null;
  onOpenDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onSetActive: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  canManageAccess: boolean;
}

export function AccountPreviewPanel({
  account,
  onOpenDetails,
  onEdit,
  onSetActive,
  onDelete,
  canManageAccess
}: AccountPreviewPanelProps) {
  const { t } = useTranslation();
  const { data: balance, isLoading: isBalanceLoading } = useAccountBalance(
    account?.id,
    !!account,
  );

  if (!account) {
    return (
      <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6 text-center">
        <p className="text-sm text-[var(--ink-tertiary)]">{t("accounts.preview.emptySelection")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--ink-primary)]">{account.name}</h2>
          <span className="font-mono text-sm text-[var(--ink-tertiary)]">{account.code}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <AccountTypeBadge accountType={account.accountType} />
          <StatusBadge
            status={account.isActive ? "active" : "inactive"}
            label={account.isActive ? t("users.status.active") : t("users.status.inactive")}
          />
        </div>
        {account.parentAccountName && (
          <p className="mt-2 text-xs text-[var(--ink-tertiary)]">
            {t("accounts.details.parent")}: {account.parentAccountName}
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("accounts.preview.balanceSummary")}
        </h3>
        <AccountBalanceCard
          totalDebit={balance?.totalDebit ?? 0}
          totalCredit={balance?.totalCredit ?? 0}
          balance={balance?.balance ?? 0}
          isLoading={isBalanceLoading}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-4">
        <button
          type="button"
          onClick={() => onOpenDetails(account.id)}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--signal)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
        >
          <Eye size={14} />
          {t("accounts.preview.openDetails")}
        </button>
        {
          canManageAccess && (
            <>
              <button
                type="button"
                onClick={() => onEdit(account.id)}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
              >
                <Pencil size={14} />
                {t("accounts.actions.edit")}
              </button>
              {account.isActive ? (
                <button
                  type="button"
                  onClick={() => onSetActive(account.id, false)}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
                >
                  <UserX size={14} />
                  {t("accounts.actions.deactivate")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetActive(account.id, true)}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
                >
                  <UserCheck size={14} />
                  {t("accounts.actions.activate")}
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(account.id)}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--sunken)]"
              >
                <Trash2 size={14} />
                {t("accounts.actions.delete")}
              </button>
            </>
          )
        }

      </div>
    </div>
  );
}
