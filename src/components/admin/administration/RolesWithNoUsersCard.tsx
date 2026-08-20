// Intended path: src/components/admin/administration/RolesWithNoUsersCard.tsx
// The mirror image of UsersWithoutRolesCard — roles defined but never
// assigned to anyone, cross-referenced the same way (role name membership
// across all users' roles[] arrays).

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { RoleResponse } from '@/types/roles.types';

interface Props {
  data: RoleResponse[] | undefined;
  isLoading: boolean;
}

export function RolesWithNoUsersCard({ data, isLoading }: Props) {
  const { t } = useTranslation();
  const hasIssue = (data?.length ?? 0) > 0;

  return (
    <div
      className={[
        'bg-panel border rounded-lg p-4 shadow-elevation-1',
        hasIssue ? 'border-warning/40' : 'border-hairline',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldOff size={16} className={hasIssue ? 'text-warning' : 'text-ink-tertiary'} />
        <h3 className="text-sm font-medium text-ink-primary">{t('administration.overview.rolesWithNoUsers.title')}</h3>
        {hasIssue && (
          <span className="ms-auto text-xs font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning">
            {t('administration.overview.rolesWithNoUsers.badge', { count: data!.length })}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !hasIssue ? (
        <p className="text-sm text-ink-tertiary">{t('administration.overview.rolesWithNoUsers.emptyDescription')}</p>
      ) : (
        <ul className="space-y-2">
          {(data ?? []).map(role => (
            <li key={role.id}>
              <Link
                to={`roles/${role.id}`}
                className="flex items-center justify-between py-1 px-2 -mx-2 rounded-md hover:bg-sunken/40 transition-colors"
              >
                <span className="text-sm text-ink-primary truncate">{role.name}</span>
                <span className="text-xs text-ink-tertiary truncate ms-2">{role.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
