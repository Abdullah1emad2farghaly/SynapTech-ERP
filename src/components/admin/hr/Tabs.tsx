import { useState } from "react";
import type { ReactNode } from "react";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
}

// Underline style, keyboard arrow-key navigable per the design spec.
export function Tabs({ items, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const currentIndex = items.findIndex((i) => i.id === activeId);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveId(items[(currentIndex + 1) % items.length].id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveId(items[(currentIndex - 1 + items.length) % items.length].id);
    }
  };

  const active = items.find((i) => i.id === activeId);

  return (
    <div>
      <div
        role="tablist"
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-hairline"
      >
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={item.id === activeId}
            onClick={() => setActiveId(item.id)}
            className={[
              "whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors duration-control",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synapse focus-visible:ring-offset-2 rounded-t",
              item.id === activeId
                ? "border-signal text-signal"
                : "border-transparent text-ink-secondary hover:text-ink-primary",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-6">
        {active?.content}
      </div>
    </div>
  );
}
