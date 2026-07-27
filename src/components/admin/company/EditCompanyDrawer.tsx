// src/components/admin/company/EditCompanyDrawer.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { Drawer } from '../../common/Drawer'; // ASSUMPTION: existing shared component, prop shape unverified (see handoff Section 12)
import {
  companyUpdateSchema,
  type CompanyUpdateFormValues,
} from '../../../schemas/company.schema';
import { useUpdateCompany } from '../../../hooks/useCompany';
import type { Company } from '../../../types/company.types';

interface EditCompanyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
}

export function EditCompanyDrawer({
  isOpen,
  onClose,
  company,
}: EditCompanyDrawerProps) {
  const { t } = useTranslation();
  const { mutate, isPending } = useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyUpdateFormValues>({
    resolver: zodResolver(companyUpdateSchema),
    defaultValues: {
      name: company.name,
      legalName: company.legalName,
      taxNumber: company.taxNumber,
      currency: company.currency,
      country: company.country,
      isActive: company.isActive,
    },
  });

  useEffect(() => {
    reset({
      name: company.name,
      legalName: company.legalName,
      taxNumber: company.taxNumber,
      currency: company.currency,
      country: company.country,
      isActive: company.isActive,
    });
  }, [company, reset]);

  const onSubmit = (values: CompanyUpdateFormValues) => {
    mutate(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={t('company.edit.title')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-1 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
              {t('company.fields.name')}
            </label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {t(errors.name.message as string)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
              {t('company.fields.legalName')}
            </label>
            <input
              {...register('legalName')}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            {errors.legalName && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {t(errors.legalName.message as string)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
              {t('company.fields.taxNumber')}
            </label>
            <input
              {...register('taxNumber')}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            {errors.taxNumber && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {t(errors.taxNumber.message as string)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
                {t('company.fields.currency')}
              </label>
              <input
                {...register('currency')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              {errors.currency && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">
                  {t(errors.currency.message as string)}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
                {t('company.fields.country')}
              </label>
              <input
                {...register('country')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              {errors.country && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">
                  {t(errors.country.message as string)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3">
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-[var(--color-text-primary)]"
            >
              {t('company.fields.status')}
            </label>
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] px-1 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
          >
            {t('company.edit.cancel')}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isPending ? t('company.edit.saving') : t('company.edit.save')}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
