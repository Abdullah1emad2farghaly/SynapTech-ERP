// src/components/common/Breadcrumb.tsx
//
// Generic breadcrumb trail — first use in this project, flagged as a gap
// in the handoff document. Kept generic (a plain array of items) so any
// future page can reuse it rather than each page hand-rolling its own
// breadcrumb markup, which is the exact duplication problem already
// flagged for the toolbar pattern across Users/Departments/Branches.

import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last (current) item — it renders as plain text, not a link. */
  to?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--ink-tertiary)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="transition-colors duration-150 hover:text-[var(--ink-primary)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium text-[var(--ink-primary)]" : ""}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight size={13} className="shrink-0 rtl:rotate-180" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
