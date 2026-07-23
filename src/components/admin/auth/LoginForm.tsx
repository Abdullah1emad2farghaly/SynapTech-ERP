import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { TextInput } from "@/components/common/TextInput";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Checkbox } from "@/components/common/Checkbox";
import { Button } from "@/components/common/Button";
import { Link } from "@/components/common/Link";
import { Alert } from "@/components/common/Alert";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schemas";
import { useLogin } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import axios from "axios";
import { useState } from "react";

// Presentation + form-wiring only. Navigation-on-success and error mapping
// live in the mutation hook / page, not here.
export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const login = useLogin();
  const [apiErrors, setApiErrors] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });


  const onSubmit = (values: LoginFormValues) => {
    
    login.mutate(values, {
      onSuccess,
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextInput
        label={t("auth.login.emailLabel")}
        type="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email && t(errors.email.message as string)}
        {...register("email")}
      />
      <PasswordInput
        label={t("auth.login.passwordLabel")}
        error={errors.password && t(errors.password.message as string)}
        {...register("password")}
      />
      <div className="flex items-center justify-between">
        <Checkbox label={t("auth.login.rememberMe")} {...register("rememberMe")} />
        <Link to={ROUTES.FORGOT_PASSWORD}>{t("auth.login.forgotPassword")}</Link>
      </div>

      {login.isError &&
        apiErrors?.slice(1)?.map((ele, index) => (
          <Alert key={index} variant="error">
            {ele}
          </Alert>
        ))}
      <Button type="submit" fullWidth isLoading={login.isPending}>
        {t("auth.login.submit")}
      </Button>

      <p className="text-center text-[0.8125rem] text-ink-secondary">
        {t("auth.login.noAccount")} <Link to={ROUTES.REGISTER}>{t("auth.login.signUp")}</Link>
      </p>
    </form>
  );
}
