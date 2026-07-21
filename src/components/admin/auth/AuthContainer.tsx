import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { LanguageSwitcher } from "@/components/admin/auth/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/admin/auth/ThemeSwitcher";

interface AuthContainerProps {
  logoSize?: "sm" | "md";
  heading: string;
  subtitle: string;
  topSlot?: ReactNode; // e.g. a "back to login" link
  children: ReactNode;
}

// Shared shell for Login / ForgotPassword / ResetPassword — layout, vertical
// rhythm, and footer are identical across all three; only the middle content differs.
export function AuthContainer({ logoSize = "md", heading, subtitle, topSlot, children }: AuthContainerProps) {
  return (
    <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[60%] lg:px-16">
      <div className="mx-auto w-full max-w-[440px]">
        {topSlot}
        <Logo size={logoSize} className="mb-6" />
        <h1 className="font-display text-[2.25rem] font-semibold leading-tight text-ink-primary">
          {heading}
        </h1>
        <p className="mt-2 text-[1rem] text-ink-secondary">{subtitle}</p>

        <div className="mt-8">{children}</div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6">
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          <div className="font-mono text-xs text-ink-tertiary">
            v2.4.1 · © {new Date().getFullYear()} Synaptech
          </div>
        </footer>
      </div>
    </div>
  );
}
