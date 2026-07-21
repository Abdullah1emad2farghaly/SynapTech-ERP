import { useParams } from "react-router-dom";
import { Mail, Phone, Briefcase, Building2, MapPin, Award, FileText, Clock3 } from "lucide-react";
import { Avatar } from "@/components/admin/hr/Avatar";
import { StatusBadge } from "@/components/admin/hr/StatusBadge";
import { Tabs } from "@/components/admin/hr/Tabs";
import { EmptyState } from "@/components/admin/hr/EmptyState";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { mockEmployees } from "@/utils/mockHrData";
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

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
      <div>
        <p className="text-[0.75rem] text-ink-tertiary">{label}</p>
        <p className="text-[0.9375rem] text-ink-primary">{value}</p>
      </div>
    </div>
  );
}

// Restricted/role-gated fields (compensation) render as this placeholder
// rather than being hidden outright — see the Module 2 permissions rule.
function RestrictedField({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-sunken px-3.5 py-2.5">
      <span className="text-[0.8125rem] text-ink-secondary">{label}</span>
      <span className="text-[0.8125rem] text-ink-tertiary">Restricted</span>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const employee = mockEmployees.find((e) => e.id === id);

  if (!employee) {
    return (
      <div className="p-8">
        <EmptyState icon={Briefcase} title="Employee not found" description="This profile may have been removed." />
      </div>
    );
  }

  const overviewTab = (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="font-medium text-ink-primary">Contact</h3>
        <InfoRow icon={Mail} label="Email" value={employee.email} />
        <InfoRow icon={Phone} label="Phone" value={employee.phone} />
        <InfoRow icon={MapPin} label="Office" value={`${employee.office}, ${employee.country}`} />
      </Card>
      <Card className="p-5">
        <h3 className="font-medium text-ink-primary">Skills</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {employee.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-sunken px-3 py-1 text-[0.8125rem] text-ink-secondary">
              {skill}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );

  const jobTab = (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="font-medium text-ink-primary">Position</h3>
        <InfoRow icon={Briefcase} label="Job title" value={employee.jobTitle} />
        <InfoRow icon={Building2} label="Department" value={employee.department} />
        <InfoRow icon={Award} label="Employment type" value={employee.employmentType.replace("-", " ")} />
        {employee.managerName ? <InfoRow icon={Clock3} label="Manager" value={employee.managerName} /> : null}
      </Card>
      <Card className="p-5">
        <h3 className="font-medium text-ink-primary">Compensation</h3>
        <div className="mt-3 space-y-2">
          <RestrictedField label="Base salary" />
          <RestrictedField label="Bank details" />
        </div>
      </Card>
    </div>
  );

  const comingSoon = (label: string) => (
    <EmptyState icon={FileText} title={`${label} — coming in a later pass`} description="This tab is scaffolded and will be wired up alongside the rest of the enhanced profile." />
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={employee.fullName} src={employee.avatarUrl} size="lg" />
          <div>
            <h1 className="font-display text-xl font-semibold text-ink-primary">{employee.fullName}</h1>
            <p className="text-[0.9375rem] text-ink-secondary">
              {employee.jobTitle} · {employee.department}
            </p>
            <div className="mt-1.5">
              <StatusBadge label={STATUS_LABEL[employee.status]} variant={STATUS_VARIANT[employee.status]} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Deactivate</Button>
          <Button>Edit</Button>
        </div>
      </Card>

      <Tabs
        items={[
          { id: "overview", label: "Overview", content: overviewTab },
          { id: "job", label: "Job", content: jobTab },
          { id: "performance", label: "Performance", content: comingSoon("Performance") },
          { id: "skills", label: "Skills & Certifications", content: comingSoon("Skills & Certifications") },
          { id: "training", label: "Training History", content: comingSoon("Training History") },
          { id: "assets", label: "Assets", content: comingSoon("Assets") },
          { id: "payroll", label: "Payroll", content: comingSoon("Payroll history") },
          { id: "attendance", label: "Attendance", content: comingSoon("Attendance") },
          { id: "leave", label: "Leave", content: comingSoon("Leave") },
          { id: "documents", label: "Documents", content: comingSoon("Documents") },
          { id: "timeline", label: "Timeline", content: comingSoon("Timeline") },
          { id: "notes", label: "Notes", content: comingSoon("Notes") },
        ]}
      />
    </div>
  );
}
