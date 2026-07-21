import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MailCheck } from "lucide-react";
import { TextInput } from "@/components/common/TextInput";
import { Button } from "@/components/common/Button";
import { Link } from "@/components/common/Link";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/auth.schemas";
import { useForgotPassword } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import axios from "axios";
import { Alert } from "@/components/common/Alert";

const RESEND_COOLDOWN_SECONDS = 30;

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 1)}•••@${domain}`;
}

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const forgotPassword = useForgotPassword();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [apiErrors, setApiErrors] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const submit = (values: ForgotPasswordFormValues) => {
    forgotPassword.mutate(values, {
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
            {t("auth.forgotPassword.successHeading")}
          </h2>
          <p className="mt-1 text-[0.9375rem] text-ink-secondary">
            {t("auth.forgotPassword.successBody", { email: maskEmail(submittedEmail) })}
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Button
              variant="secondary"
              disabled={cooldown > 0}
            onClick={() => submit({ email: submittedEmail })}
            >
              {cooldown > 0
                ? t("auth.forgotPassword.resendIn", { seconds: cooldown })
                : t("auth.forgotPassword.resend")}
            </Button>
            <Link to={ROUTES.LOGIN}>{t("auth.forgotPassword.backToLogin")}</Link>
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
            label={t("auth.forgotPassword.emailLabel")}
            type="email"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email && t(errors.email.message as string)}
            {...register("email")}
          />
          {forgotPassword.isError &&
            apiErrors?.slice(1)?.map((ele, index) => (
              <Alert key={index} variant="error">
                {ele}
              </Alert>
            ))}
          <Button type="submit" onClick={() => submit({ email: submittedEmail || "" })} fullWidth isLoading={forgotPassword.isPending}>
            {t("auth.forgotPassword.submit")}
          </Button>
          <div className="text-center">
            <Link to={ROUTES.LOGIN}>{t("auth.forgotPassword.backToLogin")}</Link>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
