// Intended path: src/components/admin/company/CompanySettingsSkeleton.tsx
//
// Purpose-built to mirror CompanySettingsPage's real layout (header, profile
// card, status card, system-info card, action row) rather than a generic
// pulse block — same approach used for EmployeeDetailsSkeleton/EmployeeFormSkeleton.

export function CompanySettingsSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-40 rounded bg-[var(--sunken)]" />
        <div className="h-7 w-32 rounded bg-[var(--sunken)]" />
        <div className="h-4 w-72 rounded bg-[var(--sunken)]" />
      </div>

      <div className="space-y-6">
        <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6">
          <div className="h-4 w-32 rounded bg-[var(--sunken)]" />
          <div className="mt-2 h-3 w-64 rounded bg-[var(--sunken)]" />
          <div className="mt-6 space-y-5">
            <div className="h-10 w-full rounded-[10px] bg-[var(--sunken)]" />
            <div className="h-10 w-full rounded-[10px] bg-[var(--sunken)]" />
            <div className="h-10 w-full rounded-[10px] bg-[var(--sunken)]" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="h-10 w-full rounded-[10px] bg-[var(--sunken)]" />
              <div className="h-10 w-full rounded-[10px] bg-[var(--sunken)]" />
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6">
          <div className="h-4 w-28 rounded bg-[var(--sunken)]" />
          <div className="mt-4 h-8 w-full rounded bg-[var(--sunken)]" />
        </div>

        <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6">
          <div className="h-4 w-36 rounded bg-[var(--sunken)]" />
          <div className="mt-4 h-8 w-56 rounded bg-[var(--sunken)]" />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <div className="h-10 w-24 rounded-[10px] bg-[var(--sunken)]" />
        <div className="h-10 w-32 rounded-[10px] bg-[var(--sunken)]" />
      </div>
    </div>
  );
}
