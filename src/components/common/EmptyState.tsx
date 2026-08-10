// src/components/common/EmptyState.tsx

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      {Icon && (
        <div className="mb-4 rounded-full bg-[var(--sunken)] p-3">
          <Icon size={22} className="text-[var(--ink-tertiary)]" />
        </div>
      )}
      <p className="text-sm font-medium text-[var(--ink-primary)]">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--ink-secondary)]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-[var(--radius-md,10px)] border border-[var(--hairline)] px-4 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--sunken)] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
