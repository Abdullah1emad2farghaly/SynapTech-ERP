// src/components/admin/accounts/AccountDrawer.tsx
//
// Create Account as a Drawer, opened from AccountsListPage — replacing
// the standalone /accounting/accounts/new page per updated direction.
// This reverses the module design doc's "pages, not drawers" call for
// Create specifically; Edit still lives inline on AccountDetailsPage
// (unchanged) and there's still no Move/change-type capability, since
// that's an API constraint, not a UI pattern choice.
//
// Account Type is now a closed select from the confirmed fixed list in
// constants/accountTypes.ts (Assests, Expensis, Invistments) — updated
// from an earlier free-text + datalist input, back when accountType's
// value set wasn't confirmed yet.
//
// Parent Account uses the existing TreeSelect, reused as-is. Because
// there is no Move capability afterward (PUT's payload can't change
// parentAccountId), this field gets a more prominent inline warning than
// Departments' equivalent field did — getting this wrong here isn't
// fixable later under the current API.

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import { TreeSelect, type TreeSelectNode } from "../../common/TreeSelect";
import { ACCOUNT_TYPES } from "../../../constants/accountTypes";
import axios from "axios";
import { handleErrors } from "@/utils/HandleErrors";
import Optional from "@/components/common/Optional";

export interface AccountFormValues {
  code: string;
  name: string;
  accountType: string;
  parentAccountId: string | null;
}

export interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Full flat account list, used to build the parent tree-select and the type datalist. */
  allAccounts: { id: string; code: string; name: string; accountType: string; parentAccountId: string | null }[];
  onSubmit: (values: AccountFormValues) => Promise<void>;
  serverError?: { field?: "code"; messageKey: string } | null;
}

const EMPTY_VALUES: AccountFormValues = {
  code: "",
  name: "",
  accountType: "",
  parentAccountId: null,
};

export function AccountDrawer({
  open,
  onClose,
  allAccounts,
  onSubmit,
  serverError,
}: AccountDrawerProps) {
  const { t } = useTranslation();

  const [values, setValues] = useState<AccountFormValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState<{ code?: boolean; name?: boolean; accountType?: boolean }>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(EMPTY_VALUES);
      setTouched({});
    }
  }, [open]);

  const treeNodes: TreeSelectNode[] = useMemo(
    () =>
      allAccounts.map((a) => ({
        id: a.id,
        label: `${a.code} — ${a.name}`,
        parentId: a.parentAccountId,
      })),
    [allAccounts],
  );

  const isValid =
    values.code.trim().length > 0 &&
    values.name.trim().length > 0 &&
    values.accountType.trim().length > 0;

  function handleClose() {
    setValues(EMPTY_VALUES);
    setTouched({});
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ code: true, name: true, accountType: true });
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        code: values.code.trim(),
        name: values.name.trim(),
        accountType: values.accountType.trim(),
        parentAccountId: values.parentAccountId,
      });
      handleClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleErrors(error.response?.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onClose={handleClose} title={t("accounts.create.title")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 pb-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
              {t("accounts.create.fields.code")}
            </label>
            <input
              value={values.code}
              onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
              onBlur={() => setTouched((tt) => ({ ...tt, code: true }))}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 font-mono text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />
            {touched.code && values.code.trim().length === 0 && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("accounts.create.errors.required")}</p>
            )}
            {serverError?.field === "code" && (
              <p className="mt-1 text-xs text-[var(--error)]">{t(serverError.messageKey)}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
              {t("accounts.create.fields.name")}
            </label>
            <input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              onBlur={() => setTouched((tt) => ({ ...tt, name: true }))}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />
            {touched.name && values.name.trim().length === 0 && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("accounts.create.errors.required")}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
              {t("accounts.create.fields.type")}
            </label>
            <select
              value={values.accountType}
              onChange={(e) => setValues((v) => ({ ...v, accountType: e.target.value }))}
              onBlur={() => setTouched((tt) => ({ ...tt, accountType: true }))}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            >
              <option value="">—</option>
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {touched.accountType && values.accountType.trim().length === 0 && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("accounts.create.errors.required")}</p>
            )}
            <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
              {t("accounts.details.typeCannotChange")}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-secondary)]">
              {t("accounts.create.fields.parentAccount")}
              <Optional/>
            </label>
            <TreeSelect
              nodes={treeNodes}
              value={values.parentAccountId}
              onChange={(value) => setValues((v) => ({ ...v, parentAccountId: value }))}
              searchPlaceholder={t("accounts.create.parentSearchPlaceholder")}
              noneLabel={t("accounts.details.noParent")}
            />
            <p className="mt-2 rounded-[10px] bg-[var(--warning)]/10 px-3 py-2 text-xs font-medium text-[var(--warning)]">
              {t("accounts.create.parentWarning")}
            </p>
          </div>
        </div>

        <div className="mt-2 flex absolute bottom-5 right-0 pr-5 w-full justify-end gap-2 border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t("users.actions.cancel")}
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("accounts.create.submitting") : t("accounts.list.createAccount")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
