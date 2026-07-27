// src/components/admin/company/CompanyInfoCard.tsx
import { Building2, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionTitle } from '../../common/SectionTitle';
import { InfoRow } from '../../common/InfoRow';
import type { Company } from '../../../types/company.types';

interface CompanyInfoCardProps {
  company: Company;
}

export function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <SectionTitle
        title={t('company.sections.info.title')}
        description={t('company.sections.info.description')}
      />
      <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="sm:pe-6">
          <InfoRow
            icon={Building2}
            label={t('company.fields.name')}
            value={company.name}
          />
        </div>
        <div className="sm:ps-6">
          <InfoRow
            icon={Landmark}
            label={t('company.fields.legalName')}
            value={company.legalName}
          />
        </div>
      </div>
    </div>
  );
}
