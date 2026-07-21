import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { AuthLayout } from "@/components/admin/auth/AuthLayout";
import { AuthContainer } from "@/components/admin/auth/AuthContainer";
import { ResetPasswordForm } from "@/components/admin/auth/ResetPasswordForm";
import { Button } from "@/components/common/Button";
import { Link } from "@/components/common/Link";
import { ROUTES } from "@/constants/routes";

// Token validity (expired vs valid) is resolved by the page — a route-level
// concern — before handing a confirmed-valid token down to the form.
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const isExpired = !token; // replace with a useQuery(authApi.verifyResetToken) call in production

  return (
    <AuthLayout tagline="Almost there.">
      <AuthContainer
        logoSize="sm"
        heading={t("auth.resetPassword.heading")}
        subtitle={t("auth.resetPassword.subtitle")}
      >
        {isExpired ? (
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-ink-primary">
              {t("auth.resetPassword.expiredHeading")}
            </h2>
            <p className="mt-1 text-[0.9375rem] text-ink-secondary">
              {t("auth.resetPassword.expiredBody")}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Button onClick={() => (window.location.href = ROUTES.FORGOT_PASSWORD)}>
                {t("auth.resetPassword.requestNewLink")}
              </Button>
              <Link to={ROUTES.LOGIN}>{t("auth.forgotPassword.backToLogin")}</Link>
            </div>
          </div>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </AuthContainer>
    </AuthLayout>
  );
}
