// src/pages/admin/company/CompanyPage.tsx
import { useState } from 'react';
import { useCompany } from '../../../hooks/useCompany';
import { CompanyHeader } from '../../../components/admin/company/CompanyHeader';
import { CompanyOverview } from '../../../components/admin/company/CompanyOverview';
import { CompanyInfoCard } from '../../../components/admin/company/CompanyInfoCard';
import { BusinessDetailsCard } from '../../../components/admin/company/BusinessDetailsCard';
import { StatusCard } from '../../../components/admin/company/StatusCard';
import { EditCompanyDrawer } from '../../../components/admin/company/EditCompanyDrawer';
import { CompanySkeleton } from '../../../components/admin/company/CompanySkeleton';
import { CompanyEmptyState } from '../../../components/admin/company/CompanyEmptyState';
import { CompanyErrorState } from '../../../components/admin/company/CompanyErrorState';

export default function CompanyPage() {
  const { data: company, isLoading, isError, isRefetching, refetch } = useCompany();
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <CompanySkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <CompanyErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <CompanyEmptyState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <CompanyHeader
        company={company}
        onEdit={() => setIsEditOpen(true)}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      <CompanyOverview company={company} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CompanyInfoCard company={company} />
          <BusinessDetailsCard company={company} />
        </div>
        <StatusCard isActive={company.isActive} />
      </div>

      <EditCompanyDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        company={company}
      />
    </div>
  );
}
