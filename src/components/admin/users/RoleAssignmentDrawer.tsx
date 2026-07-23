// src/components/admin/users/RoleAssignmentDrawer.tsx
//
// Assign Roles workflow, wired to PUT /api/Users/{id}/roles. This is a
// wholesale replace on the backend (the full role set is submitted, not
// a diff), so the UI treats it that way: pre-checks the user's current
// roles, lets them build the new full set, and Save is disabled unless
// the selection actually changed and isn't empty (a user should always
// retain at least one role — a client-side guard, since the backend
// doesn't appear to reject an empty payload on its own).
//
// Reuses MultiSelectSearchable rather than a bespoke role picker, per the
// module design doc's rationale for keeping one multi-select interaction
// across Create User and this drawer.

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../common/Drawer";
import { MultiSelectSearchable, type MultiSelectOption } from "../../common/MultiSelectSearchable";

export interface RoleAssignmentDrawerProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  /** Role ids the user currently holds, used to pre-check the list. */
  currentRoleIds: string[];
  roleOptions: MultiSelectOption[];
  onSubmit: (userId: string, roleIds: string[]) => Promise<void>;
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((v) => setB.has(v));
}

export function RoleAssignmentDrawer({
  open,
  onClose,
  userId,
  userName,
  currentRoleIds,
  roleOptions,
  onSubmit,
}: RoleAssignmentDrawerProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(currentRoleIds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset local selection whenever the drawer opens for a (possibly
  // different) user, rather than carrying over stale state between opens.
  useEffect(() => {
    if (open) setSelected(currentRoleIds);
  }, [open, currentRoleIds]);

  const isUnchanged = useMemo(() => sameSet(selected, currentRoleIds), [selected, currentRoleIds]);
  const isEmpty = selected.length === 0;
  const saveDisabled = isUnchanged || isEmpty || isSubmitting;

  function handleClose() {
    setSelected(currentRoleIds);
    onClose();
  }

  async function handleSave() {
    setIsSubmitting(true);
    try {
      await onSubmit(userId, selected);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={t("users.roles.assignTitle")}
      subtitle={userName}
    >
      <div className="flex flex-col gap-4">
        <MultiSelectSearchable
          options={roleOptions}
          selected={selected}
          onChange={setSelected}
          searchPlaceholder={t("users.roles.searchPlaceholder")}
        />

        {isEmpty && (
          <p className="text-xs text-[var(--error)]">{t("users.roles.saveDisabledEmpty")}</p>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-[var(--hairline)] pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[10px] px-4 py-2 text-sm font-medium text-[var(--ink-secondary)] hover:bg-[var(--sunken)]"
          >
            {t("users.actions.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveDisabled}
            className="rounded-[10px] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--signal-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("users.roles.saving") : t("users.actions.save")}
          </button>
        </div>
      </div>
    </Drawer>
  );
}
