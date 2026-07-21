import { Avatar } from "@/components/admin/hr/Avatar";
import { StatusBadge } from "@/components/admin/hr/StatusBadge";
import { Card } from "@/components/common/Card";
import type { Employee } from "@/types/hr.types";

const STATUS_VARIANT: Record<Employee["status"], "success" | "warning" | "neutral"> = {
  active: "success",
  "on-leave": "warning",
  inactive: "neutral",
};
const STATUS_LABEL: Record<Employee["status"], string> = {
  active: "Active",
  "on-leave": "On leave",
  inactive: "Inactive",
};

export function PersonCard({ employee, onClick }: { employee: Employee; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-start">
      <Card className="flex w-full flex-col items-start gap-3 p-4 transition-shadow duration-control hover:shadow-elevation1">
        <div className="flex w-full items-center gap-3">
          <Avatar name={employee.fullName} src={employee.avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink-primary">{employee.fullName}</p>
            <p className="truncate text-[0.8125rem] text-ink-secondary">{employee.jobTitle}</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-[0.8125rem] text-ink-tertiary">{employee.department}</span>
          <StatusBadge label={STATUS_LABEL[employee.status]} variant={STATUS_VARIANT[employee.status]} />
        </div>
      </Card>
    </button>
  );
}
