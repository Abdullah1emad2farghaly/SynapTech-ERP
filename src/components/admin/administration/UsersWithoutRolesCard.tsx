

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Skeleton } from '../../common/Skeleton';
import type { User } from '@/types/users.types';

interface Props {
  data: User[] | undefined;
  totalCount: number | undefined;
  isLoading: boolean;
}

export function UsersWithoutRolesCard({ data, totalCount, isLoading }: Props) {
  const { t } = useTranslation();
  const hasIssue = (totalCount ?? 0) > 0;

  return (
    <div
      className={[
        'bg-panel border rounded-lg p-4 shadow-elevation-1',
        hasIssue ? 'border-warning/40' : 'border-hairline',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={16} className={hasIssue ? 'text-warning' : 'text-ink-tertiary'} />
        <h3 className="text-sm font-medium text-ink-primary">{t('administration.overview.usersWithoutRoles.title')}</h3>
        {hasIssue && (
          <span className="ms-auto text-xs font-medium px-2 py-0.5 rounded-full bg-warning/15 text-warning">
            {t('administration.overview.usersWithoutRoles.badge', { count: totalCount })}
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
        <p className="text-sm text-ink-tertiary">{t('administration.overview.usersWithoutRoles.emptyDescription')}</p>
      ) : (
        <>
          <ul className="space-y-2">
            {(data ?? []).map(user => (
              <li key={user.id}>
                <Link
                  to={`users/${user.id}`}
                  className="flex items-center justify-between py-1 px-2 -mx-2 rounded-md hover:bg-sunken/40 transition-colors"
                >
                  <span className="text-sm text-ink-primary truncate">{user.fullName}</span>
                  <span className="text-xs text-ink-tertiary truncate ms-2">{user.email}</span>
                </Link>
              </li>
            ))}
          </ul>
          {(totalCount ?? 0) > (data?.length ?? 0) && (
            <Link to="users" className="text-xs font-medium text-signal hover:text-signal-hover mt-2 inline-block">
              {t('administration.overview.usersWithoutRoles.viewAll', { count: totalCount })}
            </Link>
          )}
        </>
      )}
    </div>
  );
}
