// Project path: src/components/admin/employees/EmployeeAccessCard.tsx
//
// Two states only, matching what the API actually supports:
// - userId === null → premium empty state with a Grant Access CTA
// - userId present → renders the UserResponse fields returned by
//   grant-access. NOTE: there is no confirmed GET endpoint to re-fetch an
//   employee's UserResponse after the initial grant — if `userResponse` is
//   not available (e.g. after a page refresh, only userId is known), this
//   renders a reduced-confidence state saying access is enabled without
//   fabricating roles/email data that was never actually returned again.

import { useTranslation } from "react-i18next";
import { KeyRound, ShieldCheck, Mail } from "lucide-react";
import type { UserResponse } from "../../../types/employee.types";

interface EmployeeAccessCardProps {
  hasAccess: boolean;
  userResponse?: UserResponse | null;
  onGrantAccess: () => void;
}

export function EmployeeAccessCard({
  hasAccess,
  userResponse,
  onGrantAccess,
}: EmployeeAccessCardProps) {
  const { t } = useTranslation();

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-[var(--hairline)] bg-[var(--panel)] p-10 text-center">
        <div className="rounded-full bg-[var(--sunken)] p-3 text-[var(--ink-tertiary)]">
          <KeyRound size={22} aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-[var(--ink-primary)]">
          {t("employees.access.notEnabledTitle", "System access not enabled")}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-[var(--ink-tertiary)]">
          {t(
            "employees.access.notEnabledBody",
            "This employee does not currently have access to the SynapTech ERP system."
          )}
        </p>
        <button
          type="button"
          onClick={onGrantAccess}
          className="mt-5 h-10 rounded-md bg-[var(--signal)] px-5 text-sm font-medium text-white hover:bg-[var(--signal-hover)]"
        >
          {t("employees.actions.grantAccess", "Grant Access")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-6 shadow-[var(--elevation-1)]">
      <div className="mb-4 flex items-center gap-2 text-[var(--success)]">
        <ShieldCheck size={18} aria-hidden="true" />
        <h3 className="text-base font-semibold text-[var(--ink-primary)]">
          {t("employees.access.title", "System Access")}
        </h3>
      </div>

      {userResponse ? (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">
              {t("employees.access.status", "Status")}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-primary)]">
              {userResponse.isActive
                ? t("employees.access.active", "Active")
                : t("employees.access.inactive", "Inactive")}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">
              {t("employees.form.email", "Email")}
            </p>
            {userResponse.email ? (
              <a
                href={`mailto:${userResponse.email}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--signal)] hover:underline"
              >
                <Mail size={14} aria-hidden="true" />
                {userResponse.email}
              </a>
            ) : (
              <p className="mt-1 text-sm text-[var(--ink-tertiary)]">—</p>
            )}
          </div>
          <div>
            <p className="text-xs text-[var(--ink-tertiary)]">
              {t("employees.grantAccess.roles", "Roles")}
            </p>
            {userResponse.roles && userResponse.roles.length > 0 ? (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {userResponse.roles.map((role) => (
                  <li
                    key={role}
                    className="rounded-full bg-[var(--sunken)] px-2.5 py-1 text-xs text-[var(--ink-secondary)]"
                  >
                    {role}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-[var(--ink-tertiary)]">—</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-tertiary)]">
          {t(
            "employees.access.grantedNoDetail",
            "This employee has system access, but detailed account information isn't available from this view."
          )}
        </p>
      )}
    </div>
  );
}
