import type { ReactNode } from "react";
import { SynapseFieldPanel } from "@/components/admin/auth/SynapseFieldPanel";

interface AuthLayoutProps {
  tagline?: string;
  children: ReactNode;
}

// Split-screen shell shared by all auth screens. Logical flex order (not
// left/right) means it mirrors automatically under dir="rtl" — see design
// spec §8.
export function AuthLayout({ tagline, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <SynapseFieldPanel tagline={tagline} />
      {children}
    </div>
  );
}
