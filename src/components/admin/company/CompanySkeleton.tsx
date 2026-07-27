// src/components/admin/company/CompanySkeleton.tsx
export function CompanySkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading company data">
      <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-2xl bg-[var(--color-surface-muted)]" />
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-[var(--color-surface-muted)]" />
            <div className="h-3 w-32 animate-pulse rounded bg-[var(--color-surface-muted)]" />
          </div>
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-[var(--color-surface-muted)]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
          />
        ))}
      </div>

      <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
    </div>
  );
}
