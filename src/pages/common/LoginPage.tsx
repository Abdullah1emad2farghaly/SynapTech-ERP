import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/admin/auth/AuthLayout";
import { AuthContainer } from "@/components/admin/auth/AuthContainer";
import { LoginForm } from "@/components/admin/auth/LoginForm";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <AuthContainer heading={t("auth.login.heading")} subtitle={t("auth.login.subtitle")}>
        <LoginForm onSuccess={() => navigate(ROUTES.DASHBOARD)} />
      </AuthContainer>
    </AuthLayout>
  );
}
