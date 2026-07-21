import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/common/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline py-16 text-center">
      <Icon className="h-8 w-8 text-ink-tertiary" aria-hidden="true" />
      <p className="font-medium text-ink-primary">{title}</p>
      {description ? <p className="max-w-sm text-[0.8125rem] text-ink-secondary">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
