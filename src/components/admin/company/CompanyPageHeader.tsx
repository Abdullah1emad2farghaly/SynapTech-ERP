// Intended path: src/components/admin/company/CompanyPageHeader.tsx
//
// ASSUMPTION: Breadcrumb accepts an `items: { label: string; href?: string }[]`
// prop, matching the shape used elsewhere in the project. Verify against the
// real components/common/Breadcrumb.tsx before wiring in.

import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '../../common/Breadcrumb';

export function CompanyPageHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-8 space-y-3">
      <Breadcrumb
        items={[
          { label: t('company.breadcrumb.settings'), to: '/settings' },
          { label: t('company.breadcrumb.company') },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink-primary)]">
          {t('company.title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">{t('company.description')}</p>
      </div>
    </div>
  );
}
