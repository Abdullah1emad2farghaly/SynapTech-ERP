// src/components/common/ErrorState.tsx

import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ title, description, onRetry, retryLabel, className = "" }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="mb-4 rounded-full bg-[var(--error)]/10 p-3">
        <AlertTriangle size={22} className="text-[var(--error)]" />
      </div>
      <p className="text-sm font-medium text-[var(--ink-primary)]">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--ink-secondary)]">{description}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-[var(--radius-md,10px)] bg-[var(--signal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--signal-hover)] transition-colors"
        >
          {retryLabel ?? "Try again"}
        </button>
      )}
    </div>
  );
}
