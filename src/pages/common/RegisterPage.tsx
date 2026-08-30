import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/components/admin/auth/AuthLayout";
import { AuthContainer } from "@/components/admin/auth/AuthContainer";
import { RegisterForm } from "@/components/admin/auth/RegisterForm";
import { Seo } from "@/components/common/Seo";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <>
      <Seo
        title="Register | SynapTech ERP"
        description="Create your SynapTech ERP account and start managing your business operations, accounting, inventory, sales, purchasing, and human resources."
        robots="index, follow"
      />
      
      <AuthLayout tagline="Set up your workspace.">
        <AuthContainer heading={t("auth.register.heading")} subtitle={t("auth.register.subtitle")}>
          <RegisterForm />
        </AuthContainer>
      </AuthLayout>
    </>
  );
}
