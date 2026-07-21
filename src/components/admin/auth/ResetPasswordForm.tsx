import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Button } from "@/components/common/Button";
import { Link } from "@/components/common/Link";
import { PasswordStrengthMeter } from "@/components/admin/auth/PasswordStrengthMeter";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth.schemas";
import { useResetPassword } from "@/hooks/useAuth";
import { scorePasswordStrength } from "@/utils/passwordStrength";
import { ROUTES } from "@/constants/routes";

const REDIRECT_SECONDS = 3;

export function ResetPasswordForm({ token }: { token: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const [succeeded, setSucceeded] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const passwordValue = useWatch({ control, name: "password" }) ?? "";
  const score = scorePasswordStrength(passwordValue);

  useEffect(() => {
    if (!succeeded) return;
    if (countdown <= 0) {
      navigate(ROUTES.LOGIN);
      return;
    }
    const id = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [succeeded, countdown, navigate]);

  const submit = (values: ResetPasswordFormValues) => {
    resetPassword.mutate(
      { token, password: values.password, confirmPassword: values.confirmPassword },
      { onSuccess: () => setSucceeded(true) }
    );
  };

  return (
    <AnimatePresence mode="wait">
      {succeeded ? (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
          aria-live="polite"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-ink-primary">
            {t("auth.resetPassword.successHeading")}
          </h2>
          <p className="mt-1 text-[0.9375rem] text-ink-secondary">
            {t("auth.resetPassword.successBody", { seconds: countdown })}
          </p>
          <div className="mt-6">
            <Link to={ROUTES.LOGIN}>{t("auth.resetPassword.continueToLogin")}</Link>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
          onSubmit={handleSubmit(submit)}
          noValidate
          className="space-y-5"
        >
          <div>
            <PasswordInput
              label={t("auth.resetPassword.passwordLabel")}
              error={errors.password && t(errors.password.message as string)}
              {...register("password")}
            />
            <PasswordStrengthMeter score={score} value={passwordValue} />
          </div>
          <PasswordInput
            label={t("auth.resetPassword.confirmPasswordLabel")}
            error={errors.confirmPassword && t(errors.confirmPassword.message as string)}
            {...register("confirmPassword")}
          />
          <Button type="submit" fullWidth disabled={!isValid} isLoading={resetPassword.isPending}>
            {t("auth.resetPassword.submit")}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
