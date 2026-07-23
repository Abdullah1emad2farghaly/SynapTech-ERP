import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/common/Button";

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

// Highest-frequency actions, one click from the dashboard's page header.
// On mobile this collapses into a single "+" FAB in the page composing
// it — this component itself just renders the row.
export function QuickActionsRow({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button key={action.id} variant="secondary" onClick={action.onClick}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
