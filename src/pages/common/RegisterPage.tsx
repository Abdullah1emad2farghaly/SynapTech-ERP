import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/components/admin/auth/AuthLayout";
import { AuthContainer } from "@/components/admin/auth/AuthContainer";
import { RegisterForm } from "@/components/admin/auth/RegisterForm";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout tagline="Set up your workspace.">
      <AuthContainer heading={t("auth.register.heading")} subtitle={t("auth.register.subtitle")}>
        <RegisterForm />
      </AuthContainer>
    </AuthLayout>
  );
}
