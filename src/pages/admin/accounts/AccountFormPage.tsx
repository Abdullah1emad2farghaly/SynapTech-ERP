// src/pages/admin/accounts/AccountFormPage.tsx
//
// Create Account, as a page — not a drawer, per the module's explicit
// brief instruction. Route: /accounting/accounts/new.
//
// This is Create-only. Edit lives inline on AccountDetailsPage instead
// of a second route here (see that page's comments for why) — so this
// file doesn't need a "mode" prop the way DepartmentDrawer/BranchDrawer
// did for their combined Create+Edit.
//
// Account Type is a free-text input with a datalist of distinct existing
// values (not a closed select) — accountType has no confirmed enum, so
// locking the field to only-already-used values would make it impossible
// to ever introduce a genuinely new type through the UI.
//
// Parent Account uses the existing TreeSelect, reused as-is. Because
// there is no Move capability afterward (PUT's payload can't change
// parentAccountId), this field gets a more prominent inline warning than
// Departments' equivalent field did — getting this wrong here isn't
// fixable later under the current API.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { TreeSelect, type TreeSelectNode } from "../../../components/common/TreeSelect";
import { useAccountsList, useCreateAccount } from "../../../hooks/useAccounts.crud";
import axios, { isAxiosError } from "axios";

interface FormState {
  code: string;
  name: string;
  accountType: string;
  parentAccountId: string | null;
}

const EMPTY_FORM: FormState = { code: "", name: "", accountType: "", parentAccountId: null };

export function AccountFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: accounts = [] } = useAccountsList();
  const createMutation = useCreateAccount();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<{ code?: boolean; name?: boolean; accountType?: boolean }>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const treeNodes: TreeSelectNode[] = useMemo(
    () => accounts.map((a) => ({ id: a.id, label: `${a.code} — ${a.name}`, parentId: a.parentAccountId })),
    [accounts],
  );

  const distinctTypes = useMemo(() => {
    const set = new Set<string>();
    accounts.forEach((a) => set.add(a.accountType));
    return Array.from(set).sort();
  }, [accounts]);

  const isValid =
    form.code.trim().length > 0 && form.name.trim().length > 0 && form.accountType.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ code: true, name: true, accountType: true });
    if (!isValid) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      const created = await createMutation.mutateAsync({
        code: form.code.trim(),
        name: form.name.trim(),
        accountType: form.accountType.trim(),
        parentAccountId: form.parentAccountId,
      });
      navigate(`/accounting/accounts/${created.id}`);
    } catch(error) {
      
      setServerError(t("common.errors.actionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4  p-6">
      <button
        type="button"
        onClick={() => navigate("/accounting/accounts")}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("accounts.details.back")}
      </button>

      <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6">
        <h1 className="mb-5 text-lg font-semibold text-[var(--ink-primary)]">
          {t("accounts.create.title")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("accounts.create.fields.code")}
            </label>
            <input
              autoFocus
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              onBlur={() => setTouched((tt) => ({ ...tt, code: true }))}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 font-mono text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />
            {touched.code && form.code.trim().length === 0 && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("accounts.create.errors.required")}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("accounts.create.fields.name")}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onBlur={() => setTouched((tt) => ({ ...tt, name: true }))}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />
            {touched.name && form.name.trim().length === 0 && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("accounts.create.errors.required")}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("accounts.create.fields.type")}
            </label>
            <input
              list="account-type-options"
              value={form.accountType}
              onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value }))}
              onBlur={() => setTouched((tt) => ({ ...tt, accountType: true }))}
              className="w-full rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--ink-primary)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--synapse)]/30"
            />
            <datalist id="account-type-options">
              {distinctTypes.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
            {touched.accountType && form.accountType.trim().length === 0 && (
              <p className="mt-1 text-xs text-[var(--error)]">{t("accounts.create.errors.required")}</p>
            )}
            <p className="mt-1 text-xs text-[var(--ink-tertiary)]">
              {t("accounts.details.typeCannotChange")}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-primary)]">
              {t("accounts.create.fields.parentAccount")}
            </label>
            <TreeSelect
              nodes={treeNodes}
              value={form.parentAccountId}
              onChange={(value) => setForm((f) => ({ ...f, parentAccountId: value }))}
              searchPlaceholder={t("accounts.create.parentSearchPlaceholder")}
              noneLabel={t("accounts.details.noParent")}
            />
            <p className="mt-2 rounded-[10px] bg-[var(--warning)]/10 px-3 py-2 text-xs font-medium text-[var(--warning)]">
              {t("accounts.create.parentWarning")}
            </p>
          </div>

          {serverError && <p className="text-sm text-[var(--error)]">{serverError}</p>}

          <div className="mt-2 flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
            <button
              type="button"
              onClick={() => navigate("/accounting/accounts")}
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
      </div>
    </div>
  );
}
