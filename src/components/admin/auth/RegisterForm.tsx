import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Mail, MailCheck } from "lucide-react";
import { TextInput } from "@/components/common/TextInput";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Button } from "@/components/common/Button";
import { Link } from "@/components/common/Link";
import { Alert } from "@/components/common/Alert";
import { PasswordStrengthMeter } from "@/components/admin/auth/PasswordStrengthMeter";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schemas";
import { useRegister, useResendVerification } from "@/hooks/useAuth";
import { scorePasswordStrength } from "@/utils/passwordStrength";
import { ROUTES } from "@/constants/routes";
import axios from "axios";

const RESEND_COOLDOWN_SECONDS = 30;

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 1)}•••@${domain}`;
}

// Same shape as ForgotPasswordForm: submit -> in-place crossfade to a
// "verify your email" panel, not an auto-login. Registering an ERP admin
// account shouldn't grant a live session before the email is confirmed.
export function RegisterForm() {
  const { t } = useTranslation();
  const register_ = useRegister();
  const resend = useResendVerification();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [apiErrors, setApiErrors] = useState([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const passwordValue = useWatch({ control, name: "password" }) ?? "";
  const score = scorePasswordStrength(passwordValue);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const submit = (values: RegisterFormValues) => {
    register_.mutate(values, {
      onSuccess: () => {
        setSubmittedEmail(values.email);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          setApiErrors(error.response?.data.errors);
        } else {
          console.log(error);
        }
      }
    });
  };

  return (
    <AnimatePresence mode="wait">
      {submittedEmail ? (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
          aria-live="polite"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-synapse/15 text-synapse">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-ink-primary">
            {t("auth.register.successHeading")}
          </h2>
          <p className="mt-1 text-[0.9375rem] text-ink-secondary">
            {t("auth.register.successBody", { email: maskEmail(submittedEmail) })}
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Button
              variant="secondary"
              disabled={cooldown > 0}
              isLoading={resend.isPending}
              onClick={() => {
                resend.mutate(submittedEmail);
                setCooldown(RESEND_COOLDOWN_SECONDS);
              }}
            >
              {cooldown > 0
                ? t("auth.forgotPassword.resendIn", { seconds: cooldown })
                : t("auth.forgotPassword.resend")}
            </Button>
            <Link to={ROUTES.LOGIN}>{t("auth.register.backToLogin")}</Link>
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
          <TextInput
            label={t("auth.register.fullNameLabel")}
            icon={<User className="h-4 w-4" />}
            error={errors.fullName && t(errors.fullName.message as string)}
            {...register("fullName")}
          />
          <TextInput
            label={t("auth.register.companyNameLabel")}
            icon={<Building2 className="h-4 w-4" />}
            error={errors.companyName && t(errors.companyName.message as string)}
            {...register("companyName")}
          />
          <TextInput
            label={t("auth.register.emailLabel")}
            type="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email && t(errors.email.message as string)}
            {...register("email")}
          />
          <div>
            <PasswordInput
              label={t("auth.register.passwordLabel")}
              error={errors.password && t(errors.password.message as string)}
              {...register("password")}
            />
            <PasswordStrengthMeter score={score} value={passwordValue} />
          </div>

          {register_.isError && apiErrors?.slice(1)?.map((ele, index) => (
            <Alert key={index} variant="error">
              {ele}
            </Alert>
          ))}

          <Button type="submit" fullWidth disabled={!isValid} isLoading={register_.isPending}>
            {t("auth.register.submit")}
          </Button>

          <p className="text-center text-[0.8125rem] text-ink-secondary">
            {t("auth.register.haveAccount")}{" "}
            <Link to={ROUTES.LOGIN}>{t("auth.register.signIn")}</Link>
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
