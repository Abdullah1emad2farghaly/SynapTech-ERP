import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { AuthLayout } from "@/components/admin/auth/AuthLayout";
import { AuthContainer } from "@/components/admin/auth/AuthContainer";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Link } from "@/components/common/Link";
import { useResendVerification, useVerifyEmail } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { EmailConfirmationState } from "@/types/auth.types";
import { Button } from "@/components/common/Button";

// Reads ?token= from the verification link sent on Register, confirms it
// against the backend, then shows one of three states in place — no
// separate loading page, no flash of the wrong state.

const RESEND_COOLDOWN_SECONDS = 30;
export default function EmailConfirmationPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const verifyEmail = useVerifyEmail();
  const resend = useResendVerification();
  const [cooldown, setCooldown] = useState(0);
  const [state, setState] = useState<EmailConfirmationState>("confirming");

  const userId = searchParams.get("userId");
  const code = searchParams.get("code");
  const currentEmail: string = window.localStorage.getItem("curentEmail") || "";

  if(!currentEmail)
    Navigate({to: "/login"})

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);


  useEffect(() => {
    verifyEmail.mutate({ userId: userId || "", code: code || "" }, {
      onSuccess: () => setState("confirmed"),
      onError: () => setState("expired"),
    });
  }, []);


  return (
    <AuthLayout tagline="One last step.">
      <AuthContainer logoSize="sm" heading={t("auth.emailConfirmation.heading")} subtitle={t("auth.emailConfirmation.subtitle")}>
        <AnimatePresence mode="wait">
          {state === "confirming" ? (
            <motion.div key="confirming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
              <LoadingSpinner />
              <p className="text-[0.9375rem] text-ink-secondary">{t("auth.emailConfirmation.confirming")}</p>
            </motion.div>
          ) : state === "confirmed" ? (
            <motion.div key="confirmed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }} aria-live="polite">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-ink-primary">{t("auth.emailConfirmation.successHeading")}</h2>
              <p className="mt-1 text-[0.9375rem] text-ink-secondary">{t("auth.emailConfirmation.successBody")}</p>
              <div className="mt-6">
                <Link to={ROUTES.LOGIN}>{t("auth.emailConfirmation.continueToLogin")}</Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }} aria-live="polite">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-ink-primary">{t("auth.emailConfirmation.expiredHeading")}</h2>
              <p className="mt-1 text-[0.9375rem] text-ink-secondary">{t("auth.emailConfirmation.expiredBody")}</p>
              <div className="mt-6 flex items-center gap-4">
                {/* <Link to={ROUTES.REGISTER}>{t("auth.emailConfirmation.resend")}</Link> */}
                <Button
                  variant="secondary"
                  disabled={cooldown > 0}
                  isLoading={resend.isPending}
                  onClick={() => {
                    resend.mutate(currentEmail, {
                      onError: () => setState("expired")
                    });
                    setCooldown(RESEND_COOLDOWN_SECONDS);
                  }}
                >
                  {cooldown > 0
                    ? t("auth.forgotPassword.resendIn", { seconds: cooldown })
                    : t("auth.forgotPassword.resend")}
                </Button>
                <Link to={ROUTES.LOGIN}>{t("auth.emailConfirmation.backToLogin")}</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AuthContainer>
    </AuthLayout>
  );
}
