import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { AuthLayout } from "@/components/admin/auth/AuthLayout";
import { AuthContainer } from "@/components/admin/auth/AuthContainer";
import { ForgotPasswordForm } from "@/components/admin/auth/ForgotPasswordForm";
import { Link } from "@/components/common/Link";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout tagline="We'll get you back in.">
      <AuthContainer
        logoSize="sm"
        heading={t("auth.forgotPassword.heading")}
        subtitle={t("auth.forgotPassword.subtitle")}
        topSlot={
          <Link to={ROUTES.LOGIN} className="mb-6 inline-flex items-center gap-1 text-ink-tertiary">
            <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        }
      >
        <ForgotPasswordForm />
      </AuthContainer>
    </AuthLayout>
  );
}
