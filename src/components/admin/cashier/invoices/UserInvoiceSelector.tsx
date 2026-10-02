import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { SearchableSelect } from "@/components/common/SearchableSelect";
import { usersQueryKeys } from "@/hooks/useUsers";
import { usersApi } from "@/services/api/users.api";
import { User } from "@/types/users.types";

interface UserInvoiceSelectorProps {
  value: string | null;
  onChange: (userId: string | null) => void;
}

export function UserInvoiceSelector({
  value,
  onChange,
}: UserInvoiceSelectorProps) {
  const { t } = useTranslation();

  const { data: users = [], isLoading } = useQuery({
    queryKey: usersQueryKeys.all,
    queryFn: usersApi.getUsers,
  });

  const userList = useMemo(() => {
    return users.map((user: User) => ({
      value: user.id,
      label: user.fullName,
      secondaryLabel: user.email,
    }));
  }, [users]);

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={userList}
      disabled={isLoading}
      searchPlaceholder={t("invoices.byUser.searchUser")}
      placeholder={t("invoices.byUser.selectUser")}
      emptyResultsLabel={t("invoices.byUser.noUsersFound")}
    />
  );
}