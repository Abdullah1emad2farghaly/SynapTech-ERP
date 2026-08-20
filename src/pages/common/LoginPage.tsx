import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/admin/auth/AuthLayout";
import { AuthContainer } from "@/components/admin/auth/AuthContainer";
import { LoginForm } from "@/components/admin/auth/LoginForm";
import { ROUTES } from "@/constants/routes";
import { filterNavByPermissions } from "@/utils/permissions";
import { useNavItems } from "@/constants/navigation";
import { getMyPermissions } from "@/services/api/roles.crud.api";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navItems = useNavItems();
  

  return (
    <AuthLayout>
      <AuthContainer heading={t("auth.login.heading")} subtitle={t("auth.login.subtitle")}>
        <LoginForm onSuccess={async () => {
          navigate('/sales')
          const res = await getMyPermissions()
          const items = filterNavByPermissions(navItems, true)
          // console.log(res);
          // console.log(items);
        }} />
      </AuthContainer>
    </AuthLayout>
  );
}
