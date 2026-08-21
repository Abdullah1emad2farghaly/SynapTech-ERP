// Intended path: src/pages/admin/company/CompanySettingsPage.tsx
//
// ASSUMPTION: ConfirmationDialog's prop shape is assumed to match
// components/common/ConfirmationDialog.tsx as built for Users/Departments/
// Branches/Employees/Leave Requests (open, onOpenChange, title, description,
// confirmLabel, cancelLabel, tone: 'neutral' | 'destructive', onConfirm).
// ASSUMPTION: ErrorState's prop shape is assumed to be
// (title, description, onRetry) — new in the project as of the Leave
// Requests follow-up. Verify both against the real components before wiring in.
//
// Reuses ConfirmationDialog for the discard-changes prompt rather than a
// bespoke UnsavedChangesDialog — no new dialog component needed.

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { useCompany, useUpdateCompany } from '../../../hooks/useCompany';
import { companySchema, type CompanyFormValues } from '../../../schemas/company.schema';
import type { CompanyResponse, UpdateCompanyRequest } from '../../../types/company.types';

import { CompanyPageHeader } from '../../../components/admin/company/CompanyPageHeader';
import { CompanyProfileForm } from '../../../components/admin/company/CompanyProfileForm';
import { CompanyStatusCard } from '../../../components/admin/company/CompanyStatusCard';
import { CompanySystemInfoCard } from '../../../components/admin/company/CompanySystemInfoCard';
import { CompanySettingsSkeleton } from '../../../components/admin/company/CompanySettingsSkeleton';
import { ErrorState } from '../../../components/common/ErrorState';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';

function toFormValues(company: CompanyResponse): CompanyFormValues {
  return {
    name: company.name ?? '',
    legalName: company.legalName ?? '',
    taxNumber: company.taxNumber ?? '',
    currency: company.currency ?? '',
    country: company.country ?? '',
    isActive: company.isActive,
  };
}

function toUpdatePayload(values: CompanyFormValues): UpdateCompanyRequest {
  const clean = (value: string) => (value.trim() === '' ? null : value.trim());
  return {
    name: clean(values.name),
    legalName: clean(values.legalName),
    taxNumber: clean(values.taxNumber),
    currency: clean(values.currency),
    country: clean(values.country),
    isActive: values.isActive,
  };
}

export function CompanySettingsPage() {
  const { t } = useTranslation();
  const { data: company, isLoading, isError, refetch } = useCompany();
  const updateCompany = useUpdateCompany();
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      legalName: '',
      taxNumber: '',
      currency: '',
      country: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (company) {
      reset(toFormValues(company));
    }
  }, [company, reset]);

  const isActive = watch('isActive');

  const onSubmit = handleSubmit((values) => {
    updateCompany.mutate(toUpdatePayload(values), {
      onSuccess: (data) => {
        reset(toFormValues(data));
        toast.success(t('company.toast.saveSuccess'));
      },
      onError: () => {
        toast.error(t('company.toast.saveError'));
      },
    });
  });


  if (isLoading) {
    return (
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <CompanySettingsSkeleton />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <CompanyPageHeader />
        <ErrorState
          title={t('company.error.loadTitle')}
          description={t('company.error.loadDescription')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <CompanyPageHeader />

      <form onSubmit={onSubmit} noValidate>
        <div className="grid lg:grid-cols-2 gap-3">
          <CompanyProfileForm register={register} errors={errors} disabled={updateCompany.isPending} />

          <div className='flex flex-col gap-3'>
            <CompanyStatusCard
              isActive={isActive}
              onChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
              disabled={updateCompany.isPending}
            />

            <CompanySystemInfoCard id={company.id} />
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={!isDirty || updateCompany.isPending}
                className="w-full rounded-[10px] bg-[var(--signal)] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-[160ms] hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {updateCompany.isPending ? t('company.actions.saving') : t('company.actions.save')}
              </button>
            </div>
          </div>
        </div>


      </form>

      {/* <ConfirmationDialog
        open={discardDialogOpen}
        // onOpenChange={setDiscardDialogOpen}
        title={t('company.discardDialog.title')}
        // description={t('company.discardDialog.description')}
        confirmLabel={t('company.discardDialog.confirm')}
        cancelLabel={t('company.discardDialog.cancel')}
        tone="destructive"
        onConfirm={handleDiscardConfirm}
      /> */}
    </div>
  );
}
