import type { PasswordRequirement, PasswordStrengthScore } from "@/types/auth.types";

export const passwordRequirements: PasswordRequirement[] = [
  { id: "minLength", labelKey: "auth.resetPassword.requirements.minLength", test: (v) => v.length >= 8 },
  { id: "hasUpperLower", labelKey: "auth.resetPassword.requirements.hasUpperLower", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: "hasNumber", labelKey: "auth.resetPassword.requirements.hasNumber", test: (v) => /[0-9]/.test(v) },
  { id: "hasSymbol", labelKey: "auth.resetPassword.requirements.hasSymbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/**
 * Lightweight, dependency-free strength score. Swap the body for a zxcvbn
 * call if a heavier, more accurate estimate is needed later — callers only
 * depend on the 0-4 score, not on how it's computed.
 */
export function scorePasswordStrength(value: string): PasswordStrengthScore {
  if (!value) return 0;
  const metCount = passwordRequirements.filter((req) => req.test(value)).length;
  const lengthBonus = value.length >= 12 ? 1 : 0;
  const score = Math.min(4, metCount === 4 ? 3 + lengthBonus : metCount);
  return score as PasswordStrengthScore;
}
