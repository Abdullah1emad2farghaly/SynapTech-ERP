// Project path: src/components/admin/accounting/AccountingSettingsForm.tsx

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import { SearchableSelect } from "../../common/SearchableSelect";
import { useAccounts } from "../../../hooks/useAccounts";

import {
  accountingSettingsSchema,
  type AccountingSettingsFormValues,
} from "../../../schemas/accountingSettings.schema";

import type { AccountingSettingsResponse } from "../../../types/accounting-settings.types";

interface AccountingSettingsFormProps {
  initialValues: AccountingSettingsResponse;
  onSubmit: (values: AccountingSettingsFormValues) => void;
  isSaving: boolean;
}

const FIELD_ORDER: Array<{
  name: keyof AccountingSettingsFormValues;
  labelKey: string;
}> = [
  {
    name: "inventoryAccountId",
    labelKey: "accountingSettings.fields.inventoryAccount",
  },
  {
    name: "accountsPayableAccountId",
    labelKey: "accountingSettings.fields.accountsPayableAccount",
  },
  {
    name: "accountsReceivableAccountId",
    labelKey: "accountingSettings.fields.accountsReceivableAccount",
  },
  {
    name: "revenueAccountId",
    labelKey: "accountingSettings.fields.revenueAccount",
  },
  {
    name: "costOfGoodsSoldAccountId",
    labelKey: "accountingSettings.fields.costOfGoodsSoldAccount",
  },
  {
    name: "cashAccountId",
    labelKey: "accountingSettings.fields.cashAccount",
  },
];

export function AccountingSettingsForm({
  initialValues,
  onSubmit,
  isSaving,
}: AccountingSettingsFormProps) {
  const { t } = useTranslation();

  const {
    data: accounts,
    isLoading: isLoadingAccounts,
  } = useAccounts();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<AccountingSettingsFormValues>({
    resolver: zodResolver(accountingSettingsSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const accountOptions =
    accounts?.map((account) => ({
      value: String(account.id),
      label: account.code
        ? `${account.code} — ${account.name ?? ""}`
        : account.name ?? String(account.id),
    })) ?? [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[10px] border border-[var(--hairline)] bg-[var(--panel)] p-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {FIELD_ORDER.map((fieldConfig) => (
          <div
            key={fieldConfig.name}
            className="flex flex-col gap-1.5"
          >
            <label
              htmlFor={String(fieldConfig.name)}
              className="text-sm text-[var(--ink-secondary)]"
            >
              {t(fieldConfig.labelKey)}
            </label>

            <Controller
              name={fieldConfig.name}
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <div id={String(fieldConfig.name)}>
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={field.onChange}
                      options={accountOptions}
                      searchPlaceholder={t(
                        "accountingSettings.searchAccount",
                      )}
                      placeholder={t(
                        "accountingSettings.selectAccount",
                      )}
                      emptyResultsLabel={t(
                        "accountingSettings.noAccountsFound",
                      )}
                      disabled={isLoadingAccounts || isSaving}
                    />
                  </div>

                  {fieldState.error?.message && (
                    <p className="text-xs text-[var(--error)]">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => reset(initialValues)}
          disabled={!isDirty || isSaving}
          className="rounded-[6px] px-4 py-2 text-sm text-[var(--ink-secondary)] transition-colors hover:bg-[var(--sunken)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("common.reset")}
        </button>

        <button
          type="submit"
          disabled={!isDirty || isSaving || isLoadingAccounts}
          className="rounded-[6px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving
            ? t("common.saving")
            : t("common.saveChanges")}
        </button>
      </div>
    </form>
  );
}
