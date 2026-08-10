// Project path: src/components/admin/employees/EmployeeInfoCard.tsx
//
// Generic label/value card grid, reused across Overview/Employment/
// Compensation/Contact tabs rather than four bespoke layouts. Empty values
// render as "—", never "null"/"undefined"/"N/A" per the brief. Email and
// phone rows become mailto:/tel: links when a field is flagged interactive.

import { Mail, Phone } from "lucide-react";

export interface InfoField {
  label: string;
  value: string | null | undefined;
  type?: "text" | "email" | "phone" | "mono";
}

interface EmployeeInfoCardProps {
  title: string;
  fields: InfoField[];
}

export function EmployeeInfoCard({ title, fields }: EmployeeInfoCardProps) {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--panel)] p-6 shadow-[var(--elevation-1)]">
      <h3 className="mb-4 text-base font-semibold text-[var(--ink-primary)]">{title}</h3>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs text-[var(--ink-tertiary)]">{field.label}</dt>
            <dd
              className={`mt-1 text-sm text-[var(--ink-primary)] ${
                field.type === "mono" ? "font-mono" : ""
              }`}
            >
              {!field.value ? (
                <span className="text-[var(--ink-tertiary)]">—</span>
              ) : field.type === "email" ? (
                <a
                  href={`mailto:${field.value}`}
                  className="inline-flex items-center gap-1.5 text-[var(--signal)] hover:underline"
                >
                  <Mail size={14} aria-hidden="true" />
                  {field.value}
                </a>
              ) : field.type === "phone" ? (
                <a
                  href={`tel:${field.value}`}
                  className="inline-flex items-center gap-1.5 text-[var(--signal)] hover:underline"
                >
                  <Phone size={14} aria-hidden="true" />
                  {field.value}
                </a>
              ) : (
                field.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
