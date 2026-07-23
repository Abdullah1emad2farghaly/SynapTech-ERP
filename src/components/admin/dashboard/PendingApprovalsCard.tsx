import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/admin/hr/EmptyState";
import { CalendarCheck } from "lucide-react";

export interface PendingApprovalRow {
  id: string;
  title: string;
  requester: string;
  ageLabel: string;
  onApprove?: () => void;
  onReject?: () => void;
}

// App-wide version of the HR Dashboard's Pending Approvals card — same
// pattern, aggregated across modules rather than HR-only.
export function PendingApprovalsCard({ items }: { items: PendingApprovalRow[] }) {
  return (
    <Card className="p-5">
      <h3 className="font-medium text-ink-primary">Pending Approvals</h3>
      {items.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Nothing waiting on you" />
      ) : (
        <ul className="mt-3 divide-y divide-hairline">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-[0.9375rem] text-ink-primary">{item.title}</p>
                <p className="text-[0.8125rem] text-ink-tertiary">
                  {item.requester} · {item.ageLabel}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={item.onReject}>
                  Reject
                </Button>
                <Button onClick={item.onApprove}>Approve</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
