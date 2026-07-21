import { useTranslation } from "react-i18next";
import type { PasswordStrengthScore } from "@/types/auth.types";
import { passwordRequirements } from "@/utils/passwordStrength";
import { Check } from "lucide-react";

interface PasswordStrengthMeterProps {
  score: PasswordStrengthScore;
  value: string;
}

const SEGMENT_COLORS = ["bg-error", "bg-warning", "bg-synapse", "bg-success"];
const LABEL_KEYS = [
  "auth.resetPassword.strength.weak",
  "auth.resetPassword.strength.weak",
  "auth.resetPassword.strength.fair",
  "auth.resetPassword.strength.good",
  "auth.resetPassword.strength.strong",
];

export function PasswordStrengthMeter({ score, value }: PasswordStrengthMeterProps) {
  const { t } = useTranslation();
  const filledSegments = value.length === 0 ? 0 : score + 1;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5" role="img" aria-label={t(LABEL_KEYS[filledSegments])}>
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-colors duration-state ease-state",
              i < filledSegments ? SEGMENT_COLORS[Math.min(score, 3)] : "bg-sunken",
            ].join(" ")}
          />
        ))}
      </div>
      {value.length > 0 ? (
        <p className="mt-1.5 text-[0.8125rem] text-ink-secondary">{t(LABEL_KEYS[filledSegments])}</p>
      ) : null}

      <ul className="mt-3 space-y-1.5">
        {passwordRequirements.map((req) => {
          const met = req.test(value);
          return (
            <li key={req.id} className="flex items-center gap-2 text-[0.8125rem]">
              <span
                className={[
                  "flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-control",
                  met ? "bg-success text-white" : "bg-sunken text-transparent",
                ].join(" ")}
              >
                <Check className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
              <span className={met ? "text-ink-secondary" : "text-ink-tertiary"}>{t(req.labelKey)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
