// src/components/admin/company/CompanyOverview.tsx
import { motion } from 'framer-motion';
import {
  Building2,
  FileBadge,
  Landmark,
  MapPinned,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Company } from '../../../types/company.types';

interface CompanyOverviewProps {
  company: Company;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function CompanyOverview({ company }: CompanyOverviewProps) {
  const { t } = useTranslation();

  const cards = [
    { icon: Building2, label: t('company.fields.name'), value: company.name },
    {
      icon: Landmark,
      label: t('company.fields.legalName'),
      value: company.legalName,
    },
    {
      icon: FileBadge,
      label: t('company.fields.taxNumber'),
      value: company.taxNumber,
    },
    {
      icon: MapPinned,
      label: t('company.fields.country'),
      value: company.country,
    },
    {
      icon: Wallet,
      label: t('company.fields.currency'),
      value: company.currency,
    },
    {
      icon: ShieldCheck,
      label: t('company.fields.status'),
      value: company.isActive
        ? t('company.status.active')
        : t('company.status.inactive'),
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {cards.map((card) => (
        <motion.div
          key={card.label}
          variants={item}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
            <card.icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {card.label}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {card.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
