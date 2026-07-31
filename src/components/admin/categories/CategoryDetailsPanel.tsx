// src/components/admin/categories/CategoryDetailsPanel.tsx
//
// Always-visible right-column panel (per the design doc's split-view
// decision, not a drawer-on-click the way Departments handled Details).
// Overview + Hierarchy Path + Children are real data; the Coming Soon
// group renders seven ComingSoonCard instances for Product Count,
// Created Date, Created By, Updated Date, Recent Activity, Audit
// Timeline, and Permissions — per the brief's explicit request to design
// these as honest placeholders rather than omitting them.
//
// Hierarchy Path is kept inline here rather than a separate component
// (unlike Accounts' AccountHierarchyPath) since the design doc didn't
// call it out as a reusable unit on its own — it's simple enough
// (Parent -> Current -> children count) not to warrant extraction yet.
//
// Parent/child links use a categoryId query param (?categoryId=...) on
// the module's single route, rather than a real navigation — there's no
// dedicated details route for Categories (unlike Accounts), so clicking
// a related category just changes which one is selected on the same
// page. CategoriesPage is expected to read this param to drive its
// selectedId state, which also means selection survives a refresh/share.

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ArrowDown } from "lucide-react";
import { StatusBadge } from "../../common/StatusBadge";
import { ComingSoonCard } from "../../common/ComingSoonCard";
import {
  Hash,
  CalendarPlus,
  UserCircle,
  CalendarClock,
  Activity,
  History,
  ShieldCheck,
} from "lucide-react";

export interface CategoryDetailsData {
  id: string;
  name: string;
  isActive: boolean;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string }[];
}

export interface CategoryDetailsPanelProps {
  category: CategoryDetailsData | null;
}

export function CategoryDetailsPanel({ category }: CategoryDetailsPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!category) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-6 text-center">
        <p className="text-sm text-[var(--ink-tertiary)]">{t("categories.details.nothingSelected")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-[16px] border border-[var(--hairline)] bg-[var(--panel)] p-5">
      {/* Overview */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--ink-primary)]">{category.name}</h2>
        </div>
        <div className="mt-2">
          <StatusBadge
            status={category.isActive ? "active" : "inactive"}
            label={category.isActive ? t("users.status.active") : t("users.status.inactive")}
          />
        </div>
      </div>

      {/* Hierarchy Path */}
      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("categories.details.sections.hierarchy")}
        </h3>
        <div className="flex flex-col items-start gap-1">
          {category.parent ? (
            <>
              <button
                type="button"
                onClick={() => navigate(`?categoryId=${category.parent!.id}`)}
                className="rounded-[10px] border border-[var(--hairline)] bg-[var(--sunken)] px-3 py-2 text-sm text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              >
                {category.parent.name}
              </button>
              <ArrowDown size={14} className="ms-3 text-[var(--ink-tertiary)]" aria-hidden="true" />
            </>
          ) : (
            <p className="text-xs text-[var(--ink-tertiary)]">{t("categories.create.fields.parentCategoryNone")}</p>
          )}

          <div className="rounded-[10px] border border-[var(--signal)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--ink-primary)]">
            {category.name}
          </div>

          {category.children.length > 0 && (
            <>
              <ArrowDown size={14} className="ms-3 text-[var(--ink-tertiary)]" aria-hidden="true" />
              <p className="rounded-[10px] border border-[var(--hairline)] bg-[var(--sunken)] px-3 py-2 text-sm text-[var(--ink-secondary)]">
                {t("categories.details.childrenCount", { count: category.children.length })}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Children */}
      <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("categories.details.sections.children")}
        </h3>
        {category.children.length === 0 ? (
          <p className="text-sm text-[var(--ink-tertiary)]">{t("categories.details.noChildren")}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {category.children.map((child) => (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => navigate(`?categoryId=${child.id}`)}
                  className="w-full rounded-[10px] border border-[var(--hairline)] px-3 py-2 text-start text-sm text-[var(--ink-primary)] hover:bg-[var(--sunken)]"
                >
                  {child.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Coming Soon — designed placeholders, per the brief's explicit request */}
      {/* <section>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-tertiary)]">
          {t("categories.details.sections.comingSoon")}
        </h3>
        <div className="flex flex-col gap-2">
          <ComingSoonCard
            icon={<Hash size={16} />}
            label={t("categories.comingSoon.productCount")}
            body={t("categories.comingSoon.body")}
          />
          <ComingSoonCard
            icon={<CalendarPlus size={16} />}
            label={t("categories.comingSoon.createdDate")}
            body={t("categories.comingSoon.body")}
          />
          <ComingSoonCard
            icon={<UserCircle size={16} />}
            label={t("categories.comingSoon.createdBy")}
            body={t("categories.comingSoon.body")}
          />
          <ComingSoonCard
            icon={<CalendarClock size={16} />}
            label={t("categories.comingSoon.updatedDate")}
            body={t("categories.comingSoon.body")}
          />
          <ComingSoonCard
            icon={<Activity size={16} />}
            label={t("categories.comingSoon.recentActivity")}
            body={t("categories.comingSoon.body")}
          />
          <ComingSoonCard
            icon={<History size={16} />}
            label={t("categories.comingSoon.auditTimeline")}
            body={t("categories.comingSoon.body")}
          />
          <ComingSoonCard
            icon={<ShieldCheck size={16} />}
            label={t("categories.comingSoon.permissions")}
            body={t("categories.comingSoon.body")}
          />
        </div>
      </section> */}
    </div>
  );
}
