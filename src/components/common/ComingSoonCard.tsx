// src/components/common/ComingSoonCard.tsx
//
// Generic "not yet available" placeholder card. First need: Categories'
// Details Panel, which the brief explicitly asked to design with
// placeholders for Product Count, Created/Updated Date, Created By,
// Recent Activity, Audit Timeline, and Permissions — a genuinely
// different treatment from every prior module's cut features, which
// were simply omitted. Here the fields are shown, honestly labeled as
// not yet backed by data, rather than faked with sample values or
// hidden entirely.
//
// Kept generic (icon + label + body text) rather than Categories-
// specific, since any future module with "designed but not yet backed"
// fields can reuse this instead of writing another bespoke placeholder —
// Accounts' ActivityTimelinePlaceholder is effectively a one-off,
// single-purpose version of this same idea.

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export interface ComingSoonCardProps {
  icon?: ReactNode;
  label: string;
  /** Short explanatory line — real text, not just a visual treatment, so screen readers get the same message. */
  body: string;
  className?: string;
}

export function ComingSoonCard({ icon, label, body, className = "" }: ComingSoonCardProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[16px] border border-dashed border-[var(--hairline)] bg-[var(--sunken)] p-4 ${className}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--panel)] text-[var(--ink-tertiary)]">
        {icon ?? <Sparkles size={16} />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--ink-primary)]">{label}</p>
        <p className="mt-0.5 text-xs text-[var(--ink-tertiary)]">{body}</p>
      </div>
    </div>
  );
}
