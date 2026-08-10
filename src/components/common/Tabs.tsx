// src/components/common/Tabs.tsx
import { useRef } from "react";

/**
 * Generic tab bar — the project's first shared Tabs primitive (previously
 * flagged as a gap: "No shared Tabs"). Presentation-only, controlled by
 * the parent (EmployeeDetailsPage owns the active-tab state), following
 * the same pattern as every other common/ component.
 */

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, activeId, onChange, className = "" }: TabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
    if (nextIndex !== null) {
      event.preventDefault();
      const next = items[nextIndex];
      onChange(next.id);
      tabRefs.current[next.id]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Section tabs"
      className={`flex items-center gap-1 overflow-x-auto border-b border-[var(--hairline)] ${className}`}
    >
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[item.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={isActive}
            aria-controls={`tabpanel-${item.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors duration-[160ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--synapse)] ${
              isActive
                ? "text-[var(--ink-primary)]"
                : "text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)]"
            }`}
          >
            {item.icon}
            {item.label}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-[var(--signal)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeId: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, activeId, children, className = "" }: TabPanelProps) {
  if (id !== activeId) return null;
  return (
    <div role="tabpanel" id={`tabpanel-${id}`} aria-labelledby={`tab-${id}`} className={className}>
      {children}
    </div>
  );
}
