// src/components/admin/organization/branches/DepartmentUsersSkeleton.tsx
//
// Loading placeholder shown inside an expanded DepartmentAccordionItem
// while that department's users are being fetched — scoped to just this
// one accordion item, never the whole page (per the requirement that
// expanding one department shouldn't reload the page).

export function DepartmentUsersSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-[10px] px-3 py-2">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--sunken)]" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded-[4px] bg-[var(--sunken)]" />
            <div className="h-3 w-40 animate-pulse rounded-[4px] bg-[var(--sunken)]" />
          </div>
          <div className="h-5 w-16 animate-pulse rounded-[6px] bg-[var(--sunken)]" />
        </div>
      ))}
    </div>
  );
}
