// Intended path: src/components/admin/company/CompanySystemInfoCard.tsx
//
// Read-only. Copy-to-clipboard is a UI convenience only — it never touches
// the API contract or mutates the id.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { handleErrors } from '@/utils/HandleErrors';

interface CompanySystemInfoCardProps {
  id: string;
}

export function CompanySystemInfoCard({ id }: CompanySystemInfoCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success(t('company.systemInfo.copied'));
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      if(axios.isAxiosError(error)){
        handleErrors(error.response?.data.errors)
      }
    }
  };

  return (
    <section className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{t('company.systemInfo.title')}</h2>

      <div className="mt-4">
        <span className="block text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t('company.systemInfo.companyId')}
        </span>
        <div className="mt-1.5 flex items-center gap-2">
          <code className="truncate rounded-md bg-[var(--sunken)] px-2.5 py-1.5 font-mono text-xs text-[var(--ink-secondary)]">
            {id}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={t('systemInfo.copy')}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[var(--ink-tertiary)] transition-colors duration-[160ms] hover:bg-[var(--sunken)] hover:text-[var(--ink-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)]"
          >
            {copied ? (
              <Check size={14} className="text-[var(--success)]" aria-hidden="true" />
            ) : (
              <Copy size={14} aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-[var(--ink-tertiary)]">{t('company.systemInfo.readOnly')}</p>
      </div>
    </section>
  );
}
