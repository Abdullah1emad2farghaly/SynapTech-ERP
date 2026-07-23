import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Derives its trail from the current pathname. Swap the label lookup for a
// route-metadata map if segments need custom labels instead of a titleized slug.
function titleize(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => ({
    label: titleize(segment),
    to: `/${segments.slice(0, index + 1).join("/")}`,
    isLast: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8125rem]">
      {crumbs.map((crumb) => (
        <span key={crumb.to} className="flex items-center gap-1.5">
          {crumb.isLast ? (
            <span className="font-medium text-ink-primary" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link to={crumb.to} className="text-ink-tertiary hover:text-ink-primary">
              {crumb.label}
            </Link>
          )}
          {!crumb.isLast ? (
            <ChevronRight className="h-3.5 w-3.5 text-ink-tertiary rtl:rotate-180" aria-hidden="true" />
          ) : null}
        </span>
      ))}
    </nav>
  );
}
