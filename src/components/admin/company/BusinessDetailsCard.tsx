// src/components/admin/company/BusinessDetailsCard.tsx
import { FileBadge, Globe, ShieldCheck, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionTitle } from '../../common/SectionTitle';
import { InfoRow } from '../../common/InfoRow';
import type { Company } from '../../../types/company.types';

interface BusinessDetailsCardProps {
  company: Company;
}

export function BusinessDetailsCard({ company }: BusinessDetailsCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <SectionTitle
        title={t('company.sections.business.title')}
        description={t('company.sections.business.description')}
      />
      <div className="grid grid-cols-1 gap-x-6 divide-y divide-[var(--color-border)] sm:grid-cols-2 sm:divide-y-0">
        <InfoRow
          icon={FileBadge}
          label={t('company.fields.taxNumber')}
          value={company.taxNumber}
        />
        <InfoRow
          icon={Globe}
          label={t('company.fields.country')}
          value={company.country}
        />
        <InfoRow
          icon={Wallet}
          label={t('company.fields.currency')}
          value={company.currency}
        />
        <InfoRow
          icon={ShieldCheck}
          label={t('company.fields.status')}
          value={
            company.isActive
              ? t('company.status.active')
              : t('company.status.inactive')
          }
        />
      </div>
    </div>
  );
}
